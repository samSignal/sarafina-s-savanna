<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admin_sent_emails', function (Blueprint $table) {
            $table->string('thread_id')->nullable()->index();
            $table->text('cc')->nullable();
            $table->text('bcc')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('admin_sent_emails', function (Blueprint $table) {
            $table->dropColumn(['thread_id', 'cc', 'bcc']);
        });
    }
};

