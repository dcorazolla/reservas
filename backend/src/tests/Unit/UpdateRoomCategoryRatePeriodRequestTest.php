<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Http\Requests\UpdateRoomCategoryRatePeriodRequest;

class UpdateRoomCategoryRatePeriodRequestTest extends TestCase
{
    public function test_rules_contains_expected_keys()
    {
        $req = new UpdateRoomCategoryRatePeriodRequest();
        $rules = $req->rules();

        $this->assertArrayHasKey('start_date', $rules);
        $this->assertArrayHasKey('end_date', $rules);
        $this->assertArrayHasKey('base_one_adult', $rules);
        $this->assertArrayHasKey('child_price', $rules);
    }
}
