<?php

namespace App\Console\Commands;

use App\Models\GiftCard;
use App\Models\GiftCardAuditLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExpireGiftCards extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'gift-cards:expire';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expire gift cards that have passed their expiry date';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for expired gift cards...');

        $expiredCards = GiftCard::where('status', 'active')
            ->where('expiry_date', '<', now())
            ->get();

        if ($expiredCards->isEmpty()) {
            $this->info('No expired gift cards found.');
            return;
        }

        $count = 0;

        foreach ($expiredCards as $card) {
            try {
                DB::transaction(function () use ($card) {
                    $oldStatus = $card->status;
                    
                    $card->update(['status' => 'expired']);

                    GiftCardAuditLog::create([
                        'gift_card_id' => $card->id,
                        'user_id' => null, // System action
                        'action' => 'expired',
                        'details' => [
                            'reason' => 'Automatically expired by system cron job',
                            'expiry_date' => $card->expiry_date->format('Y-m-d'),
                            'old_status' => $oldStatus
                        ],
                        'ip_address' => '127.0.0.1' // System IP
                    ]);
                });
                
                $count++;
                $this->info("Expired gift card: {$card->code}");
            } catch (\Exception $e) {
                Log::error("Failed to expire gift card {$card->id}: " . $e->getMessage());
                $this->error("Failed to expire gift card {$card->code}");
            }
        }

        $this->info("Successfully expired {$count} gift cards.");
    }
}
