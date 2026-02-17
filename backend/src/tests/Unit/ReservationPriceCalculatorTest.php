<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Property;
use App\Models\Room;
use App\Models\RoomRatePeriod;
use App\Services\ReservationPriceCalculator;
use RuntimeException;

class ReservationPriceCalculatorTest extends TestCase
{
    public function test_calculate_uses_property_fallback_when_no_rates()
    {
        $property = Property::create([
            'name' => 'Pousada Teste',
            'timezone' => 'UTC',
            'base_two_adults' => 100.0,
            'additional_adult' => 20.0,
        ]);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '1',
            'name' => 'Quarto 1',
            'beds' => 1,
            'capacity' => 4,
            'active' => true,
        ]);

        $calc = new ReservationPriceCalculator();

        $res = $calc->calculate($room->id, '2026-02-01', '2026-02-04', 3);

        // 3 nights, computed price: base_two_adults + additional * (3-2) = 100 + 20 = 120
        $this->assertEquals('property_base', $res['source']);
        $this->assertEquals(3, count($res['days']));
        $this->assertEquals(120.0 * 3, $res['total']);
        foreach ($res['days'] as $d) {
            $this->assertEquals(120.0, $d['price']);
        }
    }

    public function test_calculate_detailed_prefers_room_rate_period()
    {
        $property = Property::create([
            'name' => 'Pousada Teste 2',
            'timezone' => 'UTC',
            'child_factor' => 0.5,
            'base_two_adults' => 200.0,
            'additional_adult' => 30.0,
        ]);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '2',
            'name' => 'Quarto 2',
            'beds' => 1,
            'capacity' => 4,
            'active' => true,
        ]);

        // Create a room-specific period rate which should be preferred
        RoomRatePeriod::create([
            'room_id' => $room->id,
            'people_count' => 2,
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-05',
            'price_per_day' => 350.0,
            'description' => 'Promo',
        ]);

        $calc = new ReservationPriceCalculator();
        // use 1 adult + 1 child => peopleCount = 2 (children count toward pricing here)
        $res = $calc->calculateDetailed($room, '2026-02-02', '2026-02-04', 1, 1);

        // 2 nights using period price 350 each, children ignored for capacity
        $this->assertEquals('room_period', $res['source']);
        $this->assertEquals(350.0 * 2, $res['total']);
        $this->assertCount(2, $res['days']);
        foreach ($res['days'] as $d) {
            $this->assertEquals(350.0, $d['price']);
        }
    }

    public function test_calculate_falls_back_to_property_base_and_checks_capacity()
    {
        $property = Property::create([
            'name' => 'Test Property',
            'timezone' => 'UTC',
            'base_two_adults' => 100,
            'additional_adult' => 20,
            'child_factor' => 0.5,
        ]);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '101',
            'name' => 'Room 101',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $calc = new ReservationPriceCalculator();

        // two nights, 2 adults -> uses base_two_adults
        $res = $calc->calculate($room->id, '2026-02-10', '2026-02-12', 2);

        $this->assertIsArray($res);
        $this->assertEquals('property_base', $res['source']);
        $this->assertEquals(200, $res['total']);
        $this->assertCount(2, $res['days']);

        // capacity exceeded should throw
        $this->expectException(RuntimeException::class);
        $calc->calculate($room->id, '2026-02-10', '2026-02-12', 3);
    }
}

