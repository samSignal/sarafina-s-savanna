<?php

namespace App\Http\Controllers;

use App\Models\EmailUnsubscribe;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EmailUnsubscribeController extends Controller
{
    /**
     * One-click unsubscribe from marketing emails (RFC 8058). The route is protected by
     * Laravel's `signed` middleware, so the URL itself (not a login session) is the proof
     * that this request is authorized to unsubscribe this address. Keyed by email rather
     * than user_id because some marketing mail (e.g. gift card notifications) goes to
     * recipients who don't have an account.
     */
    public function unsubscribe(Request $request, string $email): Response
    {
        $email = strtolower(trim($email));

        EmailUnsubscribe::firstOrCreate(['email' => $email]);

        if ($request->isMethod('post')) {
            // Mail clients send this as a background POST with no visible page (RFC 8058
            // one-click); the body is never shown to the user.
            return response('', 200);
        }

        return response()->view('emails.unsubscribed', ['email' => $email]);
    }
}
