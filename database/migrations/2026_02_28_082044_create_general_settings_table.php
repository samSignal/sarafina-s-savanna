<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('general_settings', function (Blueprint $table) {
            $table->id();
            $table->string('store_name')->nullable();
            $table->string('support_email')->nullable();
            $table->string('support_phone_uk')->nullable();
            $table->string('support_phone_zim')->nullable();
            $table->text('address_uk')->nullable();
            $table->text('address_zim')->nullable();
            $table->string('facebook_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('tiktok_url')->nullable();
            $table->timestamps();
        });

        // Insert default record
        DB::table('general_settings')->insert([
            'store_name' => 'Sarafina Market',
            'support_email' => 'hello@sarafina.africa',
            'support_phone_uk' => '+44 123 456 7890',
            'support_phone_zim' => '+263 77 123 4567',
            'address_uk' => "123 African Market Street\nLondon, UK",
            'address_zim' => "Unit 5, Msasa Industrial Park\nHarare, Zimbabwe",
            'facebook_url' => 'https://www.facebook.com/share/g/1aVTavof8R/?mibextid=wwXIfr',
            'instagram_url' => 'https://www.instagram.com/sarafinafoods?igsh=MWwxanpvZDU3MGZ6cA%3D%3D&utm_source=qr',
            'tiktok_url' => 'https://www.tiktok.com/@sarafinafoods?_r=1&_t=ZN-94CSVlThI1u',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('general_settings');
    }
};
