<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\InvoiceLine>
 */
class InvoiceLineFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'invoice_id' => (string) Str::uuid(),
            'description' => $this->faker->sentence(3),
            'quantity' => 1,
            'unit_price' => 100.0,
            'line_total' => 100.0,
        ];
    }
}
