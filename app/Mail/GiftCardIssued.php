<?php

namespace App\Mail;

use App\Models\GiftCard;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GiftCardIssued extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $giftCard;

    /**
     * Create a new message instance.
     */
    public function __construct(GiftCard $giftCard)
    {
        $this->giftCard = $giftCard;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "You've received a Gift Card from Sarafina's Savanna!",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.gift-card-issued',
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
