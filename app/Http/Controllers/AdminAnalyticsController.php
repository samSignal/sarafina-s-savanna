<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

use App\Models\LoyaltyTransaction;

class AdminAnalyticsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // 0. Parse Dates
        $startDate = $request->query('start_date') ? Carbon::parse($request->query('start_date'))->startOfDay() : Carbon::now()->subDays(30)->startOfDay();
        $endDate = $request->query('end_date') ? Carbon::parse($request->query('end_date'))->endOfDay() : Carbon::now()->endOfDay();
        
        $diffInDays = $startDate->diffInDays($endDate);
        $previousStartDate = $startDate->copy()->subDays($diffInDays + 1);
        $previousEndDate = $startDate->copy()->subDay()->endOfDay();

        // 1. Total Revenue (in selected period)
        $totalRevenue = Order::where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum(DB::raw('COALESCE(total_gbp, total)'));
            
        // 2. Orders Count (in selected period)
        $ordersCount = Order::whereBetween('created_at', [$startDate, $endDate])
            ->count();
            
        $ordersPreviousCount = Order::whereBetween('created_at', [$previousStartDate, $previousEndDate])
            ->count();
            
        $ordersGrowth = $ordersPreviousCount > 0 ? (($ordersCount - $ordersPreviousCount) / $ordersPreviousCount) * 100 : ($ordersCount > 0 ? 100 : 0);

        // 3. Products Count (Total in system)
        $productsCount = Product::count();
        
        // 4. Active Now (Users active in last 24 hours)
        $activeNow = User::where('updated_at', '>=', Carbon::now()->subDay())->count();

        // 5. Loyalty Stats (Total Issued vs Redeemed in period)
        $loyaltyIssued = LoyaltyTransaction::whereIn('type', ['earned', 'bonus'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('points');
            
        $loyaltyRedeemed = abs(LoyaltyTransaction::where('type', 'redeemed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('points'));

        // 6. Overview Chart
        // If range <= 31 days, show Daily. Else show Monthly.
        if ($diffInDays <= 31) {
            $dateFormat = '%Y-%m-%d'; // Daily
            $displayFormat = 'M d'; // e.g. Jan 01
            $groupBy = 'day_date';
        } else {
            $dateFormat = '%Y-%m'; // Monthly
            $displayFormat = 'M Y'; // e.g. Jan 2024
            $groupBy = 'month_year';
        }

        $revenueData = Order::select(
            DB::raw('sum(COALESCE(total_gbp, total)) as total'), 
            DB::raw("DATE_FORMAT(created_at, '$dateFormat') as date_key"),
            DB::raw("DATE_FORMAT(created_at, '$dateFormat') as display_date")
        )
        ->whereBetween('created_at', [$startDate, $endDate])
        ->where('status', '!=', 'cancelled')
        ->groupBy('date_key', 'display_date')
        ->orderBy('date_key')
        ->get();

        // Fill in missing dates? For simplicity, we send what we have, chart libraries often handle gaps or we can zero-fill in frontend or here.
        // Let's just map it directly for now.
        $chartData = $revenueData->map(function($item) use ($diffInDays) {
            return [
                'name' => $diffInDays <= 31 ? Carbon::parse($item->date_key)->format('M d') : Carbon::parse($item->date_key)->format('M Y'),
                'total' => (float)$item->total
            ];
        });

        // 6. Recent Sales (Latest in the selected period)
        $recentSales = Order::with('user')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function($order) {
                $initials = 'G';
                if ($order->user) {
                    $parts = explode(' ', $order->user->name);
                    $initials = '';
                    foreach(array_slice($parts, 0, 2) as $part) {
                        $initials .= strtoupper(substr($part, 0, 1));
                    }
                }
                
                return [
                    'id' => $order->id,
                    'name' => $order->user ? $order->user->name : 'Guest',
                    'email' => $order->user ? $order->user->email : 'N/A',
                    'amount' => (float)($order->total_gbp ?? $order->total),
                    'currency' => $order->currency ?? 'GBP',
                    'original_amount' => (float)$order->total,
                    'initials' => $initials,
                ];
            });

        return response()->json([
            'total_revenue' => (float)$totalRevenue,
            'orders_count' => $ordersCount,
            'orders_growth' => round($ordersGrowth, 1),
            'products_count' => $productsCount,
            'active_now' => $activeNow,
            'loyalty_stats' => [
                'issued' => (int)$loyaltyIssued,
                'redeemed' => (int)$loyaltyRedeemed
            ],
            'chart_data' => $chartData,
            'recent_sales' => $recentSales,
            'period' => [
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
                'diff_days' => $diffInDays
            ]
        ]);
    }
}
