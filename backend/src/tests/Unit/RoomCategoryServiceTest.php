<?php

namespace Tests\Unit;

use App\Models\RoomCategory;
use App\Services\RoomCategoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoomCategoryServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_list_create_update_and_delete()
    {
        $service = new RoomCategoryService();

        $list = $service->list();
        $this->assertIsArray($list->toArray());

        $cat = $service->create(['name' => 'C1', 'description' => 'd']);
        $this->assertInstanceOf(RoomCategory::class, $cat);

        $updated = $service->update($cat, ['name' => 'C2']);
        $this->assertEquals('C2', $updated->name);

        $service->delete($updated);
        $this->assertDatabaseMissing('room_categories', ['id' => $updated->id]);
    }
}
