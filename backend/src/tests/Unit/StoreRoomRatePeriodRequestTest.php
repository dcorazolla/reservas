<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Http\Requests\StoreRoomRatePeriodRequest;

class StoreRoomRatePeriodRequestTest extends TestCase
{
    public function test_rules_contains_expected_keys()
    {
        $req = new StoreRoomRatePeriodRequest();
        $rules = $req->rules();

        $this->assertArrayHasKey('people_count', $rules);
        $this->assertArrayHasKey('start_date', $rules);
        $this->assertArrayHasKey('end_date', $rules);
    }
}
