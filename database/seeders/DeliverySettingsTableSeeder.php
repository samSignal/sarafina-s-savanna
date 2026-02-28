<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DeliverySettingsTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        \DB::table('delivery_settings')->delete();
        
        \DB::table('delivery_settings')->insert(array (
            0 => 
            array (
                'id' => 1,
                'cost' => '5.00',
                'created_at' => '2026-02-25 09:44:45',
                'updated_at' => '2026-02-25 09:44:45',
            ),
        ));
        
        
    }
}