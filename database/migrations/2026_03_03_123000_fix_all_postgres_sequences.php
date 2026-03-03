<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (config('database.default') === 'pgsql') {
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

            foreach ($tables as $table) {
                if (Schema::hasTable($table)) {
                    // Check if sequence exists (standard naming convention)
                    // If table is empty, MAX(id) is NULL, setval might fail or set to NULL
                    // We use COALESCE(MAX(id), 0) + 1 to handle empty tables safely
                    try {
                        DB::statement("SELECT setval('{$table}_id_seq', COALESCE((SELECT MAX(id) FROM {$table}), 0) + 1, false)");
                    } catch (\Exception $e) {
                        // Ignore if sequence doesn't exist or other error
                    }
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse
    }
};
