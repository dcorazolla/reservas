<?php

namespace Tests\Unit;

use App\Models\Property;
use App\Models\Room;
use App\Models\RoomRate;
use App\Services\ReservationPriceCalculator;
use Illuminate\Support\Str;
use Tests\TestCase;

class ReservationPriceCalculatorTest extends TestCase
{
    /** @test */
    public function should_compute_total_using_room_rate_when_available()
    {
        $property = new Property(['name' => 'PRC1', 'base_two_adults' => 100]);
        $property->id = Str::uuid()->toString();
        $property->save();

        $room = new Room(['property_id' => $property->id, 'name' => 'RRC']);
        $room->id = Str::uuid()->toString();
        $room->save();

        $rate = new RoomRate(['room_id' => $room->id, 'people_count' => 2, 'price_per_day' => 150]);
        $rate->id = Str::uuid()->toString();
        $rate->save();

        $calc = new ReservationPriceCalculator();
        $result = $calc->calculateDetailed($room, now()->toDateString(), now()->addDays(2)->toDateString(), 2, 0);

        $this->assertEquals(300.0, $result['total']);
    }
}
