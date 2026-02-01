<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Property;
use App\Models\Room;
use App\Http\Resources\RoomResource;
use Illuminate\Http\Request;

class RoomResourceTest extends TestCase
{
    public function test_room_resource_serializes_basic_fields_and_no_reservations()
    {
        $property = Property::create(['name' => 'RProp', 'timezone' => 'UTC']);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '30',
            'name' => 'Room 30',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $req = Request::create('/');
        $out = (new RoomResource($room))->toArray($req);

        $this->assertEquals($room->id, $out['id']);
        $this->assertEquals('30', $out['number']);
        $this->assertEquals('Room 30', $out['name']);
        $this->assertArrayHasKey('reservations', $out);
    }
}
