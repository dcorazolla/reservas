<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Models\RoomCategoryRatePeriod;
use App\Http\Resources\RoomCategoryRatePeriodResource;

class RoomCategoryRatePeriodResourceTest extends TestCase
{
    public function test_resource_serializes_fields()
    {
        $category = \App\Models\RoomCategory::create(['name' => 'Categoria A']);

        $period = RoomCategoryRatePeriod::create([
            'room_category_id' => $category->id,
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-05',
            'base_one_adult' => 80.0,
            'base_two_adults' => 150.0,
            'additional_adult' => 25.0,
            'child_price' => 20.0,
            'description' => 'Promo',
        ]);

        $req = Request::create('/');
        $res = (new RoomCategoryRatePeriodResource($period))->toArray($req);

        $this->assertEquals($period->id, $res['id']);
        $this->assertEquals('2026-02-01', $res['start_date']);
        $this->assertEquals('2026-02-05', $res['end_date']);
        $this->assertEquals(150.0, $res['base_two_adults']);
        $this->assertEquals('Promo', $res['description']);
    }
}
