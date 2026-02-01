<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Http\Requests\UpdateRoomRateRequest;

class UpdateRoomRateRequestTest extends TestCase
{
    public function test_rules_contains_expected_keys_and_default_max()
    {
        $req = new UpdateRoomRateRequest();
        $rules = $req->rules();

        $this->assertArrayHasKey('people_count', $rules);
        $this->assertArrayHasKey('price_per_day', $rules);
        $this->assertStringContainsString('max:', $rules['people_count']);
    }
}
