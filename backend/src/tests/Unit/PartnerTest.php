<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Partner;

class PartnerTest extends TestCase
{
    public function test_can_create_partner()
    {
        $p = Partner::factory()->create(['name' => 'ACME Ltd']);

        $this->assertDatabaseHas('partners', [
            'id' => $p->id,
            'name' => 'ACME Ltd',
        ]);
    }
}
