<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Str;

class ModelRoomCategoryRatePeriodTest extends TestCase
{
    public function test_rate_period_casts_and_relation()
    {
        $category = \App\Models\RoomCategory::create(['id' => Str::uuid()->toString(), 'name' => 'C2']);

        $period = \App\Models\RoomCategoryRatePeriod::create([
            'room_category_id' => $category->id,
            'start_date' => '2026-01-01',
            'end_date' => '2026-01-10',
            'base_one_adult' => 20,
        ]);

        $this->assertInstanceOf(\App\Models\RoomCategory::class, $period->category);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $period->start_date);
    }
}
