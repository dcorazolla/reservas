<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Http\Requests\StoreRoomRateRequest;

class StoreRoomRateRequestTest extends TestCase
{
    public function test_rules_contains_expected_keys()
    {
        $req = new StoreRoomRateRequest();
        $rules = $req->rules();

        $this->assertArrayHasKey('people_count', $rules);
        $this->assertArrayHasKey('price_per_day', $rules);
    }
}
