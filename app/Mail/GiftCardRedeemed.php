<?php

namespace App\Mail;

use App\Models\GiftCard;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GiftCardRedeemed extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $giftCard;
    public $order;
    public $amount;

    /**
     * Create a new message instance.
     */
    public function __construct(GiftCard $giftCard, Order $order, float $amount)
    {
        $this->giftCard = $giftCard;
        $this->order = $order;
        $this->amount = $amount;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Gift Card Redeemed - Sarafina's Savanna",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.gift-card-redeemed',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
