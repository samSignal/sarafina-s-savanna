<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\GiftCard;
use App\Models\GiftCardTransaction;
use App\Services\LoyaltyService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Mail\OrderPlaced;
use App\Services\GiftCardService;
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
                    if ($order->payment_status === 'Paid') {
                        return response()->json(['received' => true]);
                    }

                    $order->update([
                        'status' => 'Completed',
                        'payment_status' => 'Paid',
                    ]);

                    try {
                        app(GiftCardService::class)->issueGiftCards($order);
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

                        // Send Order Confirmation Email
                        if ($order->user && $order->user->email) {
                            Mail::to($order->user->email)->send(new OrderPlaced($order));
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

