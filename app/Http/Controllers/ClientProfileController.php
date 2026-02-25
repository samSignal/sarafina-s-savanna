<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\LoyaltyTransaction;
use App\Services\LoyaltyService;

class ClientProfileController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'birthday' => 'nullable|date',
        ]);

        $user->update($validated);

        // Check for birthday bonus if birthday is set
        if ($user->wasChanged('birthday') && $user->birthday) {
            app(LoyaltyService::class)->checkBirthdayBonus($user);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh(),
        ]);
    }

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

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

        $loyaltyLedger = LoyaltyTransaction::where('user_id', $user->id)
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
            });

        return response()->json([
            'customer' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? null,
                'points_balance' => $user->points_balance ?? 0,
                'birthday' => $user->birthday,
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
                    'shipping_method' => $order->shipping_method,
                    'delivery_status' => $order->delivery_status,
                    'estimated_delivery_date' => $order->estimated_delivery_date,
                    'payment_status' => $order->payment_status,
                    'total' => (float) $order->total,
                    'currency' => $order->currency,
                    'created_at' => $order->created_at,
                ];
            })->all(),
            'loyalty_ledger' => $loyaltyLedger,
            'gift_cards' => [],
            'stokvel' => null,
            'messages' => [],
        ]);
    }
}
