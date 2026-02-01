<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Str;

class ModelPartnerTest extends TestCase
{
    public function test_partner_invoices_relation_is_iterable()
    {
        $partner = \App\Models\Partner::create(['id' => Str::uuid()->toString(), 'name' => 'Partner Test']);
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $partner->invoices());
        $this->assertIsIterable($partner->invoices()->get());
    }
}
