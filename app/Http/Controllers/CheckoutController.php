<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
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
            'currency' => ['nullable', 'string', 'size:3'],
            'rate' => ['nullable', 'numeric', 'min:0'],
        ]);

        $items = $validated['items'];

        $products = Product::whereIn('id', collect($items)->pluck('product_id'))->get()->keyBy('id');

        if ($products->isEmpty()) {
            return response()->json(['message' => 'No valid products found'], 422);
        }

        $currency = strtoupper($validated['currency'] ?? 'GBP');

        if ($currency === 'GBP') {
            $rate = 1.0;
        } elseif (isset($validated['rate']) && (float) $validated['rate'] > 0) {
            $rate = (float) $validated['rate'];
        } else {
            $rate = $this->getExchangeRate($currency);
        }

        $total = 0;
        $totalGbp = 0;
        $orderItemsData = [];

        foreach ($items as $item) {
            $product = $products[$item['product_id']] ?? null;

            if (! $product) {
                continue;
            }

            $quantity = $item['quantity'];

            if ($currency === 'GBP') {
                $baseUnitPrice = $product->price_uk_eu ?? $product->price;
            } else {
                $baseUnitPrice = $product->price_international ?? $product->price;
            }

            $displayUnitPrice = $currency === 'GBP' ? $baseUnitPrice : $baseUnitPrice * $rate;
            $lineTotal = $displayUnitPrice * $quantity;
            $total += $lineTotal;
            $totalGbp += $baseUnitPrice * $quantity;

            $orderItemsData[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'unit_price' => $displayUnitPrice,
                'quantity' => $quantity,
                'line_total' => $lineTotal,
            ];
        }

        if (! $orderItemsData) {
            return response()->json(['message' => 'No valid cart items'], 422);
        }

        $order = DB::transaction(function () use ($user, $total, $totalGbp, $rate, $orderItemsData, $currency) {
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => strtoupper(Str::random(10)),
                'total' => $total,
                'total_amount' => $total,
                'currency' => $currency,
                'exchange_rate' => $rate,
                'total_gbp' => $totalGbp,
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
            $unitAmount = $itemData['unit_price'];

            $lineItems[] = [
                'price_data' => [
                    'currency' => strtolower($currency),
                    'product_data' => [
                        'name' => $itemData['product_name'],
                    ],
                    'unit_amount' => (int) round($unitAmount * 100),
                ],
                'quantity' => $itemData['quantity'],
            ];
        }

        try {
            $session = StripeSession::create([
                'mode' => 'payment',
                'line_items' => $lineItems,
                'customer_email' => $user->email,
                'success_url' => rtrim($origin, '/') . '/my-orders?checkout=success&session_id={CHECKOUT_SESSION_ID}',
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

    public function confirmSession(Request $request)
    {
        $validated = $request->validate([
            'session_id' => ['required', 'string'],
        ]);

        $secret = config('services.stripe.secret');

        if (! $secret) {
            return response()->json(['message' => 'Stripe is not configured'], 500);
        }

        Stripe::setApiKey($secret);

        try {
            $session = StripeSession::retrieve($validated['session_id']);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Unable to verify payment'], 400);
        }

        $orderId = $session->metadata->order_id ?? null;

        if (! $orderId) {
            return response()->json(['message' => 'Order not found for session'], 404);
        }

        $order = Order::find($orderId);

        if (! $order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $order->update([
            'status' => 'Completed',
            'payment_status' => 'Paid',
        ]);

        return response()->json($order->fresh()->load('items.product'));
    }

    private function getExchangeRate(string $currency): float
    {
        $code = strtoupper($currency);

        if ($code === 'GBP') {
            return 1.0;
        }

        try {
            $response = Http::get('https://open.er-api.com/v6/latest/GBP');

            if (! $response->ok()) {
                return 1.0;
            }

            $data = $response->json();

            if (! isset($data['rates'][$code])) {
                return 1.0;
            }

            return (float) $data['rates'][$code];
        } catch (\Throwable $e) {
            return 1.0;
        }
    }
}
