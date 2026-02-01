<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Str;
use App\Models\RoomCategory;
use App\Models\RoomCategoryRate;
use App\Services\RoomCategoryRateService;

class RoomCategoryRateServiceExtraTest extends TestCase
{
    public function test_calls_all_service_methods_directly()
    {
        $category = RoomCategory::create(['name' => 'Extra1']);

        $service = new RoomCategoryRateService();

        // list when empty
        $list = $service->list($category);
        $this->assertTrue($list->isEmpty());

        // create
        $rate = $service->create($category, ['base_one_adult' => 150]);
        $this->assertInstanceOf(RoomCategoryRate::class, $rate);
        $this->assertEquals(150, $rate->base_one_adult);

        // update
        $updated = $service->update($rate, ['base_one_adult' => 175]);
        $this->assertEquals(175, $updated->base_one_adult);

        // delete
        $service->delete($updated);
        $this->assertDatabaseMissing('room_category_rates', ['id' => $updated->id]);
    }
}
