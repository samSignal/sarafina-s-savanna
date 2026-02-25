<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'description' => fake()->paragraph(),
            'price' => fake()->randomFloat(2, 10, 1000),
            'price_uk_eu' => fake()->randomFloat(2, 10, 1000),
            'price_international' => fake()->randomFloat(2, 10, 1000),
            'stock' => fake()->numberBetween(0, 100),
            'status' => fake()->randomElement(['active', 'draft']),
            'image' => fake()->imageUrl(640, 480, 'products', true),
            'department_id' => Department::factory(),
            'category_id' => Category::factory(),
        ];
    }
}
