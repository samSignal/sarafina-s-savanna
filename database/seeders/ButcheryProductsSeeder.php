<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Department;
use App\Models\Category;

class ButcheryProductsSeeder extends Seeder
{
    public function run()
    {
        $butcheryDept = Department::find(1); // Bucthery
        $freshMeatDept = Department::find(6); // Fresh Meat

        // Create a default category if none exists for these departments
        $meatCategory = Category::firstOrCreate(
            ['name' => 'General Meat', 'department_id' => $freshMeatDept->id],
            ['description' => 'Various meat products', 'status' => 'Active']
        );

        $images = [
            'cow head2.jpg', 'cow head.jpg', 'IMG_8086.jpg', 'IMG_8084.jpg', 'IMG_8083.jpg',
            'IMG_8082.jpg', 'IMG_8081.jpg', 'IMG_8080.jpg', 'IMG_8079.jpg', 'IMG_8078.jpg',
            '9e29e35a-7875-45a6-82ef-cb0cc7ee2005.JPG', 'IMG_7895.jpg', 'IMG_7889.jpg',
            'IMG_7929.jpg', 'IMG_7927.jpg', 'IMG_7926.jpg', 'IMG_7925.jpg', 'IMG_7924.jpg',
            'IMG_7922.jpg', 'IMG_7921.jpg', 'IMG_7920.jpg', 'IMG_7919.jpg', 'IMG_7918.jpg',
            'IMG_7917.jpg', 'IMG_7916.jpg', 'IMG_7915.jpg', 'IMG_7914.jpg', 'IMG_7913.jpg',
            'IMG_7912.jpg', 'IMG_7911.jpg', 'IMG_7910.jpg', 'IMG_7909.jpg', 'IMG_7908.jpg',
            'IMG_7900.jpg', 'IMG_7880.jpg', 'IMG_7869.jpg', 'IMG_7866.jpg', 'IMG_7862.jpg',
            'IMG_7860.jpg', 'IMG_7854.jpg', 'IMG_7851.jpg', 'IMG_7849.jpg'
        ];

        $names = [
            'Premium Beef Cut', 'Fresh Lamb Chops', 'Cow Head (Skop)', 'Stewing Beef', 'T-Bone Steak',
            'Oxtail', 'Beef Ribs', 'Boerewors', 'Chicken Whole', 'Chicken Portions',
            'Goat Meat', 'Liver', 'Tripe (Mogodu)', 'Beef Tongue', 'Kidneys',
            'Steak Mince', 'Burger Patties', 'Sausages', 'Pork Chops', 'Pork Ribs'
        ];

        foreach ($images as $index => $image) {
            // Alternate between departments
            $dept = ($index % 2 == 0) ? $butcheryDept : $freshMeatDept;
            
            // Pick a random name or generate one based on index
            $name = $names[$index % count($names)] . ' ' . ($index + 1);
            
            // Random price between 50 and 300
            $price = rand(50, 300) + 0.99;

            // Image path relative to storage/app/public, accessible via /storage/...
            // Note: browser URL needs encoded space, but DB usually stores path
            $imagePath = '/storage/BUTCHERY pictures/' . $image;

            Product::create([
                'department_id' => $dept->id,
                'category_id' => $meatCategory->id,
                'name' => $name,
                'description' => "Fresh quality $name directly from our butchery.",
                'price' => $price,
                'stock' => rand(10, 50),
                'image' => $imagePath,
                'status' => 'Active'
            ]);
        }
    }
}
