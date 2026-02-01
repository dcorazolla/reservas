<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\RoomCategory;
use App\Models\RoomCategoryRatePeriod;
use App\Services\RoomCategoryRatePeriodService;

class RoomCategoryRatePeriodServiceExtraTest extends TestCase
{
    public function test_calls_all_period_service_methods()
    {
        $category = RoomCategory::create(['name' => 'ExtraPeriod']);

        $service = new RoomCategoryRatePeriodService();

        // list empty
        $list = $service->list($category);
        $this->assertIsIterable($list);

        // create
        $data = ['start_date' => now()->toDateString(), 'end_date' => now()->addDay()->toDateString(), 'base_one_adult' => 66];
        $period = $service->create($category, $data);
        $this->assertInstanceOf(RoomCategoryRatePeriod::class, $period);

        // update
        $updated = $service->update($period, ['base_one_adult' => 77]);
        $this->assertEquals(77, $updated->base_one_adult);

        // delete
        $service->delete($updated);
        $this->assertDatabaseMissing('room_category_rate_periods', ['id' => $updated->id]);
    }
}
