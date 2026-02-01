<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Http\Requests\UpdateRoomRatePeriodRequest;

class UpdateRoomRatePeriodRequestTest extends TestCase
{
    public function test_rules_contains_expected_keys()
    {
        $req = new UpdateRoomRatePeriodRequest();
        $rules = $req->rules();

        $this->assertArrayHasKey('people_count', $rules);
        $this->assertArrayHasKey('start_date', $rules);
        $this->assertArrayHasKey('end_date', $rules);
        $this->assertArrayHasKey('price_per_day', $rules);
    }
}
