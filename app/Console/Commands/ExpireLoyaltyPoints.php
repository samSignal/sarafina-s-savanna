<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\LoyaltyTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\LoyaltyPointsUpdate;

class ExpireLoyaltyPoints extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'loyalty:expire-points';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expire loyalty points for users inactive for 12 months';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for expired loyalty points...');

        $cutoffDate = now()->subMonths(12);

        $users = User::where('points_balance', '>', 0)
            ->where(function ($query) use ($cutoffDate) {
                $query->where('last_activity_at', '<', $cutoffDate)
                      ->orWhereNull('last_activity_at');
            })
            ->get();

        if ($users->isEmpty()) {
            $this->info('No users found with expired points.');
            return;
        }

        $count = 0;
        foreach ($users as $user) {
            $points = $user->points_balance;
            
            DB::transaction(function () use ($user, $points) {
                $user->points_balance = 0;
                $user->save();

                LoyaltyTransaction::create([
                    'user_id' => $user->id,
                    'points' => -$points,
                    'type' => 'expired',
                    'description' => 'Points expired due to inactivity',
                ]);
            });

            try {
                // Mail::to($user)->queue(new LoyaltyPointsUpdate($user, -$points, 'expired', 0, 'Points expired due to inactivity'));
            } catch (\Exception $e) {
                $this->error("Failed to send email to {$user->email}: " . $e->getMessage());
            }

            $this->info("Expired {$points} points for user: {$user->email}");
            $count++;
        }

        $this->info("Successfully expired points for {$count} users.");
    }
}
