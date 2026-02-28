<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class GeneralSettingsTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        \DB::table('general_settings')->delete();
        
        \DB::table('general_settings')->insert(array (
            0 => 
            array (
                'id' => 1,
                'store_name' => 'Sarafina Market',
                'support_email' => 'hello@sarafina.africa',
                'support_phone_uk' => '+44 123 456 7890',
                'support_phone_zim' => '+263 77 123 4567',
                'address_uk' => '123 African Market Street
London, UK',
                'address_zim' => 'Unit 5, Msasa Industrial Park
Bulawayo, Zimbabwe',
                'facebook_url' => 'https://www.facebook.com/share/g/1aVTavof8R/?mibextid=wwXIfr',
                'instagram_url' => 'https://www.instagram.com/sarafinafoods?igsh=MWwxanpvZDU3MGZ6cA%3D%3D&utm_source=qr',
                'tiktok_url' => 'https://www.tiktok.com/@sarafinafoods?_r=1&_t=ZN-94CSVlThI1u',
                'created_at' => '2026-02-28 08:22:17',
                'updated_at' => '2026-02-28 09:29:41',
            ),
        ));
        
        
    }
}