<?php

namespace App\Http\Controllers;

use App\Models\GiftCard;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;

class GiftCardController extends Controller
{
    public function products()
    {
        return Product::where('type', 'gift_card')
            ->where('status', '!=', 'Archived')
            ->orderBy('price')
            ->get();
    }

    public function validateCard(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string', 'regex:/^SARAFINA-[A-Z0-9]{4}-[A-Z0-9]{4}$/'],
        ]);

        $code = $request->input('code');
        $giftCard = GiftCard::where('code', $code)->first();

        if (!$giftCard) {
            return response()->json(['message' => 'Invalid gift card code.'], 404);
        }

        if ($giftCard->status !== 'active') {
            return response()->json(['message' => 'This gift card is inactive or has been used.'], 400);
        }

        if ($giftCard->expiry_date && Carbon::now()->gt($giftCard->expiry_date)) {
            return response()->json(['message' => 'This gift card has expired.'], 400);
        }

        if ($giftCard->balance <= 0) {
            return response()->json(['message' => 'This gift card has a zero balance.'], 400);
        }

        return response()->json([
            'code' => $giftCard->code,
            'balance' => $giftCard->balance,
            'expiry_date' => $giftCard->expiry_date,
        ]);
    }

    public function transactions(Request $request, $id)
    {
        $user = auth()->user();
        
        // Find card belonging to user (either purchaser or recipient)
        $giftCard = GiftCard::where('id', $id)
            ->where(function ($query) use ($user) {
                $query->where('purchaser_id', $user->id)
                      ->orWhere('recipient_email', $user->email);
            })
            ->first();

        if (!$giftCard) {
            return response()->json(['message' => 'Gift card not found or access denied'], 404);
        }

        $transactions = $giftCard->transactions()
            ->with('order:id,order_number')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($transactions);
    }
}
