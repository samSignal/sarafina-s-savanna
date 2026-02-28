<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UsersTableSeeder::class,
            DepartmentsTableSeeder::class,
            CategoriesTableSeeder::class,
            ProductsTableSeeder::class,
            OrdersTableSeeder::class,
            OrderItemsTableSeeder::class,
            GiftCardsTableSeeder::class,
            GeneralSettingsTableSeeder::class,
            DeliverySettingsTableSeeder::class,
            // AdminDashboardSeeder::class, // Already seeded via other seeders if included
        ]);
    }
}
