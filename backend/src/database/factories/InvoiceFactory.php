<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invoice>
 */
class InvoiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'partner_id' => (string) Str::uuid(),
            'property_id' => null,
            'number' => $this->faker->unique()->numerify('INV-####'),
            'issued_at' => $this->faker->date(),
            'due_at' => null,
            'total' => 0,
            'status' => 'draft',
        ];
    }
}
