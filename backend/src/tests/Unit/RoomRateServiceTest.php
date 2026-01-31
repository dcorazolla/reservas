<?php

namespace Tests\Unit;

use App\Models\Property;
use App\Models\Room;
use App\Models\RoomRate;
use App\Services\RoomRateService;
use Illuminate\Support\Str;
use Tests\TestCase;

class RoomRateServiceTest extends TestCase
{
    /** @test */
    public function should_return_rates_when_list_called_given_room()
    {
        $property = new Property(['name' => 'PR1']);
        $property->id = Str::uuid()->toString();
        $property->save();

        $room = new Room(['property_id' => $property->id, 'name' => 'R']);
        $room->id = Str::uuid()->toString();
        $room->save();

        $rate = new RoomRate(['room_id' => $room->id, 'people_count' => 1, 'price_per_day' => 100]);
        $rate->id = Str::uuid()->toString();
        $rate->save();

        $svc = new RoomRateService();
        $rates = $svc->list($room);

        $this->assertNotEmpty($rates);
        $this->assertEquals(1, $rates->first()->people_count);
    }
}
