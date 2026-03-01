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
            // Reset the sequence for the users table id to the maximum existing id
            DB::statement("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users) + 1)");
            
            // Also do it for other tables that might have been seeded manually
            if (Schema::hasTable('products')) {
                DB::statement("SELECT setval('products_id_seq', (SELECT MAX(id) FROM products) + 1)");
            }
            if (Schema::hasTable('orders')) {
                DB::statement("SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders) + 1)");
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
