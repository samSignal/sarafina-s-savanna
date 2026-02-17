<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;

class CheckoutController extends Controller
{
    public function createSession(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $items = $validated['items'];

        $products = Product::whereIn('id', collect($items)->pluck('product_id'))->get()->keyBy('id');

        if ($products->isEmpty()) {
            return response()->json(['message' => 'No valid products found'], 422);
        }

        $total = 0;
        $orderItemsData = [];

        foreach ($items as $item) {
            $product = $products[$item['product_id']] ?? null;

            if (! $product) {
                continue;
            }

            $quantity = $item['quantity'];
            $lineTotal = $product->price * $quantity;
            $total += $lineTotal;

            $orderItemsData[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'unit_price' => $product->price,
                'quantity' => $quantity,
                'line_total' => $lineTotal,
            ];
        }

        if (! $orderItemsData) {
            return response()->json(['message' => 'No valid cart items'], 422);
        }

        $order = DB::transaction(function () use ($user, $total, $orderItemsData) {
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => strtoupper(Str::random(10)),
                'total' => $total,
                'total_amount' => $total,
                'status' => 'Pending',
                'payment_status' => 'Pending',
            ]);

            foreach ($orderItemsData as $itemData) {
                $order->items()->create($itemData);
            }

            return $order;
        });

        if (! class_exists(\Stripe\Checkout\Session::class)) {
            return response()->json([
                'message' => 'Stripe is not installed on the server. Run "composer require stripe/stripe-php".',
            ], 500);
        }

        $secret = config('services.stripe.secret');

        if (! $secret) {
            return response()->json(['message' => 'Stripe is not configured'], 500);
        }

        Stripe::setApiKey($secret);

        $origin = $request->headers->get('origin') ?: config('app.url');

        $lineItems = [];

        foreach ($orderItemsData as $itemData) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'zar',
                    'product_data' => [
                        'name' => $itemData['product_name'],
                    ],
                    'unit_amount' => (int) round($itemData['unit_price'] * 100),
                ],
                'quantity' => $itemData['quantity'],
            ];
        }

        try {
            $session = StripeSession::create([
                'mode' => 'payment',
                'line_items' => $lineItems,
                'customer_email' => $user->email,
                'success_url' => rtrim($origin, '/') . '/my-orders?checkout=success',
                'cancel_url' => rtrim($origin, '/') . '/cart?checkout=cancelled',
                'metadata' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'user_id' => $user->id,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Stripe error: ' . $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'url' => $session->url,
        ]);
    }
}
