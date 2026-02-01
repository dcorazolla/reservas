<?php

namespace Tests\Unit;

use App\Models\Property;
use App\Models\Room;
use App\Models\RoomRate;
use App\Services\ReservationPriceCalculator;
use Illuminate\Support\Str;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class ReservationPriceCalculatorTest extends TestCase
{
    #[Test]
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

    #[Test]
    public function calculate_uses_legacy_property_fallback_when_no_rates()
    {
        $property = new Property([
            'name' => 'PRC-LEG',
            'base_two_adults' => 200,
            'additional_adult' => 50,
        ]);
        $property->id = Str::uuid()->toString();
        $property->save();

        $room = new Room(['property_id' => $property->id, 'capacity' => 4, 'name' => 'RLEG']);
        $room->id = Str::uuid()->toString();
        $room->save();

        $calc = new ReservationPriceCalculator();
        // 2 adults -> base_two_adults = 200
        $res = $calc->calculateDetailed($room, now()->toDateString(), now()->addDays(2)->toDateString(), 2, 0);

        $this->assertEquals(400.0, $res['total']);
    }

    #[Test]
    public function compute_day_price_uses_property_base_and_child_factor()
    {
        $property = new Property([
            'name' => 'PRC-PROP',
            'base_one_adult' => 80,
            'base_two_adults' => 150,
            'additional_adult' => 40,
            'child_factor' => 0.5,
        ]);
        $property->id = Str::uuid()->toString();
        $property->save();

        $room = new Room(['property_id' => $property->id, 'capacity' => 4, 'name' => 'RPROP']);
        $room->id = Str::uuid()->toString();
        $room->save();

        $calc = new ReservationPriceCalculator();
        $d = now()->toDateString();
        $res = $calc->calculateDetailed($room, $d, now()->addDays(1)->toDateString(), 1, 2);

        // adultCost = base_one = 80; childPrice = base_one * child_factor = 80 * 0.5 = 40; childrenCost = 2 * 40 = 80
        // total = 80 + 80 = 160
        $this->assertEquals(160.0, $res['total']);
        $this->assertEquals('property_base', $res['source']);
    }

}
