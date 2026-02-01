<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Http\Requests\StoreRoomCategoryRatePeriodRequest;

class StoreRoomCategoryRatePeriodRequestTest extends TestCase
{
    public function test_rules_include_expected_fields()
    {
        $req = new StoreRoomCategoryRatePeriodRequest();
        $rules = $req->rules();

        $expected = [
            'start_date', 'end_date', 'base_one_adult', 'base_two_adults',
            'additional_adult', 'child_price', 'description'
        ];

        foreach ($expected as $k) {
            $this->assertArrayHasKey($k, $rules, "Missing rule for $k");
        }
    }
}
