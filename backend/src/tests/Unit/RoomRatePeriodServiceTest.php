<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Str;

class RoomRatePeriodServiceTest extends TestCase
{
    public function test_create_and_list_room_rate_period()
    {
        $service = new \App\Services\RoomRatePeriodService();

        $property = \App\Models\Property::create(['id' => Str::uuid()->toString(), 'name' => 'Pp']);
        $category = \App\Models\RoomCategory::create(['id' => Str::uuid()->toString(), 'name' => 'Ccat']);

        $room = \App\Models\Room::create([
            'id' => Str::uuid()->toString(),
            'property_id' => $property->id,
            'room_category_id' => $category->id,
            'number' => '101',
            'name' => 'Room 101',
        ]);

        $period = $service->create($room, [
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-05',
            'people_count' => 2,
            'price_per_day' => 99,
        ]);

        $this->assertInstanceOf(\App\Models\RoomRatePeriod::class, $period);
        $list = $service->list($room);
        $this->assertIsIterable($list);
    }
}
