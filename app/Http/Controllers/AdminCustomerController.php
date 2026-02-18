<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminCustomerController extends Controller
{
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
            'loyalty_ledger' => [],
            'gift_cards' => [],
            'stokvel' => null,
            'messages' => [],
        ]);
    }
}
