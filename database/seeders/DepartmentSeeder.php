<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Fresh Produce',
                'description' => 'Fruits, vegetables, and leafy greens',
                'status' => 'Active',
                'image' => '/images/departments/cat-produce.jpg',
            ],
            [
                'name' => 'Spices & Seasonings',
                'description' => 'Authentic African spices and herbs',
                'status' => 'Active',
                'image' => '/images/departments/cat-spices.jpg',
            ],
            [
                'name' => 'Drinks',
                'description' => 'Traditional beverages, juices, and soft drinks',
                'status' => 'Active',
                'image' => '/images/departments/cat-drinks.jpg',
            ],
            [
                'name' => 'Clearance',
                'description' => 'Discounted items and special offers',
                'status' => 'Active',
                'image' => '/images/departments/cat-pantry.jpg', // Using pantry as fallback
            ],
            [
                'name' => 'Fresh Meat',
                'description' => 'Premium cuts and traditional favorites',
                'status' => 'Active',
                'image' => '/images/departments/cat-meat.jpg',
            ],
            [
                'name' => 'Snacks',
                'description' => 'Chips, biscuits and treats',
                'status' => 'Active',
                'image' => '/images/departments/cat-snacks.jpg',
            ],
        ];

        foreach ($departments as $department) {
            Department::updateOrCreate(
                ['name' => $department['name']],
                $department
            );
        }
    }
}
