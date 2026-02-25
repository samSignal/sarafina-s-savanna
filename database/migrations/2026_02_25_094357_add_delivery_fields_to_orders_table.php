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
            $table->decimal('delivery_cost', 10, 2)->default(0)->after('total_gbp');
            $table->string('delivery_status')->nullable()->after('status');
            $table->timestamp('estimated_delivery_date')->nullable()->after('delivery_status');
            $table->string('contact_person')->nullable()->after('shipping_country');
            $table->string('contact_phone')->nullable()->after('contact_person');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'delivery_cost',
                'delivery_status',
                'estimated_delivery_date',
                'contact_person',
                'contact_phone'
            ]);
        });
    }
};
