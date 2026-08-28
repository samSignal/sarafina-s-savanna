<?php

namespace App\Http\Controllers;

use App\Mail\GiftCardRedeemed;
use App\Mail\OrderPlaced;
use App\Models\DeliverySetting;
use App\Models\ExchangeRate;
use App\Models\GiftCard;
use App\Models\GiftCardTransaction;
use App\Models\Order;
use App\Models\Product;
use App\Services\GiftCardService;
use App\Services\LoyaltyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Coupon;
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
            'items.*.metadata' => ['nullable', 'array'],
            'currency' => ['nullable', 'string', 'size:3'],
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

        // The exchange rate must always be resolved server-side. A client-supplied rate
        // would let a caller charge an arbitrary fraction of the real price via Stripe.
        $rate = $this->getExchangeRate($currency);

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
            $originalUnitPriceGbp = $baseUnitPriceGbp;
            $promotionId = null;

            // Check for Active Promotion
            if ($product->is_on_promotion && $product->promotion_price > 0) {
                // Ideally we should verify the promotion is still active, but relying on is_on_promotion flag for performance
                // We can assume the background job or admin update keeps this in sync.
                // However, let's try to find the active promotion if possible to link it.
                $activePromotion = $product->promotions()->active()->first();

                if ($activePromotion) {
                    $baseUnitPriceGbp = $product->promotion_price;
                    $promotionId = $activePromotion->id;
                }
            }

            // Determine display price in selected currency
            if ($currency === 'GBP') {
                $displayUnitPrice = $baseUnitPriceGbp;
            } else {
                // Let's preserve existing logic to avoid breaking pricing.
                // If on promotion, we need to convert the promotion price (which is in GBP usually)
                if ($promotionId) {
                    $displayUnitPrice = $baseUnitPriceGbp * $rate;
                } else {
                    $baseUnitPrice = $product->price_international ?? $product->price;
                    $displayUnitPrice = $baseUnitPrice * $rate;
                }
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
                'promotion_id' => $promotionId,
                'original_unit_price' => ($currency === 'GBP' ? $originalUnitPriceGbp : ($product->price_international ?? $product->price) * $rate),
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

        // Loyalty Redemption Logic. These checks are a fast, friendly pre-validation only —
        // the authoritative check/reservation happens inside the transaction below against a
        // row-locked read of the user's balance, so two concurrent checkouts can't both
        // redeem the same points.
        $pointsRedeemed = $validated['points_redeemed'] ?? 0;

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
        }

        $giftCardCodes = ! empty($validated['gift_card_codes']) ? array_values(array_unique($validated['gift_card_codes'])) : [];

        try {
            $order = DB::transaction(function () use (
                $user, $total, $totalGbp, $rate, $orderItemsData, $currency, $shippingMethod,
                $shippingAddress, $validated, $deliveryCost, $pointsRedeemed, $giftCardCodes
            ) {
                // Reserve loyalty points atomically against a row-locked balance.
                $discountAmountGbp = 0;
                $lockedUser = null;

                if ($pointsRedeemed > 0) {
                    $lockedUser = \App\Models\User::where('id', $user->id)->lockForUpdate()->first();

                    if (! $lockedUser || $lockedUser->points_balance < $pointsRedeemed) {
                        throw new \RuntimeException('POINTS_INSUFFICIENT');
                    }

                    $discountAmountGbp = $pointsRedeemed / 100;
                }

                $discountAmount = $discountAmountGbp * $rate;
                $totalGbpAfterPoints = max(0, $totalGbp - $discountAmountGbp);
                $totalAfterPoints = max(0, $total - $discountAmount);

                // Reserve gift card balances atomically against row-locked balances, so two
                // concurrent checkouts can't both spend the same balance.
                $giftCardDiscountGbp = 0;
                $lockedCardUsage = [];

                foreach ($giftCardCodes as $code) {
                    $card = GiftCard::where('code', $code)
                        ->where('status', 'active')
                        ->lockForUpdate()
                        ->first();

                    if (! $card || $card->balance <= 0) {
                        continue;
                    }
                    if ($card->expiry_date && now()->gt($card->expiry_date)) {
                        continue;
                    }

                    $remainingOrderTotalGbp = max(0, $totalGbpAfterPoints - $giftCardDiscountGbp);
                    if ($remainingOrderTotalGbp <= 0) {
                        break;
                    }

                    $deductionGbp = min($remainingOrderTotalGbp, $card->balance);
                    if ($deductionGbp <= 0) {
                        continue;
                    }

                    $giftCardDiscountGbp += $deductionGbp;
                    $lockedCardUsage[] = ['card' => $card, 'amount' => $deductionGbp];
                }

                $giftCardDiscount = $giftCardDiscountGbp * $rate;
                $finalTotalGbp = max(0, $totalGbpAfterPoints - $giftCardDiscountGbp);
                $finalTotal = max(0, $totalAfterPoints - $giftCardDiscount);

                $order = Order::create([
                    'user_id' => $user->id,
                    'order_number' => strtoupper(Str::random(10)),
                    'total' => $finalTotal,
                    'total_amount' => $finalTotal,
                    'currency' => $currency,
                    'exchange_rate' => $rate,
                    'total_gbp' => $finalTotalGbp,
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
                $physicalItems = $order->items->filter(function ($item) {
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

                // Apply the reserved points redemption now that the order exists.
                if ($pointsRedeemed > 0 && $lockedUser) {
                    app(LoyaltyService::class)->redeemPoints($lockedUser, $pointsRedeemed, $order);
                }

                // Apply the reserved gift card deductions now that the order exists.
                foreach ($lockedCardUsage as $usage) {
                    $card = $usage['card'];
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
                        'description' => 'Redemption for order '.$order->order_number,
                    ]);

                    // Send redemption email
                    if ($card->purchaser && $card->purchaser->email) {
                        Mail::to($card->purchaser->email)->send(new GiftCardRedeemed($card, $order, $amount));
                    } elseif ($card->recipient_email) {
                        Mail::to($card->recipient_email)->send(new GiftCardRedeemed($card, $order, $amount));
                    } elseif ($user->email) {
                        // Fallback to current user if they own the card (though RBAC might prevent others using it)
                        Mail::to($user->email)->send(new GiftCardRedeemed($card, $order, $amount));
                    }
                }

                return $order;
            });
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'POINTS_INSUFFICIENT') {
                return response()->json(['message' => 'Insufficient points balance'], 422);
            }
            throw $e;
        }

        // Handle 100% covered by gift cards/points
        if ($order->total <= 0) {
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

        $origin = $request->headers->get('origin') ?: config('app.frontend_url');

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
        $totalDiscountForStripe = (float) $order->discount_amount + (float) $order->gift_card_discount;

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
                return response()->json(['message' => 'Failed to apply discount: '.$e->getMessage()], 500);
            }
        }

        try {
            $params = [
                'mode' => 'payment',
                'line_items' => $lineItems,
                'customer_email' => $user->email,
                'success_url' => rtrim($origin, '/').'/my-orders?checkout=success&session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => rtrim($origin, '/').'/cart?checkout=cancelled',
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
                'message' => 'Stripe error: '.$e->getMessage(),
            ], 500);
        }

        return response()->json([
            'url' => $session->url,
        ]);
    }

    public function confirmSession(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

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

        if (($session->payment_status ?? null) !== 'paid') {
            return response()->json(['message' => 'Payment not completed'], 400);
        }

        $orderId = $session->metadata->order_id ?? null;
        $sessionUserId = $session->metadata->user_id ?? null;

        if (! $orderId) {
            return response()->json(['message' => 'Order not found for session'], 404);
        }

        if ((string) $sessionUserId !== (string) $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $order = Order::find($orderId);

        if (! $order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if ((string) $order->user_id !== (string) $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->payment_status === 'Paid') {
            return response()->json($order->fresh()->load('items.product'));
        }

        DB::transaction(function () use ($orderId) {
            // Re-fetch with a row lock inside the transaction: this is the authoritative
            // "already processed?" check. The webhook can be racing this same order at the
            // same time, and only one of them should ever award points / issue gift cards.
            $order = Order::where('id', $orderId)->lockForUpdate()->first();

            if (! $order || $order->payment_status === 'Paid') {
                return;
            }

            $order->update([
                'status' => 'Completed',
                'payment_status' => 'Paid',
            ]);

            // Generate Gift Cards for any gift card products in the order
            try {
                app(GiftCardService::class)->issueGiftCards($order);
            } catch (\Exception $e) {
                // Log but don't fail transaction
                Log::error("Failed to issue gift cards for order {$order->id}: ".$e->getMessage());
            }

            // Award Loyalty Points. Points redeemed toward this order were already reserved
            // and deducted at checkout-session creation time, so they are not touched here.
            try {
                app(LoyaltyService::class)->awardPoints($order);
            } catch (\Exception $e) {
                Log::error("Loyalty processing failed for order {$order->id}: ".$e->getMessage());
            }

            // Send Order Confirmation Email
            if ($order->user && $order->user->email) {
                try {
                    Mail::to($order->user->email)->send(new OrderPlaced($order));
                } catch (\Exception $e) {
                    Log::error("Failed to send order confirmation email for order {$order->id}: ".$e->getMessage());
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

        // Try to get from database first
        $rate = ExchangeRate::where('currency_code', $code)->value('rate');

        if ($rate) {
            return (float) $rate;
        }

        // Fallback to API if not in database
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
