<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CategoriesTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        \DB::table('categories')->delete();
        
        \DB::table('categories')->insert(array (
            0 => 
            array (
                'id' => 1,
                'department_id' => 6,
                'name' => 'General Meat',
                'description' => 'Various meat products',
                'status' => 'Active',
                'created_at' => '2026-01-24 18:04:46',
                'updated_at' => '2026-02-17 14:21:43',
                'deleted_at' => NULL,
            ),
            1 => 
            array (
                'id' => 2,
                'department_id' => 13,
                'name' => 'odio',
                'description' => 'Nisi praesentium magnam similique a.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            2 => 
            array (
                'id' => 3,
                'department_id' => 13,
                'name' => 'veritatis',
                'description' => 'Et quo hic odio id.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            3 => 
            array (
                'id' => 4,
                'department_id' => 12,
                'name' => 'ullam',
                'description' => 'Enim provident deleniti adipisci ipsa officia est doloremque rerum.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            4 => 
            array (
                'id' => 5,
                'department_id' => 15,
                'name' => 'eos',
                'description' => 'Consequatur ut harum qui natus minus reprehenderit.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            5 => 
            array (
                'id' => 6,
                'department_id' => 11,
                'name' => 'est',
                'description' => 'Sed soluta nobis exercitationem sint quam et.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            6 => 
            array (
                'id' => 7,
                'department_id' => 15,
                'name' => 'ut',
                'description' => 'Officiis maiores asperiores necessitatibus corrupti.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            7 => 
            array (
                'id' => 8,
                'department_id' => 12,
                'name' => 'quos',
                'description' => 'Nesciunt sint libero error.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            8 => 
            array (
                'id' => 9,
                'department_id' => 13,
                'name' => 'facere',
                'description' => 'Illum rem earum adipisci voluptas dolore.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            9 => 
            array (
                'id' => 10,
                'department_id' => 11,
                'name' => 'consequatur',
                'description' => 'Earum explicabo expedita voluptatem aut minima et.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            10 => 
            array (
                'id' => 11,
                'department_id' => 11,
                'name' => 'voluptatibus',
                'description' => 'Provident ea animi voluptas ut id ut.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            11 => 
            array (
                'id' => 12,
                'department_id' => 14,
                'name' => 'et',
                'description' => 'Dolor deleniti facilis non eos.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            12 => 
            array (
                'id' => 13,
                'department_id' => 13,
                'name' => 'aut',
                'description' => 'Repellat et assumenda error sapiente temporibus.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            13 => 
            array (
                'id' => 14,
                'department_id' => 13,
                'name' => 'sint',
                'description' => 'Tempore in autem iste aut reiciendis.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            14 => 
            array (
                'id' => 15,
                'department_id' => 14,
                'name' => 'asperiores',
                'description' => 'Magnam nihil sed suscipit delectus illo eius.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            15 => 
            array (
                'id' => 16,
                'department_id' => 14,
                'name' => 'dolores',
                'description' => 'Ut reprehenderit velit non et.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            16 => 
            array (
                'id' => 17,
                'department_id' => 13,
                'name' => 'autem',
                'description' => 'Repellat porro qui voluptatem commodi sed.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            17 => 
            array (
                'id' => 18,
                'department_id' => 11,
                'name' => 'quibusdam',
                'description' => 'Eligendi praesentium voluptatum vitae eius.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            18 => 
            array (
                'id' => 19,
                'department_id' => 13,
                'name' => 'quod',
                'description' => 'Voluptatibus consequuntur nihil illum.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            19 => 
            array (
                'id' => 20,
                'department_id' => 11,
                'name' => 'nam',
                'description' => 'Libero libero et qui repellat.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            20 => 
            array (
                'id' => 21,
                'department_id' => 12,
                'name' => 'iusto',
                'description' => 'Id vel quas corporis quis laborum eaque.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:30:49',
                'updated_at' => '2026-02-24 09:30:49',
                'deleted_at' => NULL,
            ),
            21 => 
            array (
                'id' => 22,
                'department_id' => 20,
                'name' => 'nisi',
                'description' => 'Cupiditate totam tempora amet quia quod nesciunt.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            22 => 
            array (
                'id' => 23,
                'department_id' => 20,
                'name' => 'dolor',
                'description' => 'Dolore adipisci pariatur dolores.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            23 => 
            array (
                'id' => 24,
                'department_id' => 19,
                'name' => 'repudiandae',
                'description' => 'Veniam molestiae aut et quos iste.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            24 => 
            array (
                'id' => 25,
                'department_id' => 16,
                'name' => 'nemo',
                'description' => 'Non id dolores est non tenetur mollitia delectus.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            25 => 
            array (
                'id' => 26,
                'department_id' => 19,
                'name' => 'provident',
                'description' => 'Rerum tenetur provident mollitia quia ea.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            26 => 
            array (
                'id' => 27,
                'department_id' => 18,
                'name' => 'fugit',
                'description' => 'Cupiditate quia dolores labore ut quia dolorum sed.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            27 => 
            array (
                'id' => 28,
                'department_id' => 18,
                'name' => 'et',
                'description' => 'Nostrum aut pariatur aut vel.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            28 => 
            array (
                'id' => 29,
                'department_id' => 17,
                'name' => 'ea',
                'description' => 'Ipsum quae esse occaecati consequatur.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            29 => 
            array (
                'id' => 30,
                'department_id' => 20,
                'name' => 'explicabo',
                'description' => 'A sunt dicta inventore in ut dicta ut.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            30 => 
            array (
                'id' => 31,
                'department_id' => 16,
                'name' => 'eos',
                'description' => 'Maiores non modi ducimus eaque.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            31 => 
            array (
                'id' => 32,
                'department_id' => 18,
                'name' => 'quam',
                'description' => 'Vero vero tempora nihil ad dolorem dignissimos.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            32 => 
            array (
                'id' => 33,
                'department_id' => 16,
                'name' => 'eum',
                'description' => 'Cupiditate placeat saepe molestiae voluptates.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            33 => 
            array (
                'id' => 34,
                'department_id' => 19,
                'name' => 'maxime',
                'description' => 'Ad alias accusamus sunt nemo.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            34 => 
            array (
                'id' => 35,
                'department_id' => 19,
                'name' => 'aperiam',
                'description' => 'Reiciendis ut sit aut repudiandae quas.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            35 => 
            array (
                'id' => 36,
                'department_id' => 20,
                'name' => 'ut',
                'description' => 'Quo a vel animi ullam sed iusto laboriosam.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            36 => 
            array (
                'id' => 37,
                'department_id' => 18,
                'name' => 'quis',
                'description' => 'Quia ut cupiditate et similique sit qui voluptatem.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            37 => 
            array (
                'id' => 38,
                'department_id' => 18,
                'name' => 'nihil',
                'description' => 'Beatae omnis esse eos assumenda.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            38 => 
            array (
                'id' => 39,
                'department_id' => 20,
                'name' => 'est',
                'description' => 'Necessitatibus dolorem illo laboriosam nobis.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            39 => 
            array (
                'id' => 40,
                'department_id' => 18,
                'name' => 'vero',
                'description' => 'Ut odit voluptas ut atque repellendus consequatur sed veniam.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            40 => 
            array (
                'id' => 41,
                'department_id' => 17,
                'name' => 'neque',
                'description' => 'Velit consequatur veniam inventore rerum qui dolore quo.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:13',
                'updated_at' => '2026-02-24 09:31:13',
                'deleted_at' => NULL,
            ),
            41 => 
            array (
                'id' => 42,
                'department_id' => 21,
                'name' => 'quas',
                'description' => 'Laborum repellendus mollitia consectetur id voluptas voluptatem dolorum.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            42 => 
            array (
                'id' => 43,
                'department_id' => 25,
                'name' => 'saepe',
                'description' => 'Mollitia aliquam voluptate ea debitis deleniti vitae.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            43 => 
            array (
                'id' => 44,
                'department_id' => 21,
                'name' => 'id',
                'description' => 'Qui molestias eaque exercitationem.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            44 => 
            array (
                'id' => 45,
                'department_id' => 21,
                'name' => 'est',
                'description' => 'Deleniti suscipit voluptas sed ex.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            45 => 
            array (
                'id' => 46,
                'department_id' => 23,
                'name' => 'magni',
                'description' => 'Architecto ex unde pariatur et.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            46 => 
            array (
                'id' => 47,
                'department_id' => 21,
                'name' => 'qui',
                'description' => 'Qui porro perspiciatis ut.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            47 => 
            array (
                'id' => 48,
                'department_id' => 23,
                'name' => 'esse',
                'description' => 'Aut sunt accusamus est aspernatur.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            48 => 
            array (
                'id' => 49,
                'department_id' => 24,
                'name' => 'porro',
                'description' => 'Voluptatum cumque ab provident alias quis neque eveniet.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            49 => 
            array (
                'id' => 50,
                'department_id' => 24,
                'name' => 'voluptates',
                'description' => 'Quidem accusantium repellendus libero nihil adipisci inventore odit.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            50 => 
            array (
                'id' => 51,
                'department_id' => 24,
                'name' => 'eum',
                'description' => 'Nobis repellat ea et aut qui exercitationem voluptas.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            51 => 
            array (
                'id' => 52,
                'department_id' => 22,
                'name' => 'excepturi',
                'description' => 'Quisquam ut accusantium voluptates aut vero et.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            52 => 
            array (
                'id' => 53,
                'department_id' => 24,
                'name' => 'quasi',
                'description' => 'Ut illo accusantium vitae et delectus.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            53 => 
            array (
                'id' => 54,
                'department_id' => 24,
                'name' => 'vel',
                'description' => 'Dolorem dolore voluptas quasi dolorem aspernatur maxime aut.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            54 => 
            array (
                'id' => 55,
                'department_id' => 21,
                'name' => 'delectus',
                'description' => 'Earum eveniet voluptatibus consequuntur eaque ut sed.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            55 => 
            array (
                'id' => 56,
                'department_id' => 21,
                'name' => 'consectetur',
                'description' => 'Culpa officiis sit fugit ad.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            56 => 
            array (
                'id' => 57,
                'department_id' => 24,
                'name' => 'eos',
                'description' => 'Enim quia recusandae laborum voluptas aliquam nisi expedita perferendis.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            57 => 
            array (
                'id' => 58,
                'department_id' => 23,
                'name' => 'alias',
                'description' => 'Sunt at tenetur quo dolores commodi.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            58 => 
            array (
                'id' => 59,
                'department_id' => 24,
                'name' => 'ea',
                'description' => 'Fugit vel beatae sit ut nostrum quasi sed ratione.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            59 => 
            array (
                'id' => 60,
                'department_id' => 23,
                'name' => 'amet',
                'description' => 'Est dolor est assumenda explicabo.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            60 => 
            array (
                'id' => 61,
                'department_id' => 22,
                'name' => 'inventore',
                'description' => 'Voluptatibus consequatur maiores aut rerum ad.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:31:45',
                'updated_at' => '2026-02-24 09:31:45',
                'deleted_at' => NULL,
            ),
            61 => 
            array (
                'id' => 62,
                'department_id' => 30,
                'name' => 'voluptas',
                'description' => 'Omnis eos corrupti sit eaque.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            62 => 
            array (
                'id' => 63,
                'department_id' => 26,
                'name' => 'adipisci',
                'description' => 'Distinctio quia sed qui dignissimos nam sint qui optio.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            63 => 
            array (
                'id' => 64,
                'department_id' => 27,
                'name' => 'consequatur',
                'description' => 'Excepturi vero ipsum quia mollitia voluptas autem autem.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            64 => 
            array (
                'id' => 65,
                'department_id' => 30,
                'name' => 'est',
                'description' => 'Accusantium quas est eligendi deserunt eaque alias.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            65 => 
            array (
                'id' => 66,
                'department_id' => 26,
                'name' => 'veniam',
                'description' => 'Distinctio laudantium odit et.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            66 => 
            array (
                'id' => 67,
                'department_id' => 27,
                'name' => 'enim',
                'description' => 'Voluptatem vitae illum aut incidunt voluptas corrupti.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            67 => 
            array (
                'id' => 68,
                'department_id' => 28,
                'name' => 'atque',
                'description' => 'In tenetur sed laudantium autem iure eveniet.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            68 => 
            array (
                'id' => 69,
                'department_id' => 26,
                'name' => 'ipsa',
                'description' => 'Similique sed a officiis et velit ut.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            69 => 
            array (
                'id' => 70,
                'department_id' => 28,
                'name' => 'amet',
                'description' => 'Consequuntur tempore placeat voluptate blanditiis explicabo.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            70 => 
            array (
                'id' => 71,
                'department_id' => 29,
                'name' => 'consectetur',
                'description' => 'Doloremque quisquam omnis ullam vel et voluptas magnam enim.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            71 => 
            array (
                'id' => 72,
                'department_id' => 30,
                'name' => 'incidunt',
                'description' => 'Accusantium molestiae sunt illum qui.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            72 => 
            array (
                'id' => 73,
                'department_id' => 29,
                'name' => 'in',
                'description' => 'A est quo nihil ut iste corrupti magnam.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            73 => 
            array (
                'id' => 74,
                'department_id' => 27,
                'name' => 'ipsam',
                'description' => 'Accusantium sit eum nam voluptate consequatur.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            74 => 
            array (
                'id' => 75,
                'department_id' => 29,
                'name' => 'aut',
                'description' => 'Placeat rerum enim dolorem pariatur.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            75 => 
            array (
                'id' => 76,
                'department_id' => 27,
                'name' => 'deleniti',
                'description' => 'Tempora commodi cum id dolorum.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            76 => 
            array (
                'id' => 77,
                'department_id' => 28,
                'name' => 'natus',
                'description' => 'Delectus deleniti laboriosam asperiores aut odit ea iure.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            77 => 
            array (
                'id' => 78,
                'department_id' => 26,
                'name' => 'quis',
                'description' => 'Dolores nobis qui adipisci fuga delectus culpa quo.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            78 => 
            array (
                'id' => 79,
                'department_id' => 27,
                'name' => 'aspernatur',
                'description' => 'Et et inventore suscipit qui quasi est.',
                'status' => 'active',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            79 => 
            array (
                'id' => 80,
                'department_id' => 27,
                'name' => 'dolore',
                'description' => 'Eaque consequatur id hic labore.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            80 => 
            array (
                'id' => 81,
                'department_id' => 27,
                'name' => 'saepe',
                'description' => 'Voluptatibus exercitationem maiores ea veritatis minus.',
                'status' => 'inactive',
                'created_at' => '2026-02-24 09:32:13',
                'updated_at' => '2026-02-24 09:32:13',
                'deleted_at' => NULL,
            ),
            81 => 
            array (
                'id' => 82,
                'department_id' => 32,
                'name' => 'Digital Gift Cards',
                'description' => 'Purchase digital gift cards for friends and family.',
                'status' => 'Active',
                'created_at' => '2026-02-26 10:06:44',
                'updated_at' => '2026-02-26 10:06:44',
                'deleted_at' => NULL,
            ),
        ));
        
        
    }
}