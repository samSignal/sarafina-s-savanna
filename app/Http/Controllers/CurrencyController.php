<?php

namespace App\Http\Controllers;

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

        $rates = [];

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

        return response()->json([
            'base' => $base,
            'currencies' => $currencies,
        ]);
    }
}
