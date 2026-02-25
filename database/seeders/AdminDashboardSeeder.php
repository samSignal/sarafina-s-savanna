<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Department;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminDashboardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 5 Departments
        $departments = Department::factory(5)->create();

        // Create 20 Categories (randomly assigned to departments)
        $categories = Category::factory(20)->recycle($departments)->create();

        // Create 50 Products
        $products = Product::factory(50)
            ->recycle($departments)
            ->recycle($categories)
            ->create();

        // Create 20 Users
        $users = User::factory(20)->create();

        // Create Orders for Users
        foreach ($users as $user) {
            $orders = Order::factory(rand(1, 5))->create([
                'user_id' => $user->id,
            ]);

            foreach ($orders as $order) {
                // Create Order Items
                $items = OrderItem::factory(rand(1, 5))->create([
                    'order_id' => $order->id,
                    'product_id' => $products->random()->id,
                ]);

                // Update Order total
                $total = $items->sum('line_total');
                $order->update([
                    'total' => $total,
                    'total_amount' => $total,
                ]);
            }
        }
    }
}
