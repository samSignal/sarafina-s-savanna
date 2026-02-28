<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class GiftCardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // We do NOT create a department or category for gift cards anymore.
        // They are standalone products with type='gift_card'.

        // Create Products (Denominations)
        $denominations = [10, 25, 50, 100];

        foreach ($denominations as $amount) {
            Product::firstOrCreate(
                ['name' => "Gift Card £{$amount}"],
                [
                    'department_id' => null, // No department association
                    'category_id' => null, // No category association
                    'description' => "Give the gift of choice with a £{$amount} Sarafina's Savanna Gift Card.",
                    'price' => $amount,
                    'desired_net_price' => $amount,
                    'price_uk_eu' => $amount,
                    'price_international' => $amount,
                    'stock' => 999999, // Infinite stock
                    'image' => '/images/gift-card.jpg',
                    'status' => 'In Stock',
                    'type' => 'gift_card'
                ]
            );
        }
    }
}
