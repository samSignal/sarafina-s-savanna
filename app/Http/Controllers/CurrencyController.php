<?php

namespace App\Http\Controllers;

use App\Models\ExchangeRate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class CurrencyController extends Controller
{
    public function index(Request $request)
    {
        $supported = [
            'GBP' => '£',
            'USD' => '$',
            'EUR' => '€',
            'ZAR' => 'R',
            'NGN' => '₦',
            'AUD' => '$',
            'CAD' => '$',
        ];

        $base = 'GBP';

        // Try to get from database first
        $exchangeRates = ExchangeRate::orderBy('currency_code')->get();
        $rates = $exchangeRates->pluck('rate', 'currency_code')->toArray();
        
        $lastUpdate = null;
        if ($exchangeRates->isNotEmpty()) {
            $lastUpdate = $exchangeRates->max('updated_at');
        }

        // Fallback to API if database is empty
        if (empty($rates)) {
            try {
                $response = Http::get('https://open.er-api.com/v6/latest/' . $base);

                if ($response->ok()) {
                    $data = $response->json();
                    if (isset($data['rates']) && is_array($data['rates'])) {
                        $rates = $data['rates'];
                    }
                }
            } catch (\Throwable $e) {
            }
        }

        $currencies = [];

        foreach ($supported as $code => $symbol) {
            $rate = 1.0;

            if (strtoupper($code) !== $base && isset($rates[$code])) {
                $rate = (float) $rates[$code];
            }

            if (strtoupper($code) === $base) {
                $rate = 1.0;
            }

            $currencies[] = [
                'code' => $code,
                'symbol' => $symbol,
                'rate' => $rate,
            ];
        }

        // Prepare all rates for admin view
        $allRates = [];
        foreach ($rates as $code => $rate) {
            $allRates[] = [
                'code' => $code,
                'rate' => (float) $rate,
            ];
        }

        return response()->json([
            'base' => $base,
            'currencies' => $currencies,
            'all_rates' => $allRates,
            'last_update' => $lastUpdate ? $lastUpdate->toIso8601String() : now()->toIso8601String(),
            'supported_count' => count($rates),
            // API usually updates every 24h, but we fetch hourly. 
            // We can estimate next update or just return current time + 1h.
            'next_update' => $lastUpdate ? $lastUpdate->addHour()->toIso8601String() : now()->addHour()->toIso8601String(),
        ]);
    }
}
