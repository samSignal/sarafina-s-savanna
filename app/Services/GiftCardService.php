<?php

namespace App\Services;

use App\Models\GiftCard;
use App\Models\GiftCardTransaction;
use App\Models\Order;
use App\Mail\GiftCardIssued;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GiftCardService
{
    /**
     * Issue gift cards for an order.
     * Prevents duplicate issuance by checking if cards exist for the order.
     */
    public function issueGiftCards(Order $order)
    {
        // Prevent duplicate generation
        if (GiftCard::where('order_id', $order->id)->exists()) {
            return;
        }

        $order->load('items.product');

        // Filter gift card items
        $giftCardItems = $order->items->filter(function($item) {
            return $item->product && $item->product->type === 'gift_card';
        });

        if ($giftCardItems->isEmpty()) {
            return;
        }

        // Group by recipient email
        $cardsToCreate = [];
        
        foreach ($giftCardItems as $item) {
            $recipientEmail = $item->metadata['recipient_email'] ?? $order->user->email ?? null;
            $senderName = $item->metadata['sender_name'] ?? $order->user->name ?? null;
            $message = $item->metadata['message'] ?? null;

            // Use a key that includes email to group them.
            $key = $recipientEmail ?: 'self';
            
            if (!isset($cardsToCreate[$key])) {
                $cardsToCreate[$key] = [
                    'recipient_email' => $recipientEmail,
                    'sender_name' => $senderName,
                    'message' => $message,
                    'amount' => 0,
                    'items' => []
                ];
            } else {
                // If message/sender is missing in the first item but present in subsequent ones, add it.
                if (empty($cardsToCreate[$key]['message']) && !empty($message)) {
                    $cardsToCreate[$key]['message'] = $message;
                }
                if (empty($cardsToCreate[$key]['sender_name']) && !empty($senderName)) {
                    $cardsToCreate[$key]['sender_name'] = $senderName;
                }
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
                'sender_name' => $data['sender_name'],
                'message' => $data['message'],
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

            // Send email
            if ($giftCard->recipient_email) {
                try {
                    Mail::to($giftCard->recipient_email)->send(new GiftCardIssued($giftCard));
                } catch (\Exception $e) {
                    Log::error("Failed to send Gift Card email to {$giftCard->recipient_email}: " . $e->getMessage());
                }
            }
        }
    }
}
