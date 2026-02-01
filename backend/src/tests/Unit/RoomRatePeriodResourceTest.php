<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Models\Room;
use App\Models\Property;
use App\Models\RoomRatePeriod;
use App\Http\Resources\RoomRatePeriodResource;

class RoomRatePeriodResourceTest extends TestCase
{
    public function test_room_rate_period_serializes_expected_fields()
    {
        $property = Property::create(['name' => 'P1', 'timezone' => 'UTC']);
        $room = Room::create([
            'property_id' => $property->id,
            'number' => '10',
            'name' => 'Suite',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $period = RoomRatePeriod::create([
            'room_id' => $room->id,
            'people_count' => 2,
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-03',
            'price_per_day' => 100.0,
        ]);

        $req = Request::create('/');
        $out = (new RoomRatePeriodResource($period))->toArray($req);

        $this->assertEquals($period->id, $out['id']);
        $this->assertEquals('2026-02-01', $out['start_date']);
        $this->assertEquals(100.0, $out['price_per_day']);
    }
}
