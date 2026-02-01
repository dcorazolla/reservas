<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Str;

class ModelPaymentTest extends TestCase
{
    public function test_payment_relations_and_allocations()
    {
        $partner = \App\Models\Partner::create(['id' => Str::uuid()->toString(), 'name' => 'P']);

        $payment = \App\Models\Payment::create([
            'id' => Str::uuid()->toString(),
            'partner_id' => $partner->id,
            'amount' => 50,
            'method' => 'card',
            'paid_at' => now()->toDateString(),
        ]);

        $this->assertInstanceOf(\App\Models\Partner::class, $payment->partner);
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $payment->allocations());
    }
}
