<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Models\RoomCategoryRate;
use App\Models\RoomCategory;
use App\Http\Resources\RoomCategoryRateResource;

class RoomCategoryRateResourceTest extends TestCase
{
    public function test_resource_serializes_fields()
    {
        $category = RoomCategory::create(['name' => 'Cat X']);

        $rate = RoomCategoryRate::create([
            'room_category_id' => $category->id,
            'date' => '2026-02-01',
            'base_one_adult' => 70.0,
            'base_two_adults' => 120.0,
            'additional_adult' => 15.0,
            'child_price' => 10.0,
        ]);

        $req = Request::create('/');
        $out = (new RoomCategoryRateResource($rate))->toArray($req);

        $this->assertEquals($rate->id, $out['id']);
        $this->assertArrayHasKey('base_two_adults', $out);
        $this->assertEquals(120.0, $out['base_two_adults']);
    }
}
