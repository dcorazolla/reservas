<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Property;
use App\Models\Room;
use App\Services\ReservationPriceCalculator;

class ReservationPriceCalculatorPropertyBaseTest extends TestCase
{
    public function test_calculate_detailed_uses_property_base_and_child_factor()
    {
        $property = Property::create([
            'name' => 'Prop Base',
            'timezone' => 'UTC',
            'base_one_adult' => 50.0,
            'base_two_adults' => 90.0,
            'additional_adult' => 20.0,
            'child_factor' => 0.5,
        ]);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '20',
            'name' => 'Room 20',
            'beds' => 1,
            'capacity' => 4,
            'active' => true,
        ]);

        $calc = new ReservationPriceCalculator();

        // 1 adult + 1 child -> peopleCount = 2 -> falls back to property_base
        $res = $calc->calculateDetailed($room, '2026-02-05', '2026-02-07', 1, 1);

        $this->assertEquals('property_base', $res['source']);
        $this->assertCount(2, $res['days']);

        // adultCost = base_one_adult (50) ; childPrice fallback = base_one_adult * child_factor = 25
        $this->assertEquals(75.0, $res['days'][0]['price']);
        $this->assertEquals(150.0, $res['total']);
    }
}
