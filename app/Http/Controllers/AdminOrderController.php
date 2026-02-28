<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user', 'items'])
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

        if ($request->filled('delivery_status')) {
            $query->where('delivery_status', $request->string('delivery_status')->toString());
        }

        $orders = $query->limit(200)->get();

        return response()->json(
            $orders->map(function (Order $order) {
                $rate = (float) $order->exchange_rate ?: 1.0;

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
                    'exchange_rate' => $rate,
                    'total_gbp' => (float) $order->total_gbp,
                    'delivery_cost' => (float) $order->delivery_cost,
                    'points_redeemed' => (int) ($order->points_redeemed ?? 0),
                    'discount_amount' => (float) ($order->discount_amount ?? 0),
                    'gift_card_discount' => (float) ($order->gift_card_discount ?? 0),
                    'created_at' => $order->created_at,
                    'customer_id' => $order->user?->id,
                    'customer_name' => $order->user?->name,
                    'customer_email' => $order->user?->email,
                    'shipping_address' => [
                        'line1' => $order->shipping_address_line1,
                        'line2' => $order->shipping_address_line2,
                        'city' => $order->shipping_city,
                        'postcode' => $order->shipping_postcode,
                        'country' => $order->shipping_country,
                    ],
                    'items' => $order->items->map(function ($item) use ($rate) {
                        $unitPrice = (float) $item->unit_price;
                        $lineTotal = (float) $item->line_total;

                        return [
                            'id' => $item->id,
                            'product_name' => $item->product_name,
                            'quantity' => $item->quantity,
                            'unit_price' => $unitPrice,
                            'line_total' => $lineTotal,
                            'unit_price_gbp' => $unitPrice / $rate,
                            'line_total_gbp' => $lineTotal / $rate,
                        ];
                    }),
                ];
            })->all()
        );
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string',
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json(['message' => 'Order status updated']);
    }
}
