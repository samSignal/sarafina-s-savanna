<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\LoyaltyTransaction;
use App\Services\LoyaltyService;
use Illuminate\Http\Request;

class AdminLoyaltyController extends Controller
{
    public function index()
    {
        return LoyaltyTransaction::with(['user:id,name,email', 'order:id,order_number'])
            ->latest()
            ->paginate(20);
    }

    public function stats()
    {
        return [
            'total_issued' => LoyaltyTransaction::whereIn('type', ['earned', 'bonus'])->sum('points') + 
                              LoyaltyTransaction::where('type', 'adjustment')->where('points', '>', 0)->sum('points'),
            'total_redeemed' => abs(LoyaltyTransaction::where('type', 'redeemed')->sum('points')),
            'total_expired' => abs(LoyaltyTransaction::where('type', 'expired')->sum('points')),
            'outstanding_balance' => User::sum('points_balance'),
        ];
    }

    public function adjust(Request $request, User $user)
    {
        $validated = $request->validate([
            'points' => 'required|integer',
            'reason' => 'required|string|max:255',
        ]);

        app(LoyaltyService::class)->adjustPoints(
            $user, 
            $validated['points'], 
            $validated['reason']
        );

        return response()->json([
            'message' => 'Points adjusted successfully', 
            'balance' => $user->fresh()->points_balance
        ]);
    }
}
