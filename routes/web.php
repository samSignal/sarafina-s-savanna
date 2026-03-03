<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

Route::get('/fix-sequences', function () {
    if (config('database.default') !== 'pgsql') {
        return 'Not PostgreSQL, skipping sequence fix.';
    }

    $tables = [
        'users',
        'products',
        'orders',
        'order_items',
        'loyalty_transactions',
        'gift_cards',
        'gift_card_transactions',
        'gift_card_audit_logs',
        'categories',
        'departments',
        'delivery_settings',
        'loyalty_settings',
        'general_settings'
    ];

    $results = [];

    foreach ($tables as $table) {
        if (Schema::hasTable($table)) {
            try {
                // Get the current max ID
                $maxId = DB::table($table)->max('id') ?? 0;
                $nextId = $maxId + 1;

                // Reset the sequence
                DB::statement("SELECT setval('{$table}_id_seq', {$nextId}, false)");

                $results[$table] = "Fixed: Max ID is {$maxId}, Sequence set to {$nextId}";
            } catch (\Exception $e) {
                $results[$table] = "Error: " . $e->getMessage();
            }
        } else {
            $results[$table] = "Table not found";
        }
    }

    return response()->json($results);
});

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
