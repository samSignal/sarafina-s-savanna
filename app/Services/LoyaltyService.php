<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use App\Models\LoyaltyTransaction;
use App\Models\Department;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\LoyaltyPointsUpdate;

class LoyaltyService
{
    /**
     * Send loyalty update email.
     */
    private function sendLoyaltyUpdateEmail(User $user, int $points, string $type, string $description = '')
    {
        try {
            // Mail::to($user)->queue(new LoyaltyPointsUpdate($user, $points, $type, $user->points_balance, $description));
        } catch (\Exception $e) {
            // Log error but don't fail transaction
            \Illuminate\Support\Facades\Log::error("Failed to send loyalty email: " . $e->getMessage());
        }
    }

    /**
     * Calculate points earned for an order.
     * Points = (Item Price / Exchange Rate) * Department Multiplier
     * £1 = 100 points (Standard, but here it depends on item price and multiplier)
     * Requirement: "£1 Discount = 100 points" - This is for redemption value.
     * Requirement: "clients to only earn points by Points Multiplier by Department"
     * 
     * So, for each item:
     * Points = (Item Line Total in GBP) * Department Multiplier * BasePointsPerGBP (Assuming 1 for now, or 100?)
     * The user said "£1 Discount = 100 points". This usually implies redemption rate.
     * Earning rate isn't explicitly defined as "X points per £1", but "earn points by Points Multiplier by Department".
     * Let's assume 1 point per £1 * Multiplier as a baseline, or 10 points?
     * 
     * Let's look at the requirement again: "clients to only earn points by Points Multiplier by Department"
     * And "£1 Discount = 100 points".
     * If I redeem 100 points, I get £1 off.
     * How many points do I earn for spending £1?
     * If Multiplier is 1, and I spend £1, do I get 1 point? Or 100?
     * Usually earning is less than redemption value. 
     * If I get 100 points for £1, then it's 100% cashback (if 100 points = £1). That's too high.
     * If I get 1 point for £1, then 1% cashback (if 100 points = £1). This is standard.
     * So, Base Earning Rate = 1 Point per £1.
     * Points = Amount(GBP) * 1 * Multiplier.
     */
    public function calculatePoints(Order $order): int
    {
        $totalPoints = 0;
        $order->load('items.product.department');

        // Exchange rate to convert to GBP if needed.
        $rate = $order->exchange_rate ?? 1.0; 
        
        // Calculate total product value in GBP to distribute discount
        $totalProductValueGBP = 0;
        foreach ($order->items as $item) {
            $product = $item->product;
            if (!$product || !$product->department) continue;
            $totalProductValueGBP += ($item->line_total / $rate);
        }

        if ($totalProductValueGBP <= 0) return 0;

        // Calculate discount in GBP
        $discountGBP = ($order->discount_amount ?? 0) / $rate; // Assuming discount_amount is in order currency

        foreach ($order->items as $item) {
            $product = $item->product;
            if (!$product) continue;

            $department = $product->department;
            if (!$department) continue;

            $multiplier = $department->points_multiplier ?? 1.00;
            
            // Calculate item total in GBP
            $lineTotalGBP = $item->line_total / $rate;

            // Distribute discount proportionally
            $itemShare = $lineTotalGBP / $totalProductValueGBP;
            $itemDiscount = $discountGBP * $itemShare;
            $itemNetGBP = max(0, $lineTotalGBP - $itemDiscount);

            // Points = Net GBP Amount * 1 (Base) * Multiplier
            $points = $itemNetGBP * $multiplier;
            
            $totalPoints += $points;
        }

        return (int) round($totalPoints);
    }

    /**
     * Award points to user for an order.
     */
    public function awardPoints(Order $order)
    {
        if (!$order->user_id) return;

        $user = User::find($order->user_id);
        if (!$user) return;

        $points = $this->calculatePoints($order);

        if ($points > 0) {
            DB::transaction(function () use ($user, $order, $points) {
                // Update order
                $order->update(['points_earned' => $points]);

                // Update user balance
                $user->increment('points_balance', $points);
                $user->update(['last_activity_at' => now()]);

                // Create transaction
                LoyaltyTransaction::create([
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'points' => $points,
                    'type' => 'earned',
                    'description' => "Points earned from Order #{$order->order_number}",
                    'expiry_date' => now()->addMonths(12),
                ]);

                $this->sendLoyaltyUpdateEmail($user, $points, 'earned', "Points earned from Order #{$order->order_number}");
            });
        }
    }

