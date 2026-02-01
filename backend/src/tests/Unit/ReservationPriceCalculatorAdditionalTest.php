<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Property;
use App\Models\Room;
use App\Models\RoomRate;
use App\Models\RoomCategory;
use App\Models\RoomCategoryRate;
use App\Services\ReservationPriceCalculator;

class ReservationPriceCalculatorAdditionalTest extends TestCase
{
    public function test_calculate_uses_room_base_rate_if_present()
    {
        $property = Property::create(['name' => 'PB', 'timezone' => 'UTC']);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '50',
            'name' => 'Room 50',
            'beds' => 1,
            'capacity' => 3,
            'active' => true,
        ]);

        RoomRate::create([
            'room_id' => $room->id,
            'people_count' => 2,
            'price_per_day' => 220.0,
        ]);

        $calc = new ReservationPriceCalculator();
        $res = $calc->calculate($room->id, '2026-02-10', '2026-02-12', 2);

        $this->assertCount(2, $res['days']);
        $this->assertEquals(220.0 * 2, $res['total']);
    }

    public function test_calculate_detailed_uses_category_base_when_room_rates_missing()
    {
        $property = Property::create(['name' => 'PC', 'timezone' => 'UTC']);
        $category = RoomCategory::create(['name' => 'CatTest']);

        $room = Room::create([
            'property_id' => $property->id,
            'room_category_id' => $category->id,
            'number' => '60',
            'name' => 'Room 60',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        RoomCategoryRate::create([
            'room_category_id' => $category->id,
            'base_two_adults' => 180.0,
            'additional_adult' => 40.0,
        ]);

        $calc = new ReservationPriceCalculator();
        $res = $calc->calculateDetailed($room, '2026-02-15', '2026-02-17', 2, 0);

        $this->assertEquals('category_base', $res['source']);
        $this->assertEquals(180.0 * 2, $res['total']);
    }

    public function test_compute_day_price_child_price_fallback_to_factor()
    {
        $property = Property::create([
            'name' => 'PF',
            'timezone' => 'UTC',
            'child_factor' => 0.25,
        ]);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '70',
            'name' => 'Room 70',
            'beds' => 1,
            'capacity' => 4,
            'active' => true,
        ]);

        // Simulate a category rate-like object without price_per_day and without child_price
        $rate = (object) [
            'base_one_adult' => 60.0,
            'base_two_adults' => 100.0,
            'additional_adult' => 20.0,
            'child_price' => null,
        ];

        $calc = new ReservationPriceCalculator();

        $reflect = new \ReflectionClass($calc);
        $method = $reflect->getMethod('computeDayPrice');
        $method->setAccessible(true);

        $price = $method->invokeArgs($calc, [$rate, $property, 1, 1]);

        // base_one_adult = 60 ; child fallback = base_one_adult * child_factor = 15 ; total = 75
        $this->assertEquals(75.0, $price);
    }
}
