<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'partner_id' => (string) Str::uuid(),
            'amount' => 100.0,
            'method' => 'card',
            'paid_at' => now(),
            'notes' => null,
        ];
    }
}
