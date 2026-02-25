<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

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
            ->sum('total');
            
        // 2. Orders Count (in selected period)
        $ordersCount = Order::whereBetween('created_at', [$startDate, $endDate])
            ->count();
            
        $ordersPreviousCount = Order::whereBetween('created_at', [$previousStartDate, $previousEndDate])
            ->count();
            
        $ordersGrowth = $ordersPreviousCount > 0 ? (($ordersCount - $ordersPreviousCount) / $ordersPreviousCount) * 100 : ($ordersCount > 0 ? 100 : 0);

        // 3. Products Count (Total in system, not affected by date filter usually, but let's show New Products in period if requested? No, stick to Total for Dashboard usually)
        $productsCount = Product::count();
        
        // 4. Active Now (Users active in last 24 hours - standard metric)
        $activeNow = User::where('updated_at', '>=', Carbon::now()->subDay())->count();

        // 5. Overview Chart
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
            DB::raw('sum(total) as total'), 
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
                return [
                    'id' => $order->id,
                    'name' => $order->user ? $order->user->name : 'Guest', // Handle potential null user
                    'email' => $order->user ? $order->user->email : 'N/A',
                    'amount' => (float)$order->total,
                    'initials' => $order->user ? collect(explode(' ', $order->user->name))->map(fn($w) => strtoupper(substr($w, 0, 1)))->take(2)->join('') : 'G',
                ];
            });

        return response()->json([
            'total_revenue' => (float)$totalRevenue,
            'orders_count' => $ordersCount,
            'orders_growth' => round($ordersGrowth, 1),
            'products_count' => $productsCount,
            'active_now' => $activeNow,
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
