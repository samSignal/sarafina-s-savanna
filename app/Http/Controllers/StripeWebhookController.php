<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\GiftCard;
use App\Models\GiftCardTransaction;
use App\Services\LoyaltyService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\GiftCardIssued;
use Stripe\Event as StripeEvent;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret = config('services.stripe.webhook_secret');

        if ($secret) {
            try {
                $event = Webhook::constructEvent(
                    $payload,
                    $sigHeader,
                    $secret
                );
            } catch (\UnexpectedValueException $e) {
                return response()->json(['message' => 'Invalid payload'], 400);
            } catch (SignatureVerificationException $e) {
                return response()->json(['message' => 'Invalid signature'], 400);
            }
        } else {
            $data = json_decode($payload, true);

            if (! is_array($data)) {
                return response()->json(['message' => 'Invalid payload'], 400);
            }

            $event = StripeEvent::constructFrom($data);
        }

        if ($event->type === 'checkout.session.completed') {
            /** @var \Stripe\Checkout\Session $session */
            $session = $event->data->object;
            $orderId = $session->metadata->order_id ?? null;

            if ($orderId) {
                $order = Order::find($orderId);

                if ($order) {
                    $order->update([
                        'status' => 'Completed',
                        'payment_status' => 'Paid',
                    ]);

                    try {
                        // Load order items with products to check for gift cards
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
                                    $recipientEmail = $item->metadata['recipient_email'] ?? $order->email ?? null;
                                    $key = $recipientEmail ?: 'self';
                                    
                                    if (!isset($cardsToCreate[$key])) {
                                        $cardsToCreate[$key] = [
                                            'recipient_email' => $recipientEmail,
                                            'amount' => 0,
                                            'items' => []
                                        ];
                                    }
                                    
                                    // Use stored base GBP price if available, otherwise calculate
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
                                        'expiry_date' => Carbon::now()->addMonths(24),
                                        'recipient_email' => $data['recipient_email'],
                                        'purchaser_id' => $order->user_id,
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

                                    Log::info("Gift Card created: {$code} for Order {$order->id}");
                                }
                            }
                        }
                    } catch (\Exception $e) {
                        Log::error("Gift Card creation failed for order {$order->id}: " . $e->getMessage());
                    }

                    try {
                        $loyaltyService = app(LoyaltyService::class);
                        $loyaltyService->awardPoints($order);

                        if ($order->points_redeemed > 0) {
                            $user = $order->user;
                            if ($user) {
                                $loyaltyService->redeemPoints($user, $order->points_redeemed, $order);
                            }
                        }
                    } catch (\Exception $e) {
                        Log::error("Loyalty processing failed for order {$order->id}: " . $e->getMessage());
                    }
                }
            }
        }

        return response()->json(['received' => true]);
    }
}

