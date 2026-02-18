<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (! Schema::hasColumn('products', 'desired_net_price')) {
                $table->decimal('desired_net_price', 10, 2)->nullable()->after('price');
            }

            if (! Schema::hasColumn('products', 'price_uk_eu')) {
                $table->decimal('price_uk_eu', 10, 2)->nullable()->after('desired_net_price');
            }

            if (! Schema::hasColumn('products', 'price_international')) {
                $table->decimal('price_international', 10, 2)->nullable()->after('price_uk_eu');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'desired_net_price')) {
                $table->dropColumn('desired_net_price');
            }

            if (Schema::hasColumn('products', 'price_uk_eu')) {
                $table->dropColumn('price_uk_eu');
            }

            if (Schema::hasColumn('products', 'price_international')) {
                $table->dropColumn('price_international');
            }
        });
    }
};

