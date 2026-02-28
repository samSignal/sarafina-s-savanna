<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\DeliverySetting;
use App\Models\GiftCard;
use App\Models\GiftCardTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use App\Mail\GiftCardIssued;
use App\Mail\GiftCardRedeemed;
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
            'items.*.metadata' => ['nullable', 'array'],
            'currency' => ['nullable', 'string', 'size:3'],
            'rate' => ['nullable', 'numeric', 'min:0'],
            'shipping_method' => ['required', 'string', 'in:collection,delivery'],
            'shipping_address' => ['required_if:shipping_method,delivery', 'nullable', 'array'],
            'contact_person' => ['required_if:shipping_method,delivery', 'nullable', 'string'],
            'contact_phone' => ['nullable', 'string'],
            'points_redeemed' => ['nullable', 'integer', 'min:0'],
            'gift_card_codes' => ['nullable', 'array'],
            'gift_card_codes.*' => ['string', 'exists:gift_cards,code'],
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
        $eligibleTotalGbp = 0; // For loyalty points redemption (excludes gift cards)
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
                // Let's preserve existing logic to avoid breaking pricing.
                $baseUnitPrice = $product->price_international ?? $product->price;
                $displayUnitPrice = $baseUnitPrice * $rate;
            }

            $lineTotal = $displayUnitPrice * $quantity;
            $total += $lineTotal;
            $totalGbp += $baseUnitPriceGbp * $quantity;

            if ($product->type !== 'gift_card') {
                $eligibleTotalGbp += $baseUnitPriceGbp * $quantity;
            }

            $orderItemsData[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'unit_price' => $displayUnitPrice, // In selected currency
                'quantity' => $quantity,
                'line_total' => $lineTotal, // In selected currency
                'metadata' => array_merge($item['metadata'] ?? [], ['base_price_gbp' => $baseUnitPriceGbp]),
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
            $eligibleTotalGbp += $deliveryCostGbp; // Delivery is eligible for points redemption
        }

        // Loyalty Redemption Logic
        $pointsRedeemed = $validated['points_redeemed'] ?? 0;
        $discountAmount = 0;

        if ($pointsRedeemed > 0) {
            if ($user->points_balance < $pointsRedeemed) {
                return response()->json(['message' => 'Insufficient points balance'], 422);
            }

            $loyaltySetting = \App\Models\LoyaltySetting::first();
            $percentage = $loyaltySetting ? ((float) $loyaltySetting->max_redemption_percentage / 100.0) : 0.30;
            $minAmount = $loyaltySetting ? (float) $loyaltySetting->min_order_amount_gbp : 0.0;
            
            // Check against ELIGIBLE total
            if ($eligibleTotalGbp < $minAmount) {
                return response()->json(['message' => 'Eligible order amount is below the minimum required to redeem points'], 422);
            }
            
            // Calculate max points based on ELIGIBLE total
            $maxPoints = floor($eligibleTotalGbp * $percentage * 100);
            
            if ($pointsRedeemed > $maxPoints) {
                return response()->json(['message' => "Points redemption exceeds limit for eligible items. Max allowed: {$maxPoints}"], 422);
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

        // Gift Card Redemption Logic
        $giftCardDiscountGbp = 0;
        $giftCardUsage = [];

        if (!empty($validated['gift_card_codes'])) {
            $codes = array_unique($validated['gift_card_codes']);
            $cards = GiftCard::whereIn('code', $codes)
                ->where('status', 'active')
                ->where('balance', '>', 0)
                ->get();

            foreach ($cards as $card) {
                if ($card->expiry_date && now()->gt($card->expiry_date)) continue;

                $remainingOrderTotalGbp = max(0, $totalGbp - $giftCardDiscountGbp);
                if ($remainingOrderTotalGbp <= 0) break;

                $deductionGbp = min($remainingOrderTotalGbp, $card->balance);
                $giftCardDiscountGbp += $deductionGbp;

                $giftCardUsage[] = [
                    'card' => $card,
                    'amount' => $deductionGbp
                ];
            }
        }

        // Apply Gift Card Discount
        $giftCardDiscount = $giftCardDiscountGbp * $rate;
        $total -= $giftCardDiscount;
        $totalGbp -= $giftCardDiscountGbp;

        // Ensure non-negative
        if ($total < 0) $total = 0;
        if ($totalGbp < 0) $totalGbp = 0;

        $order = DB::transaction(function () use ($user, $total, $totalGbp, $rate, $orderItemsData, $currency, $shippingMethod, $shippingAddress, $validated, $deliveryCost, $pointsRedeemed, $discountAmount, $giftCardDiscount, $giftCardUsage) {
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
                'gift_card_discount' => $giftCardDiscount,
            ]);

            foreach ($orderItemsData as $itemData) {
                $order->items()->create($itemData);
            }

            // Deduct stock for physical products
            $physicalItems = $order->items->filter(function($item) {
                return $item->product && $item->product->type !== 'gift_card';
            });

            foreach ($physicalItems as $item) {
                $product = $item->product;
                
                // Decrease stock
                $newStock = max(0, $product->stock - $item->quantity);
                $product->stock = $newStock;

                // Update status
                $threshold = $product->low_stock_threshold ?? 10;
                if ($newStock === 0) {
                    $product->status = 'Out of Stock';
                } elseif ($newStock < $threshold) {
                    $product->status = 'Low Stock';
                } else {
                    $product->status = 'In Stock';
                }
                
                $product->save();
            }

            // Process Gift Card Usage
            foreach ($giftCardUsage as $usage) {
                $card = GiftCard::lockForUpdate()->find($usage['card']->id);
                $amount = $usage['amount']; // In GBP
                
                $card->balance -= $amount;
                if ($card->balance <= 0) {
                    $card->balance = 0; // Prevent negative floating point issues
                    $card->status = 'used';
                }
                $card->save();
                
                GiftCardTransaction::create([
                    'gift_card_id' => $card->id,
                    'order_id' => $order->id,
                    'amount' => $amount, // Transaction always in GBP? Yes, balances are GBP.
                    'type' => 'redemption',
                    'description' => 'Redemption for order ' . $order->order_number,
                ]);

                // Send redemption email
                if ($card->purchaser && $card->purchaser->email) {
                     Mail::to($card->purchaser->email)->send(new GiftCardRedeemed($card, $order, $amount));
                } elseif ($card->recipient_email) {
                     Mail::to($card->recipient_email)->send(new GiftCardRedeemed($card, $order, $amount));
                } else {
                    // Fallback to current user if they own the card (though RBAC might prevent others using it)
                    // But if a user adds a card to their account, they might want a notification?
                    // Usually we notify the "owner" or "recipient".
                    // If no purchaser/recipient email, we use the order email?
                    if ($user->email) {
                        Mail::to($user->email)->send(new GiftCardRedeemed($card, $order, $amount));
                    }
                }
            }

            return $order;
        });
        
        // Handle 100% covered by gift cards/points
        if ($total <= 0) {
            $order->payment_status = 'Paid';
            $order->status = 'Processing';
            $order->save();

            // Handle loyalty points earning for the paid amount (which is 0 here?)
            // Usually points are earned on amount paid. If paid 0, earn 0.
            // But if we want to give points on the order value covered by gift cards?
            // Usually no points on gift card redemptions.
            
            return response()->json(['url' => '/client/orders']);
        }

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
        $totalDiscountForStripe = $discountAmount + $giftCardDiscount;

        if ($totalDiscountForStripe > 0) {
            try {
                $coupon = Coupon::create([
                    'name' => 'Discount',
                    'amount_off' => (int) round($totalDiscountForStripe * 100),
                    'currency' => strtolower($currency),
                    'duration' => 'once',
                ]);
                $discounts = [['coupon' => $coupon->id]];
            } catch (\Throwable $e) {
                // If coupon creation fails, proceed without Stripe-level discount
                // This is risky as user will be overcharged. Should probably fail.
                return response()->json(['message' => 'Failed to apply discount: ' . $e->getMessage()], 500);
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

        if ($order->payment_status === 'Paid') {
            return response()->json($order->fresh()->load('items.product'));
        }

        DB::transaction(function () use ($order) {
            $order->update([
                'status' => 'Completed',
                'payment_status' => 'Paid',
            ]);

            // Generate Gift Cards for any gift card products in the order
            $order->load('items.product');
            
            // Prevent duplicate generation
            if (!GiftCard::where('order_id', $order->id)->exists()) {
                // Group gift card items by recipient email to create single cards for multiple denominations
                $giftCardItems = $order->items->filter(function($item) {
                    return $item->product && $item->product->type === 'gift_card';
                });

                if ($giftCardItems->isNotEmpty()) {
                    // Group by recipient email
                    $cardsToCreate = [];
                    
                    foreach ($giftCardItems as $item) {
                        $recipientEmail = $item->metadata['recipient_email'] ?? $order->user->email ?? null;
                        // Use a key that includes email to group them. If email is null, maybe group all nulls together?
                        // The frontend enforces an email, but let's be safe.
                        $key = $recipientEmail ?: 'self';
                        
                        if (!isset($cardsToCreate[$key])) {
                            $cardsToCreate[$key] = [
                                'recipient_email' => $recipientEmail,
                                'amount' => 0,
                                'items' => []
                            ];
                        }
                        
                        $basePriceGbp = $item->metadata['base_price_gbp'] ?? ($item->unit_price / ($order->exchange_rate ?: 1));
                        $cardsToCreate[$key]['amount'] += $basePriceGbp * $item->quantity;
                        $cardsToCreate[$key]['items'][] = $item;
                    }

                    foreach ($cardsToCreate as $data) {
                        if ($data['amount'] <= 0) continue;

                        $code = GiftCard::generateCode();
                        
                        $giftCard = GiftCard::create([
                            'code' => $code,
                            'initial_value' => $data['amount'],
                            'balance' => $data['amount'],
                            'status' => 'active',
                            'purchaser_id' => $order->user_id,
                            'recipient_email' => $data['recipient_email'],
                            'expiry_date' => now()->addYear(),
                            'order_id' => $order->id,
                        ]);

                        GiftCardTransaction::create([
                            'gift_card_id' => $giftCard->id,
                            'order_id' => $order->id,
                            'amount' => $data['amount'],
                            'type' => 'issuance',
                            'description' => 'Initial purchase',
                        ]);

                        if ($giftCard->recipient_email) {
                            Mail::to($giftCard->recipient_email)->send(new GiftCardIssued($giftCard));
                        }
                    }
                }
            }
        });

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
