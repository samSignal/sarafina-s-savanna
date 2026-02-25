<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LoyaltyPointsUpdate extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $user;
    public $points;
    public $type;
    public $balance;
    public $description;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, int $points, string $type, int $balance, string $description = '')
    {
        $this->user = $user;
        $this->points = $points;
        $this->type = $type;
        $this->balance = $balance;
        $this->description = $description;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = match($this->type) {
            'earned' => 'You earned loyalty points!',
            'redeemed' => 'You redeemed loyalty points',
            'bonus' => 'You received bonus points!',
            'expired' => 'Your loyalty points have expired',
            'adjustment' => 'Loyalty points adjustment',
            default => 'Loyalty points update'
        };

        return new Envelope(
            subject: config('app.name') . ' - ' . $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.loyalty.update',
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
