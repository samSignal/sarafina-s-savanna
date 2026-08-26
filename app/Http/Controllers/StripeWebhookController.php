<?php

namespace App\Http\Controllers;

use App\Mail\OrderPlaced;
use App\Models\Order;
use App\Models\Refund;
use App\Services\GiftCardService;
use App\Services\LoyaltyService;
use App\Services\RefundService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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
            if (! app()->environment('local')) {
                Log::error('Stripe webhook secret is not configured');

                return response()->json(['message' => 'Webhook is not configured'], 500);
            }

            if (! $sigHeader) {
                return response()->json(['message' => 'Missing signature'], 400);
            }

            $data = json_decode($payload, true);

            if (! is_array($data)) {
                return response()->json(['message' => 'Invalid payload'], 400);
            }

            $event = StripeEvent::constructFrom($data);
        }

        if ($event->type === 'checkout.session.completed') {
            $this->handleCheckoutSessionCompleted($event->data->object);
        }

        if ($event->type === 'charge.refunded') {
            $this->handleChargeRefunded($event->data->object);
        }

        return response()->json(['received' => true]);
    }

    protected function handleCheckoutSessionCompleted($session)
    {
        $orderId = $session->metadata->order_id ?? null;

        if (! $orderId) {
            return;
        }

        DB::transaction(function () use ($orderId, $session) {
            // Row-locked, authoritative "already processed?" check: this handler can race
            // the client's own /checkout/confirm call for the same order, and only one of
            // them should ever award points / issue gift cards.
            $order = Order::where('id', $orderId)->lockForUpdate()->first();

            if (! $order || $order->payment_status === 'Paid') {
                return;
            }

            $order->update([
                'status' => 'Completed',
                'payment_status' => 'Paid',
                'stripe_payment_intent_id' => $session->payment_intent,
            ]);

            try {
                app(GiftCardService::class)->issueGiftCards($order);
            } catch (\Exception $e) {
                Log::error("Gift Card creation failed for order {$order->id}: ".$e->getMessage());
            }

            // Award Loyalty Points. Points redeemed toward this order were already reserved
            // and deducted at checkout-session creation time, so they are not touched here.
            try {
                app(LoyaltyService::class)->awardPoints($order);

                if ($order->user && $order->user->email) {
                    Mail::to($order->user->email)->send(new OrderPlaced($order));
                }
            } catch (\Exception $e) {
                Log::error("Loyalty processing failed for order {$order->id}: ".$e->getMessage());
            }
        });
    }

    protected function handleChargeRefunded($charge)
    {
        $paymentIntentId = $charge->payment_intent;
        $amountRefunded = $charge->amount_refunded / 100; // Convert cents to main currency unit
        $stripeRefund = $charge->refunds->data[0] ?? null; // Get latest refund object if possible
        $refundId = $stripeRefund->id ?? null;

        // Find Order by Payment Intent
        $order = Order::where('stripe_payment_intent_id', $paymentIntentId)->first();

        if ($order && $stripeRefund) {
            // Check if we already have this refund recorded (by Stripe Refund ID)
            // If the refund was initiated by our system, we stored the ID.
            // If initiated externally, we won't find it.

            // Check for metadata first (Internal Refund)
            $internalRefundId = $stripeRefund->metadata->refund_id ?? null;
            $existingRefund = null;

            if ($internalRefundId) {
                $existingRefund = Refund::find($internalRefundId);
                // If found, ensure stripe_refund_id is set
                if ($existingRefund) {
                    if (! $existingRefund->stripe_refund_id) {
                        $existingRefund->stripe_refund_id = $stripeRefund->id;
                        $existingRefund->save();
                    }
                }
            } else {
                // If no metadata, try to find by stripe_refund_id
                $existingRefund = Refund::where('stripe_refund_id', $stripeRefund->id)->first();
            }

            if (! $existingRefund) {
                // Create new Refund record for external refund
                // We don't know the items, so we just record the amount.
                // And we should probably deduct loyalty points.

                try {
                    // Use a service method or direct creation?
                    // Direct creation to avoid circular dependency or complex logic for items.

                    $refund = Refund::create([
                        'order_id' => $order->id,
                        'stripe_refund_id' => $stripeRefund->id,
                        'amount' => $stripeRefund->amount / 100,
                        'reason' => 'External Stripe Refund',
                        'status' => 'processed',
                        'admin_id' => null, // System
                        'notes' => 'Detected via Webhook',
                    ]);

                    // Deduct Loyalty
                    $refundService = app(RefundService::class);
                    $refundService->deductLoyaltyPoints($order, $refund->amount);

                    Log::info("External refund recorded for Order #{$order->order_number}");

                } catch (\Exception $e) {
                    Log::error("Failed to record external refund for Order #{$order->order_number}: ".$e->getMessage());
                }
            }
        }
    }
}
