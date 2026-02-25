<?php

namespace App\Http\Controllers;

use App\Models\DeliverySetting;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminDeliveryController extends Controller
{
    public function getSettings(): JsonResponse
    {
        $setting = DeliverySetting::firstOrCreate(
            ['id' => 1],
            ['cost' => 5.00]
        );
        
        return response()->json($setting);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cost' => 'required|numeric|min:0',
        ]);

        $setting = DeliverySetting::firstOrCreate(['id' => 1]);
        $setting->update($validated);

        return response()->json($setting);
    }

    public function getDeliveries(Request $request): JsonResponse
    {
        $query = Order::where('shipping_method', 'delivery');

        if ($request->filled('q')) {
            $term = $request->string('q')->toString();
            $query->where(function ($q) use ($term) {
                $q->where('order_number', 'like', '%' . $term . '%')
                  ->orWhere('contact_person', 'like', '%' . $term . '%')
                  ->orWhere('shipping_address_line1', 'like', '%' . $term . '%')
                  ->orWhere('shipping_city', 'like', '%' . $term . '%');
            });
        }

        if ($request->filled('status')) {
            $query->where('delivery_status', $request->string('status')->toString());
        }

        $orders = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer' => $order->contact_person ?? 'N/A',
                    'contact_phone' => $order->contact_phone,
                    'address' => implode(', ', array_filter([
                        $order->shipping_address_line1,
                        $order->shipping_address_line2,
                        $order->shipping_city,
                        $order->shipping_postcode,
                        $order->shipping_country
                    ])),
                    'status' => $order->delivery_status ?? 'Pending',
                    'eta' => $order->estimated_delivery_date ? $order->estimated_delivery_date->format('Y-m-d H:i') : null,
                    'created_at' => $order->created_at->format('Y-m-d H:i'),
                ];
            });

        return response()->json($orders);
    }

    public function updateDeliveryStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string',
            'eta' => 'nullable|date',
        ]);

        $order->update([
            'delivery_status' => $validated['status'],
            'estimated_delivery_date' => $validated['eta'],
        ]);

        return response()->json(['message' => 'Delivery status updated']);
    }
}
