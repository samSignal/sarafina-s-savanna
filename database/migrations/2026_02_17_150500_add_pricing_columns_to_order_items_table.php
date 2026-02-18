<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            if (! Schema::hasColumn('order_items', 'unit_price')) {
                $table->decimal('unit_price', 10, 2)->default(0)->after('product_name');
            }

            if (! Schema::hasColumn('order_items', 'line_total')) {
                $table->decimal('line_total', 10, 2)->default(0)->after('quantity');
            }
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            if (Schema::hasColumn('order_items', 'unit_price')) {
                $table->dropColumn('unit_price');
            }

            if (Schema::hasColumn('order_items', 'line_total')) {
                $table->dropColumn('line_total');
            }
        });
    }
};

