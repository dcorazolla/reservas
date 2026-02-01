<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Models\Reservation;
use App\Models\Property;
use App\Models\Room;
use App\Http\Resources\ReservationResource;

class ReservationResourceTest extends TestCase
{
    public function test_reservation_resource_basic_serialization()
    {
        $property = Property::create(['name' => 'RP', 'timezone' => 'UTC']);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '1',
            'name' => 'R1',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $res = Reservation::create([
            'room_id' => $room->id,
            'guest_name' => 'Test Guest',
            'adults_count' => 2,
            'children_count' => 0,
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-03',
            'status' => 'confirmed',
        ]);

        $req = Request::create('/');
        $out = (new ReservationResource($res))->toArray($req);

        $this->assertEquals($res->id, $out['id']);
        $this->assertEquals('2026-02-01', $out['start_date']);
        $this->assertEquals('confirmed', $out['status']);
    }
}
