<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user'])
            ->latest();

        if ($request->filled('q')) {
            $term = $request->string('q')->toString();

            $query->where(function ($q) use ($term) {
                $q->where('order_number', 'like', '%' . $term . '%')
                    ->orWhereHas('user', function ($userQuery) use ($term) {
                        $userQuery->where('name', 'like', '%' . $term . '%')
                            ->orWhere('email', 'like', '%' . $term . '%');
                    });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->string('payment_status')->toString());
        }

        $orders = $query->limit(200)->get();

        return response()->json(
            $orders->map(function (Order $order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'total' => (float) $order->total,
                    'currency' => $order->currency,
                    'exchange_rate' => (float) $order->exchange_rate,
                    'total_gbp' => (float) $order->total_gbp,
                    'created_at' => $order->created_at,
                    'customer_id' => $order->user?->id,
                    'customer_name' => $order->user?->name,
                    'customer_email' => $order->user?->email,
                ];
            })->all()
        );
    }
}

