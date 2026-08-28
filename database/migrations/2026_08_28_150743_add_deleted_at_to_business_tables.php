<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['users', 'promotions', 'banners'] as $table) {
            Schema::table($table, function (Blueprint $blueprint) use ($table) {
                if (! Schema::hasColumn($table, 'deleted_at')) {
                    $blueprint->softDeletes();
                }
            });
        }
    }

    public function down(): void
    {
        foreach (['users', 'promotions', 'banners'] as $table) {
            Schema::table($table, function (Blueprint $blueprint) use ($table) {
                if (Schema::hasColumn($table, 'deleted_at')) {
                    $blueprint->dropSoftDeletes();
                }
            });
        }
    }
};
