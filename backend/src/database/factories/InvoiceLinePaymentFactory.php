<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\InvoiceLinePayment>
 */
class InvoiceLinePaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'payment_id' => (string) Str::uuid(),
            'invoice_line_id' => (string) Str::uuid(),
            'amount' => 0,
        ];
    }
}
