<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Property;
use App\Models\Room;
use App\Models\RoomRatePeriod;
use App\Services\ReservationPriceCalculator;

class ReservationPriceCalculatorDetailedTest extends TestCase
{
    public function test_calculate_detailed_prefers_room_period()
    {
        $property = Property::create([
            'name' => 'Test Property',
            'timezone' => 'UTC',
            'base_two_adults' => 80,
            'additional_adult' => 10,
            'child_factor' => 0.5,
        ]);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '201',
            'name' => 'Room 201',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        // Create a room rate period that covers the date range
        RoomRatePeriod::create([
            'room_id' => $room->id,
            'people_count' => 2,
            'start_date' => '2026-02-10',
            'end_date' => '2026-02-20',
            'price_per_day' => 150,
        ]);

        $calc = new ReservationPriceCalculator();

        $res = $calc->calculateDetailed($room, '2026-02-10', '2026-02-13', 2, 0);

        $this->assertIsArray($res);
        $this->assertEquals('room_period', $res['source']);
        $this->assertEquals(150 * 3, $res['total']);
        $this->assertCount(3, $res['days']);
    }
}
