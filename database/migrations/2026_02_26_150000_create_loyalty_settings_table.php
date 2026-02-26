<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_settings', function (Blueprint $table) {
            $table->id();
            $table->decimal('max_redemption_percentage', 5, 2)->default(30.00);
            $table->decimal('min_order_amount_gbp', 10, 2)->default(0.00);
            $table->timestamps();
        });

        DB::table('loyalty_settings')->insert([
            'max_redemption_percentage' => 30.00,
            'min_order_amount_gbp' => 0.00,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_settings');
    }
};

