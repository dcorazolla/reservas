<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Str;
use App\Models\RoomCategory;
use App\Models\RoomCategoryRatePeriod;
use App\Services\RoomCategoryRatePeriodService;

class RoomCategoryRatePeriodServiceTest extends TestCase
{
    public function test_list_returns_periods_ordered_desc_by_start_date()
    {
        $category = RoomCategory::create(['name' => 'C1']);

        $p1 = RoomCategoryRatePeriod::create([
            'room_category_id' => $category->id,
            'start_date' => now()->subDays(5)->toDateString(),
            'end_date' => now()->subDays(3)->toDateString(),
            'base_one_adult' => 10,
        ]);

        $p2 = RoomCategoryRatePeriod::create([
            'room_category_id' => $category->id,
            'start_date' => now()->subDays(1)->toDateString(),
            'end_date' => now()->addDays(1)->toDateString(),
            'base_one_adult' => 20,
        ]);

        $service = new RoomCategoryRatePeriodService();
        $list = $service->list($category);

        $this->assertEquals($p2->id, $list->first()->id);
        $this->assertEquals($p1->id, $list->last()->id);
    }

    public function test_create_persists_period_with_category()
    {
        $category = RoomCategory::create(['name' => 'C2']);

        $data = [
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
            'base_one_adult' => 50,
        ];

        $service = new RoomCategoryRatePeriodService();
        $period = $service->create($category, $data);

        $this->assertDatabaseHas('room_category_rate_periods', ['id' => $period->id]);
        $this->assertEquals($category->id, $period->room_category_id);
    }

    public function test_update_changes_fields()
    {
        $category = RoomCategory::create(['name' => 'C3']);
        $period = RoomCategoryRatePeriod::create([
            'room_category_id' => $category->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(1)->toDateString(),
            'base_one_adult' => 30,
        ]);

        $service = new RoomCategoryRatePeriodService();
        $updated = $service->update($period, ['base_one_adult' => 99]);

        $this->assertEquals(99, $updated->base_one_adult);
        $this->assertDatabaseHas('room_category_rate_periods', ['id' => $period->id, 'base_one_adult' => 99]);
    }

    public function test_delete_removes_period()
    {
        $category = RoomCategory::create(['name' => 'C4']);
        $period = RoomCategoryRatePeriod::create([
            'room_category_id' => $category->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(1)->toDateString(),
            'base_one_adult' => 30,
        ]);

        $service = new RoomCategoryRatePeriodService();
        $service->delete($period);

        $this->assertDatabaseMissing('room_category_rate_periods', ['id' => $period->id]);
    }
}
