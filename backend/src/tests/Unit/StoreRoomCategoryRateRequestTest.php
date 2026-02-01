<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Http\Requests\StoreRoomCategoryRateRequest;

class StoreRoomCategoryRateRequestTest extends TestCase
{
    public function test_rules_contains_expected_rate_keys()
    {
        $req = new StoreRoomCategoryRateRequest();
        $rules = $req->rules();

        $this->assertArrayHasKey('base_one_adult', $rules);
        $this->assertArrayHasKey('base_two_adults', $rules);
        $this->assertArrayHasKey('additional_adult', $rules);
        $this->assertArrayHasKey('child_price', $rules);
    }
}
