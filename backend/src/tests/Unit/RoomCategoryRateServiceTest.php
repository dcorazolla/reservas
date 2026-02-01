<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\RoomCategory;
use App\Models\RoomCategoryRate;
use App\Services\RoomCategoryRateService;

class RoomCategoryRateServiceTest extends TestCase
{
    public function test_list_returns_empty_when_no_rate()
    {
        $category = RoomCategory::create(['name' => 'CR1']);

        $service = new RoomCategoryRateService();
        $list = $service->list($category);

        $this->assertTrue($list->isEmpty());
    }

    public function test_list_returns_rate_when_present()
    {
        $category = RoomCategory::create(['name' => 'CR2']);
        $rate = RoomCategoryRate::create([
            'room_category_id' => $category->id,
            'base_one_adult' => 123,
        ]);

        $service = new RoomCategoryRateService();
        $list = $service->list($category);

        $this->assertCount(1, $list);
        $this->assertEquals($rate->id, $list->first()->id);
    }

    public function test_create_updates_model_and_returns_rate()
    {
        $category = RoomCategory::create(['name' => 'CR3']);

        $data = ['base_one_adult' => 200];
        $service = new RoomCategoryRateService();
        $rate = $service->create($category, $data);

        $this->assertDatabaseHas('room_category_rates', ['id' => $rate->id, 'base_one_adult' => 200]);
        $this->assertEquals($category->id, $rate->room_category_id);
    }

    public function test_update_changes_fields()
    {
        $category = RoomCategory::create(['name' => 'CR4']);
        $rate = RoomCategoryRate::create(['room_category_id' => $category->id, 'base_one_adult' => 10]);

        $service = new RoomCategoryRateService();
        $updated = $service->update($rate, ['base_one_adult' => 77]);

        $this->assertEquals(77, $updated->base_one_adult);
        $this->assertDatabaseHas('room_category_rates', ['id' => $rate->id, 'base_one_adult' => 77]);
    }

    public function test_delete_removes_rate()
    {
        $category = RoomCategory::create(['name' => 'CR5']);
        $rate = RoomCategoryRate::create(['room_category_id' => $category->id, 'base_one_adult' => 10]);

        $service = new RoomCategoryRateService();
        $service->delete($rate);

        $this->assertDatabaseMissing('room_category_rates', ['id' => $rate->id]);
    }
}
