<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class AdminSalesController extends Controller
{
    public function getStats(Request $request)
    {
        $startDate = $request->query('start_date') ? Carbon::parse($request->query('start_date'))->startOfDay() : Carbon::now()->subDays(30)->startOfDay();
        $endDate = $request->query('end_date') ? Carbon::parse($request->query('end_date'))->endOfDay() : Carbon::now()->endOfDay();

        $query = Order::where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$startDate, $endDate]);

        $totalRevenue = $query->sum(DB::raw('COALESCE(total_gbp, total)'));
        $giftCardUsage = $query->sum('gift_card_discount');
        $ordersCount = $query->count();
        $averageOrderValue = $ordersCount > 0 ? ($totalRevenue + $giftCardUsage) / $ordersCount : 0;
        
        // Calculate growth
        $diffInDays = $startDate->diffInDays($endDate);
        $previousStartDate = $startDate->copy()->subDays($diffInDays + 1);
        $previousEndDate = $startDate->copy()->subDay()->endOfDay();
        
        $previousRevenue = Order::where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$previousStartDate, $previousEndDate])
            ->sum(DB::raw('COALESCE(total_gbp, total)'));
            
        $revenueGrowth = $previousRevenue > 0 ? (($totalRevenue - $previousRevenue) / $previousRevenue) * 100 : ($totalRevenue > 0 ? 100 : 0);

        return response()->json([
            'total_revenue' => $totalRevenue,
            'gift_card_usage' => $giftCardUsage,
            'orders_count' => $ordersCount,
            'average_order_value' => $averageOrderValue,
            'revenue_growth' => round($revenueGrowth, 1),
        ]);
    }

    public function getChartData(Request $request)
    {
        $startDate = $request->query('start_date') ? Carbon::parse($request->query('start_date'))->startOfDay() : Carbon::now()->subDays(30)->startOfDay();
        $endDate = $request->query('end_date') ? Carbon::parse($request->query('end_date'))->endOfDay() : Carbon::now()->endOfDay();
        
        $diffInDays = $startDate->diffInDays($endDate);
        
        if ($diffInDays <= 31) {
            $dateFormat = '%Y-%m-%d';
            $groupBy = 'day_date';
        } else {
            $dateFormat = '%Y-%m';
            $groupBy = 'month_year';
        }

        $data = Order::select(
            DB::raw('sum(COALESCE(total_gbp, total)) as total'),
            DB::raw("DATE_FORMAT(created_at, '$dateFormat') as date_key")
        )
        ->whereBetween('created_at', [$startDate, $endDate])
        ->where('status', '!=', 'cancelled')
        ->groupBy(DB::raw("DATE_FORMAT(created_at, '$dateFormat')"))
        ->orderBy('date_key')
        ->get();

        return response()->json($data->map(function($item) use ($diffInDays) {
            return [
                'name' => $diffInDays <= 31 ? Carbon::parse($item->date_key)->format('M d') : Carbon::parse($item->date_key)->format('M Y'),
                'total' => (float)$item->total
            ];
        }));
    }

    public function getRecentSales(Request $request)
    {
        $sales = Order::with('user')
            ->where('status', '!=', 'cancelled')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($sales);
    }

    public function getTopProducts(Request $request)
    {
        $startDate = $request->query('start_date') ? Carbon::parse($request->query('start_date'))->startOfDay() : Carbon::now()->subDays(30)->startOfDay();
        $endDate = $request->query('end_date') ? Carbon::parse($request->query('end_date'))->endOfDay() : Carbon::now()->endOfDay();

        $topProducts = OrderItem::select(
                'order_items.product_id',
                'order_items.product_name',
                DB::raw('sum(order_items.quantity) as total_quantity'),
                DB::raw('sum(order_items.line_total / COALESCE(orders.exchange_rate, 1)) as total_revenue')
            )
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', '!=', 'cancelled')
            ->groupBy('order_items.product_id', 'order_items.product_name')
            ->orderByDesc('total_revenue')
            ->take(5)
            ->get();

        return response()->json($topProducts);
    }
}
