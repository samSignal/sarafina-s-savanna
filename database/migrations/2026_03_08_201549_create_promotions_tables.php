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
        if (!Schema::hasTable('promotions')) {
            Schema::create('promotions', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->enum('type', ['product', 'holiday', 'flash']);
                $table->decimal('discount_percentage', 5, 2); // e.g., 20.00
                $table->timestamp('start_date')->nullable();
                $table->timestamp('end_date')->nullable();
                $table->string('banner_image')->nullable();
                $table->json('metadata')->nullable(); // For holiday details or other custom data
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        } else {
            Schema::table('promotions', function (Blueprint $table) {
                if (!Schema::hasColumn('promotions', 'banner_image')) {
                    $table->string('banner_image')->nullable();
                }
                if (!Schema::hasColumn('promotions', 'metadata')) {
                    $table->json('metadata')->nullable();
                }
            });
        }

        if (!Schema::hasTable('promotion_product')) {
            Schema::create('promotion_product', function (Blueprint $table) {
                $table->id();
                $table->foreignId('promotion_id')->constrained()->onDelete('cascade');
                $table->foreignId('product_id')->constrained()->onDelete('cascade');
                $table->timestamps();
            });
        }

        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'is_on_promotion')) {
                $table->boolean('is_on_promotion')->default(false);
            }
            if (!Schema::hasColumn('products', 'promotion_price')) {
                $table->decimal('promotion_price', 10, 2)->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['is_on_promotion', 'promotion_price']);
        });

        Schema::dropIfExists('promotion_product');
        Schema::dropIfExists('promotions');
    }
};
