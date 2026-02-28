<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Columns from seeder that might be missing
            if (!Schema::hasColumn('orders', 'billing_address')) {
                $table->text('billing_address')->nullable();
            }
            if (!Schema::hasColumn('orders', 'shipping_address')) {
                $table->text('shipping_address')->nullable();
            }
            if (!Schema::hasColumn('orders', 'notes')) {
                $table->text('notes')->nullable();
            }
            if (!Schema::hasColumn('orders', 'payment_method')) {
                $table->string('payment_method')->nullable();
            }
            if (!Schema::hasColumn('orders', 'deleted_at')) {
                $table->timestamp('deleted_at')->nullable();
            }
            
            // Columns from other migrations that might have failed or not synced
            if (!Schema::hasColumn('orders', 'contact_person')) {
                $table->string('contact_person')->nullable();
            }
            if (!Schema::hasColumn('orders', 'contact_phone')) {
                $table->string('contact_phone')->nullable();
            }
            if (!Schema::hasColumn('orders', 'delivery_cost')) {
                $table->decimal('delivery_cost', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('orders', 'delivery_status')) {
                $table->string('delivery_status')->nullable();
            }
            if (!Schema::hasColumn('orders', 'estimated_delivery_date')) {
                $table->timestamp('estimated_delivery_date')->nullable();
            }
             if (!Schema::hasColumn('orders', 'exchange_rate')) {
                $table->decimal('exchange_rate', 10, 4)->default(1.0);
            }
            if (!Schema::hasColumn('orders', 'total_gbp')) {
                $table->decimal('total_gbp', 10, 2)->default(0);
            }
             if (!Schema::hasColumn('orders', 'points_redeemed')) {
                $table->integer('points_redeemed')->default(0);
            }
            if (!Schema::hasColumn('orders', 'discount_amount')) {
                $table->decimal('discount_amount', 10, 2)->default(0.00);
            }
            if (!Schema::hasColumn('orders', 'points_earned')) {
                $table->integer('points_earned')->default(0);
            }
            if (!Schema::hasColumn('orders', 'gift_card_discount')) {
                $table->decimal('gift_card_discount', 10, 2)->default(0);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We don't want to drop these columns in down() because they might have been added by other migrations
        // and we want to preserve data.
    }
};
