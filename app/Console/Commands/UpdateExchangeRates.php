<?php

namespace App\Console\Commands;

use App\Models\ExchangeRate;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UpdateExchangeRates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-exchange-rates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch latest exchange rates from API and update database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Fetching latest exchange rates...');

        try {
            $response = Http::get('https://open.er-api.com/v6/latest/GBP');

            if (!$response->ok()) {
                $this->error('Failed to fetch rates from API.');
                return 1;
            }

            $data = $response->json();
            $rates = $data['rates'] ?? [];

            if (empty($rates)) {
                $this->error('No rates found in API response.');
                return 1;
            }

            foreach ($rates as $code => $rate) {
                ExchangeRate::updateOrCreate(
                    ['currency_code' => strtoupper($code)],
                    ['rate' => (float) $rate]
                );
            }

            $this->info('Exchange rates updated successfully.');
            Log::info('Exchange rates updated successfully from API.');
            return 0;
        } catch (\Exception $e) {
            $this->error('An error occurred: ' . $e->getMessage());
            Log::error('Exchange rates update failed: ' . $e->getMessage());
            return 1;
        }
    }
}
