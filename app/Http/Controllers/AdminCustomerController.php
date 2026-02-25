<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminCustomerController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::withCount('orders')
            ->withSum('orders', 'total')
            ->orderByDesc('created_at')
            ->get();

        $customers = $users->map(function ($user) {
            $lastOrder = $user->orders()->latest()->first();
            $location = $lastOrder ? 
                implode(', ', array_filter([$lastOrder->shipping_city, $lastOrder->shipping_country])) 
                : 'Unknown';

            $orderCount = $user->orders_count;
            $status = 'Inactive';

            if ($orderCount >= 10) {
                $status = 'VIP';
            } elseif ($orderCount > 0) {
                $status = 'Active';
            }

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? 'N/A',
                'points_balance' => $user->points_balance ?? 0,
                'location' => $location,
                'orders' => $orderCount,
                'spent' => (float) $user->orders_sum_total,
                'status' => $status,
                'joinDate' => $user->created_at->format('Y-m-d'),
            ];
        });

        return response()->json($customers);
    }

    public function show(User $user): JsonResponse
    {
        $orders = $user->orders()
            ->orderByDesc('created_at')
            ->get();

        $orderCount = $orders->count();
        $totalSpent = (float) $orders->sum('total');

        $status = 'New';

        if ($orderCount >= 10) {
            $status = 'VIP';
        } elseif ($orderCount > 0) {
            $status = 'Active';
        }

        $addresses = $orders
            ->map(function ($order) {
                return [
                    'line1' => $order->shipping_address_line1,
                    'line2' => $order->shipping_address_line2,
                    'city' => $order->shipping_city,
                    'postcode' => $order->shipping_postcode,
                    'country' => $order->shipping_country,
                ];
            })
            ->filter(function ($address) {
                return $address['line1'] || $address['city'] || $address['postcode'] || $address['country'];
            })
            ->unique(function ($address) {
                return implode('|', $address);
            })
            ->values()
            ->all();

        return response()->json([
            'customer' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? null,
                'points_balance' => $user->points_balance ?? 0,
                'status' => $status,
                'order_count' => $orderCount,
                'total_spent' => $totalSpent,
                'created_at' => $user->created_at,
                'addresses' => $addresses,
            ],
            'orders' => $orders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'total' => (float) $order->total,
                    'currency' => $order->currency,
                    'created_at' => $order->created_at,
                ];
            })->all(),
            'loyalty_ledger' => $user->loyaltyTransactions()
                ->latest()
                ->take(20)
                ->get()
                ->map(function ($transaction) {
                    return [
                        'id' => $transaction->id,
                        'type' => $transaction->type,
                        'points' => $transaction->points,
                        'description' => $transaction->description,
                        'created_at' => $transaction->created_at,
                    ];
                })
                ->values()
                ->all(),
            'gift_cards' => [],
            'stokvel' => null,
            'messages' => [],
        ]);
    }
}
