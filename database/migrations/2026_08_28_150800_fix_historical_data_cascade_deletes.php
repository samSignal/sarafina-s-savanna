<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * order_items and loyalty_transactions store a snapshot of what happened (product name/price,
 * points earned) specifically so that history survives later changes to the referenced
 * product/user/order. Cascading their deletion defeats that — deleting a product or user
 * destroyed the historical rows outright instead of just detaching the now-gone reference.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
        });
        DB::statement('ALTER TABLE order_items MODIFY product_id BIGINT UNSIGNED NULL');
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('products')->nullOnDelete();
        });

        Schema::table('loyalty_transactions', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        DB::statement('ALTER TABLE loyalty_transactions MODIFY user_id BIGINT UNSIGNED NULL');
        Schema::table('loyalty_transactions', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('loyalty_transactions', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->foreign('order_id')->references('id')->on('orders')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('loyalty_transactions', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
        });

        Schema::table('loyalty_transactions', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        DB::statement('ALTER TABLE loyalty_transactions MODIFY user_id BIGINT UNSIGNED NOT NULL');
        Schema::table('loyalty_transactions', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
        });
        DB::statement('ALTER TABLE order_items MODIFY product_id BIGINT UNSIGNED NOT NULL');
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });
    }
};
