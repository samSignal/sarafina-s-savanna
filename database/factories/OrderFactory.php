<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'order_number' => 'ORD-' . fake()->unique()->numerify('#####'),
            'total' => fake()->randomFloat(2, 50, 2000),
            'total_amount' => fake()->randomFloat(2, 50, 2000),
            'currency' => 'USD',
            'status' => fake()->randomElement(['pending', 'processing', 'completed', 'cancelled']),
            'payment_status' => fake()->randomElement(['paid', 'pending', 'failed']),
            'shipping_method' => fake()->randomElement(['standard', 'express']),
            'shipping_address_line1' => fake()->streetAddress(),
            'shipping_address_line2' => fake()->optional()->secondaryAddress(),
            'shipping_city' => fake()->city(),
            'shipping_postcode' => fake()->postcode(),
            'shipping_country' => fake()->country(),
            'created_at' => fake()->dateTimeBetween('-6 months', 'now'),
        ];
    }
}
