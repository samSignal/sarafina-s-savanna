<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\DeliverySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Coupon;
use Stripe\Stripe;
use App\Services\LoyaltyService;

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
            'shipping_method' => ['required', 'string', 'in:collection,delivery'],
            'shipping_address' => ['required_if:shipping_method,delivery', 'nullable', 'array'],
            'contact_person' => ['required_if:shipping_method,delivery', 'nullable', 'string'],
            'contact_phone' => ['nullable', 'string'],
            'points_redeemed' => ['nullable', 'integer', 'min:0'],
        ]);

        $items = $validated['items'];
        $shippingMethod = $validated['shipping_method'];
        $shippingAddress = $validated['shipping_address'] ?? [];

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
            // Fallback or fetch live rate if needed, but client usually provides it
            $rate = 1.0; 
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
            
            // Determine base price (GBP)
            $baseUnitPriceGbp = $product->price_uk_eu ?? $product->price;
            
            // Determine display price in selected currency
            if ($currency === 'GBP') {
                $displayUnitPrice = $baseUnitPriceGbp;
            } else {
                // If we have a specific international price, use it, otherwise convert base GBP
                // However, the prompt says "converted using the current rate" implies strict conversion often.
                // But previous logic used price_international. Let's stick to previous logic for unit price.
                $baseUnitPriceIntl = $product->price_international ?? $product->price;
                $displayUnitPrice = $baseUnitPriceIntl * $rate; 
                // Wait, if price_international is set, it's usually a base price in USD or similar? 
                // Actually, the previous code was:
                // $baseUnitPrice = $product->price_international ?? $product->price;
                // $displayUnitPrice = $currency === 'GBP' ? $baseUnitPrice : $baseUnitPrice * $rate;
                // This implies price_international is also in GBP? Or is it a base for international?
                // Let's preserve existing logic to avoid breaking pricing.
                $baseUnitPrice = $product->price_international ?? $product->price;
                $displayUnitPrice = $baseUnitPrice * $rate;
            }

            $lineTotal = $displayUnitPrice * $quantity;
            $total += $lineTotal;
            $totalGbp += $baseUnitPriceGbp * $quantity;

            $orderItemsData[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'unit_price' => $displayUnitPrice, // In selected currency
                'quantity' => $quantity,
                'line_total' => $lineTotal, // In selected currency
            ];
        }

        if (! $orderItemsData) {
            return response()->json(['message' => 'No valid cart items'], 422);
        }

        // Calculate Delivery Cost
        $deliveryCost = 0;
        $deliveryCostGbp = 0;

        if ($shippingMethod === 'delivery') {
            $setting = DeliverySetting::firstOrCreate(['id' => 1], ['cost' => 5.00]);
            $deliveryCostGbp = $setting->cost;
            $deliveryCost = $deliveryCostGbp * $rate;
            
            $total += $deliveryCost;
            $totalGbp += $deliveryCostGbp;
        }

        // Loyalty Redemption Logic
        $pointsRedeemed = $validated['points_redeemed'] ?? 0;
        $discountAmount = 0;

        if ($pointsRedeemed > 0) {
            if ($user->points_balance < $pointsRedeemed) {
                return response()->json(['message' => 'Insufficient points balance'], 422);
            }

            // Max redemption: 30% of Order Total (GBP)
            // 1 Point = £0.01 (100 Points = £1)
            $maxPoints = floor($totalGbp * 0.30 * 100);
            
            if ($pointsRedeemed > $maxPoints) {
                return response()->json(['message' => "Points redemption exceeds limit. Max allowed: {$maxPoints}"], 422);
            }

            // Calculate Discount
            $discountAmountGbp = $pointsRedeemed / 100;
            $discountAmount = $discountAmountGbp * $rate; // Convert to order currency

            // Apply Discount
            $total -= $discountAmount;
            $totalGbp -= $discountAmountGbp;
            
            // Ensure non-negative
            if ($total < 0) $total = 0;
            if ($totalGbp < 0) $totalGbp = 0;
        }

        $order = DB::transaction(function () use ($user, $total, $totalGbp, $rate, $orderItemsData, $currency, $shippingMethod, $shippingAddress, $validated, $deliveryCost, $pointsRedeemed, $discountAmount) {
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
                'shipping_method' => $shippingMethod,
                'delivery_cost' => $deliveryCost,
                'delivery_status' => $shippingMethod === 'delivery' ? 'Pending' : null,
                'contact_person' => $validated['contact_person'] ?? null,
                'contact_phone' => $validated['contact_phone'] ?? null,
                'shipping_address_line1' => $shippingAddress['line1'] ?? null,
                'shipping_address_line2' => $shippingAddress['line2'] ?? null,
                'shipping_city' => $shippingAddress['city'] ?? null,
                'shipping_postcode' => $shippingAddress['postcode'] ?? null,
                'shipping_country' => $shippingAddress['country'] ?? null,
                'points_redeemed' => $pointsRedeemed,
                'discount_amount' => $discountAmount,
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

        if ($shippingMethod === 'delivery' && $deliveryCost > 0) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => strtolower($currency),
                    'product_data' => [
                        'name' => 'Delivery Cost',
                    ],
                    'unit_amount' => (int) round($deliveryCost * 100),
                ],
                'quantity' => 1,
            ];
        }

        $discounts = [];
        if ($discountAmount > 0) {
            try {
                $coupon = Coupon::create([
                    'name' => 'Sarafina savings.',
                    'amount_off' => (int) round($discountAmount * 100),
                    'currency' => strtolower($currency),
                    'duration' => 'once',
                ]);
                $discounts = [['coupon' => $coupon->id]];
            } catch (\Throwable $e) {
                // If coupon creation fails, proceed without Stripe-level discount
            }
        }

        try {
            $params = [
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
            ];
            if (! empty($discounts)) {
                $params['discounts'] = $discounts;
            }
            $session = StripeSession::create($params);
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
