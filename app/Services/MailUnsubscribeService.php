<?php

namespace App\Services;

use App\Models\EmailUnsubscribe;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Support\Facades\URL;

class MailUnsubscribeService
{
    public function isUnsubscribed(string $email): bool
    {
        return EmailUnsubscribe::where('email', strtolower(trim($email)))->exists();
    }

    public function urlFor(string $email): string
    {
        return URL::signedRoute('email.unsubscribe', ['email' => strtolower(trim($email))]);
    }

    public function headersFor(string $email): Headers
    {
        $url = $this->urlFor($email);
        $supportAddress = config('mail.from_addresses.support');

        return new Headers(
            text: [
                'List-Unsubscribe' => "<{$url}>, <mailto:{$supportAddress}?subject=unsubscribe>",
                'List-Unsubscribe-Post' => 'List-Unsubscribe=One-Click',
            ],
        );
    }
}