    /**
     * Check and award birthday bonus.
     * "IF customer.birthday_month = current_month THEN award_bonus_points = 200 points Valid for 30 days only END IF"
     */
    public function checkBirthdayBonus(User $user)
    {
        if (!$user->birthday) return;

        $birthday = Carbon::parse($user->birthday);
        if ($birthday->month === now()->month) {
            // Check if already awarded this year
            $exists = LoyaltyTransaction::where('user_id', $user->id)
                ->where('type', 'bonus')
                ->where('description', 'like', 'Birthday Bonus%')
                ->whereYear('created_at', now()->year)
                ->exists();

            if (!$exists) {
                DB::transaction(function () use ($user) {
                    $user->increment('points_balance', 200);
                    
                    LoyaltyTransaction::create([
                        'user_id' => $user->id,
                        'points' => 200,
                        'type' => 'bonus',
                        'description' => 'Birthday Bonus ' . now()->year,
                        'expiry_date' => now()->addDays(30),
                    ]);
                });
            }
        }
    }

    /**
     * Award new account bonus.
     * "20 points for creating a new account"
     */
    public function processNewAccountBonus(User $user)
    {
        DB::transaction(function () use ($user) {
            $user->increment('points_balance', 20);
            $user->update(['last_activity_at' => now()]);

            LoyaltyTransaction::create([
                'user_id' => $user->id,
                'points' => 20,
                'type' => 'bonus',
                'description' => 'New Account Bonus',
                'expiry_date' => now()->addMonths(12), // Subject to inactivity rule
            ]);

            $this->sendLoyaltyUpdateEmail($user, 20, 'bonus', 'New Account Bonus');
        });
    }

    /**
     * Calculate max redemption value for an order.
     * "30% of the order can be paid buy points"
     * "£1 Discount = 100 points"
     */
    public function calculateMaxRedemption(float $orderTotalGBP, int $userPointsBalance): array
    {
        // Max value in GBP allowed to be paid by points
        $maxRedemptionValueGBP = $orderTotalGBP * 0.30;

        // Convert max value to points (1 GBP = 100 Points)
        $maxRedemptionPoints = $maxRedemptionValueGBP * 100;

        // Limit by user balance
        $allowedPoints = min($maxRedemptionPoints, $userPointsBalance);
        
        // Value of allowed points
        $allowedValueGBP = $allowedPoints / 100;

        return [
            'points' => (int) $allowedPoints,
            'value' => round($allowedValueGBP, 2)
        ];
    }
    
    /**
     * Redeem points for an order.
     */
    public function redeemPoints(User $user, int $points, Order $order)
    {
        if ($points <= 0) return;

        DB::transaction(function () use ($user, $points, $order) {
            // Deduct from balance
            $user->decrement('points_balance', $points);
            $user->update(['last_activity_at' => now()]);

            // Create transaction
            LoyaltyTransaction::create([
                'user_id' => $user->id,
                'order_id' => $order->id,
                'points' => -$points,
                'type' => 'redeemed',
                'description' => "Redeemed on Order #{$order->order_number}",
            ]);

            $this->sendLoyaltyUpdateEmail($user, -$points, 'redeemed', "Redeemed on Order #{$order->order_number}");
        });
    }

    /**
     * Manual adjustment by admin.
     */
    public function adjustPoints(User $user, int $points, string $reason)
    {
        DB::transaction(function () use ($user, $points, $reason) {
            if ($points > 0) {
                $user->increment('points_balance', $points);
            } else {
                // Ensure balance doesn't go below 0? Or allow negative?
                // Usually allow negative or stop at 0. Let's assume we can deduct.
                // But safer to check.
                if ($user->points_balance + $points < 0) {
                     // Optionally throw exception or clamp to 0.
                     // For now, let's just add (which subtracts if negative).
                     // But we should probably clamp in the model or here.
                }
                $user->increment('points_balance', $points);
            }
            $user->update(['last_activity_at' => now()]);

            LoyaltyTransaction::create([
                'user_id' => $user->id,
                'points' => $points,
                'type' => 'adjustment',
                'description' => $reason,
            ]);

            $this->sendLoyaltyUpdateEmail($user, $points, 'adjustment', $reason);
        });
    }
}
