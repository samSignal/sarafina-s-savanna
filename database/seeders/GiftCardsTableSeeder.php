<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class GiftCardsTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        \DB::table('gift_cards')->delete();
        
        \DB::table('gift_cards')->insert(array (
            0 => 
            array (
                'id' => 1,
                'code' => 'SARAFINA-PJLQ-GJS8',
                'initial_value' => '50.00',
                'balance' => '50.00',
                'status' => 'active',
                'expiry_date' => '2028-02-26',
                'recipient_email' => NULL,
                'sender_name' => NULL,
                'message' => NULL,
                'purchaser_id' => NULL,
                'order_id' => 151,
                'created_at' => '2026-02-26 12:09:09',
                'updated_at' => '2026-02-26 12:09:09',
                'deleted_at' => NULL,
            ),
            1 => 
            array (
                'id' => 2,
                'code' => 'SARAFINA-PBZH-MUEF',
                'initial_value' => '100.00',
                'balance' => '100.00',
                'status' => 'active',
                'expiry_date' => '2028-02-26',
                'recipient_email' => 'test@nust.ac.zw',
                'sender_name' => NULL,
                'message' => NULL,
                'purchaser_id' => NULL,
                'order_id' => 152,
                'created_at' => '2026-02-26 13:17:17',
                'updated_at' => '2026-02-26 13:17:17',
                'deleted_at' => NULL,
            ),
            2 => 
            array (
                'id' => 3,
                'code' => 'SARAFINA-FRRL-3PYE',
                'initial_value' => '100.00',
                'balance' => '0.00',
                'status' => 'used',
                'expiry_date' => '2028-02-26',
                'recipient_email' => 'test@nust.ac.zw',
                'sender_name' => NULL,
                'message' => NULL,
                'purchaser_id' => NULL,
                'order_id' => 152,
                'created_at' => '2026-02-26 13:17:19',
                'updated_at' => '2026-02-26 13:18:52',
                'deleted_at' => NULL,
            ),
            3 => 
            array (
                'id' => 4,
                'code' => 'SARAFINA-QGCJ-LR8G',
                'initial_value' => '100.00',
                'balance' => '0.00',
                'status' => 'used',
                'expiry_date' => '2028-02-26',
                'recipient_email' => 'test@nust.ac.zw',
                'sender_name' => NULL,
                'message' => NULL,
                'purchaser_id' => NULL,
                'order_id' => 152,
                'created_at' => '2026-02-26 13:17:19',
                'updated_at' => '2026-02-28 07:40:44',
                'deleted_at' => NULL,
            ),
            4 => 
            array (
                'id' => 5,
                'code' => 'SARAFINA-5LJ9-UALL',
                'initial_value' => '100.00',
                'balance' => '100.00',
                'status' => 'active',
                'expiry_date' => '2028-02-26',
                'recipient_email' => 'test@nust.ac.zw',
                'sender_name' => NULL,
                'message' => NULL,
                'purchaser_id' => NULL,
                'order_id' => 152,
                'created_at' => '2026-02-26 13:17:19',
                'updated_at' => '2026-02-26 13:17:19',
                'deleted_at' => NULL,
            ),
            5 => 
            array (
                'id' => 6,
                'code' => 'SARAFINA-5ILX-6ZRO',
                'initial_value' => '100.00',
                'balance' => '100.00',
                'status' => 'active',
                'expiry_date' => '2028-02-26',
                'recipient_email' => 'test@nust.ac.zw',
                'sender_name' => NULL,
                'message' => NULL,
                'purchaser_id' => NULL,
                'order_id' => 152,
                'created_at' => '2026-02-26 13:17:19',
                'updated_at' => '2026-02-26 13:17:19',
                'deleted_at' => NULL,
            ),
        ));
        
        
    }
}