<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Str;

class ModelRoomCategoryRateTest extends TestCase
{
    public function test_room_category_rate_relation()
    {
        $category = \App\Models\RoomCategory::create(['id' => Str::uuid()->toString(), 'name' => 'C']);

        $rate = \App\Models\RoomCategoryRate::create([
            'room_category_id' => $category->id,
            'base_one_adult' => 10,
        ]);

        $this->assertInstanceOf(\App\Models\RoomCategory::class, $rate->category);
    }
}
