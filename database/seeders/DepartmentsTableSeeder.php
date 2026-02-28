<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DepartmentsTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        \DB::table('departments')->delete();
        
        \DB::table('departments')->insert(array (
            0 => 
            array (
                'id' => 1,
                'name' => 'Bucthery',
                'description' => 'all meat',
                'image' => '/storage/departments/FhYjXywRIABAMzzJ8RfeW7tB7GdfGjPATDHb5QZ1.jpg',
                'status' => 'Active',
                'created_at' => '2026-01-23 13:00:20',
                'updated_at' => '2026-02-17 09:48:54',
                'deleted_at' => NULL,
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            1 => 
            array (
                'id' => 2,
                'name' => 'Fresh Produce',
                'description' => 'Fruits, vegetables, and leafy greens',
                'image' => '/images/departments/cat-produce.jpg',
                'status' => 'Active',
                'created_at' => '2026-01-23 13:17:58',
                'updated_at' => '2026-01-23 13:33:13',
                'deleted_at' => NULL,
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            2 => 
            array (
                'id' => 3,
                'name' => 'Spices & Seasonings',
                'description' => 'Authentic African spices and herbs',
                'image' => '/images/departments/cat-spices.jpg',
                'status' => 'Active',
                'created_at' => '2026-01-23 13:17:58',
                'updated_at' => '2026-01-23 13:33:13',
                'deleted_at' => NULL,
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            3 => 
            array (
                'id' => 4,
                'name' => 'Drinks',
                'description' => 'Traditional beverages, juices, and soft drinks',
                'image' => '/images/departments/cat-drinks.jpg',
                'status' => 'Active',
                'created_at' => '2026-01-23 13:17:58',
                'updated_at' => '2026-01-23 13:33:13',
                'deleted_at' => NULL,
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            4 => 
            array (
                'id' => 5,
                'name' => 'Clearance',
                'description' => 'Discounted items and special offers',
                'image' => '/images/departments/cat-pantry.jpg',
                'status' => 'Active',
                'created_at' => '2026-01-23 13:17:58',
                'updated_at' => '2026-01-23 13:33:13',
                'deleted_at' => NULL,
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            5 => 
            array (
                'id' => 6,
                'name' => 'Fresh Meat',
                'description' => 'Premium cuts and traditional favorites',
                'image' => '/images/departments/cat-meat.jpg',
                'status' => 'Active',
                'created_at' => '2026-01-23 13:33:13',
                'updated_at' => '2026-01-23 13:33:13',
                'deleted_at' => NULL,
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            6 => 
            array (
                'id' => 7,
                'name' => 'Snacks',
                'description' => 'Chips, biscuits and treats',
                'image' => '/images/departments/cat-snacks.jpg',
                'status' => 'Active',
                'created_at' => '2026-01-23 13:33:13',
                'updated_at' => '2026-01-23 13:33:13',
                'deleted_at' => NULL,
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            7 => 
            array (
                'id' => 8,
                'name' => 'Sarafina  savings.',
                'description' => 'Sarafina  savings.',
                'image' => '/images/departments/Sarafina  savings.jpeg',
                'status' => 'Active',
                'created_at' => '2026-02-17 08:40:34',
                'updated_at' => '2026-02-17 09:24:55',
                'deleted_at' => NULL,
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            8 => 
            array (
                'id' => 9,
                'name' => 'Sarafina  savings.',
                'description' => 'Sarafina  savings.',
                'image' => '/images/departments/Sarafina  savings.jpeg',
                'status' => 'Inactive',
                'created_at' => '2026-02-17 08:40:35',
                'updated_at' => '2026-02-17 08:54:51',
                'deleted_at' => '2026-02-17 08:54:51',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            9 => 
            array (
                'id' => 10,
                'name' => 'Sarafina  Foods',
                'description' => 'Sarafina  Foods',
                'image' => '/storage/departments/yTLETpq7Tp1qtpPOHb7UDzmemGggUrDQR3JUTmgQ.jpg',
                'status' => 'Inactive',
                'created_at' => '2026-02-17 09:31:37',
                'updated_at' => '2026-02-17 12:37:51',
                'deleted_at' => NULL,
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            10 => 
            array (
                'id' => 11,
                'name' => 'quo',
                'description' => 'A aliquam explicabo velit possimus facilis.',
                'image' => 'https://via.placeholder.com/640x480.png/001177?text=dolorum',
                'status' => 'active',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-26 17:34:53',
                'deleted_at' => '2026-02-26 17:34:53',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            11 => 
            array (
                'id' => 12,
                'name' => 'voluptas',
                'description' => 'Quisquam praesentium omnis quis nesciunt qui perferendis nam ut.',
                'image' => 'https://via.placeholder.com/640x480.png/000000?text=dolorum',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-26 17:34:58',
                'deleted_at' => '2026-02-26 17:34:58',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            12 => 
            array (
                'id' => 13,
                'name' => 'perspiciatis',
                'description' => 'Quasi perferendis quidem neque enim voluptatem quis eveniet.',
                'image' => 'https://via.placeholder.com/640x480.png/00dd99?text=cum',
                'status' => 'active',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-26 17:35:02',
                'deleted_at' => '2026-02-26 17:35:02',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            13 => 
            array (
                'id' => 14,
                'name' => 'fugiat',
                'description' => 'Qui magnam ut quos nobis ipsam ea suscipit.',
                'image' => 'https://via.placeholder.com/640x480.png/001177?text=voluptatem',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-26 17:35:08',
                'deleted_at' => '2026-02-26 17:35:08',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            14 => 
            array (
                'id' => 15,
                'name' => 'sunt',
                'description' => 'Dignissimos voluptatibus quia ut culpa aut libero aut illo.',
                'image' => 'https://via.placeholder.com/640x480.png/007777?text=sequi',
                'status' => 'active',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-26 17:35:13',
                'deleted_at' => '2026-02-26 17:35:13',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            15 => 
            array (
                'id' => 16,
                'name' => 'expedita',
                'description' => 'Nemo et a enim fuga rem asperiores debitis.',
                'image' => 'https://via.placeholder.com/640x480.png/0000ee?text=vitae',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-26 17:33:49',
                'deleted_at' => '2026-02-26 17:33:49',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            16 => 
            array (
                'id' => 17,
                'name' => 'nobis',
                'description' => 'Recusandae eligendi omnis totam officia et.',
                'image' => 'https://via.placeholder.com/640x480.png/00cc55?text=saepe',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-26 17:33:57',
                'deleted_at' => '2026-02-26 17:33:57',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            17 => 
            array (
                'id' => 18,
                'name' => 'omnis',
                'description' => 'Debitis et hic et ut.',
                'image' => 'https://via.placeholder.com/640x480.png/003344?text=dolorem',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-26 17:34:11',
                'deleted_at' => '2026-02-26 17:34:11',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            18 => 
            array (
                'id' => 19,
                'name' => 'voluptas',
                'description' => 'Debitis minima ea non aspernatur quo velit quo.',
                'image' => 'https://via.placeholder.com/640x480.png/00bbff?text=modi',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-26 17:34:20',
                'deleted_at' => '2026-02-26 17:34:20',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            19 => 
            array (
                'id' => 20,
                'name' => 'quia',
                'description' => 'Perferendis ipsa maiores explicabo autem est aspernatur molestias.',
                'image' => 'https://via.placeholder.com/640x480.png/00ff99?text=iure',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-26 17:34:49',
                'deleted_at' => '2026-02-26 17:34:49',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            20 => 
            array (
                'id' => 21,
                'name' => 'aut',
                'description' => 'Ratione ducimus rerum similique ea aliquam consectetur optio.',
                'image' => 'https://via.placeholder.com/640x480.png/00cc77?text=voluptatem',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:44',
                'updated_at' => '2026-02-26 17:33:44',
                'deleted_at' => '2026-02-26 17:33:44',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            21 => 
            array (
                'id' => 22,
                'name' => 'quisquam',
                'description' => 'Totam quas sed rerum.',
                'image' => 'https://via.placeholder.com/640x480.png/00ff88?text=et',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-26 17:33:27',
                'deleted_at' => '2026-02-26 17:33:27',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            22 => 
            array (
                'id' => 23,
                'name' => 'et',
                'description' => 'Accusamus vero ipsa neque beatae id illo ut.',
                'image' => 'https://via.placeholder.com/640x480.png/001177?text=commodi',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-26 17:33:36',
                'deleted_at' => '2026-02-26 17:33:36',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            23 => 
            array (
                'id' => 24,
                'name' => 'perspiciatis',
                'description' => 'Et earum qui minima minus quia libero voluptas nisi.',
                'image' => 'https://via.placeholder.com/640x480.png/00eecc?text=dolorem',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-26 17:33:53',
                'deleted_at' => '2026-02-26 17:33:53',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            24 => 
            array (
                'id' => 25,
                'name' => 'necessitatibus',
                'description' => 'Autem alias similique iste eos.',
                'image' => 'https://via.placeholder.com/640x480.png/003377?text=tempore',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-26 17:33:40',
                'deleted_at' => '2026-02-26 17:33:40',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            25 => 
            array (
                'id' => 26,
                'name' => 'occaecati',
                'description' => 'Quas repellendus rem nobis sapiente.',
                'image' => 'https://via.placeholder.com/640x480.png/00bb55?text=voluptas',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-26 17:33:10',
                'deleted_at' => '2026-02-26 17:33:10',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            26 => 
            array (
                'id' => 27,
                'name' => 'praesentium',
                'description' => 'Laborum deleniti reiciendis rerum.',
                'image' => 'https://via.placeholder.com/640x480.png/00ffaa?text=nemo',
                'status' => 'active',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-26 17:33:15',
                'deleted_at' => '2026-02-26 17:33:15',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            27 => 
            array (
                'id' => 28,
                'name' => 'nihil',
                'description' => 'Quos possimus ex quidem nostrum sed et.',
                'image' => 'https://via.placeholder.com/640x480.png/008822?text=error',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-26 17:33:19',
                'deleted_at' => '2026-02-26 17:33:19',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            28 => 
            array (
                'id' => 29,
                'name' => 'qui',
                'description' => 'Sit eveniet quisquam labore at sint est quia voluptas.',
                'image' => 'https://via.placeholder.com/640x480.png/00bb55?text=dignissimos',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-26 17:33:32',
                'deleted_at' => '2026-02-26 17:33:32',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            29 => 
            array (
                'id' => 30,
                'name' => 'quia',
                'description' => 'Voluptatum qui reprehenderit voluptates voluptas iste.',
                'image' => 'https://via.placeholder.com/640x480.png/0077ee?text=aliquam',
                'status' => 'active',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-26 17:33:23',
                'deleted_at' => '2026-02-26 17:33:23',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
            30 => 
            array (
                'id' => 31,
                'name' => 'Rina Huffman',
                'description' => 'Incididunt temporibu',
                'image' => '/storage/departments/A5Nb1Tn4XhpOVWvupGEv6u4l5jxfd5MXxDTmOgo1.png',
                'status' => 'Active',
                'created_at' => '2026-02-26 08:27:50',
                'updated_at' => '2026-02-26 17:35:26',
                'deleted_at' => '2026-02-26 17:35:26',
                'points_multiplier' => '0.00',
                'loyalty_reason' => 'Natus iure minus nos',
            ),
            31 => 
            array (
                'id' => 32,
                'name' => 'Gift Cards',
                'description' => 'Digital Gift Cards',
                'image' => '/images/gift-card-department.jpg',
                'status' => 'Active',
                'created_at' => '2026-02-26 10:06:44',
                'updated_at' => '2026-02-26 13:03:08',
                'deleted_at' => '2026-02-26 13:03:08',
                'points_multiplier' => '1.00',
                'loyalty_reason' => NULL,
            ),
        ));
        
        
    }
}