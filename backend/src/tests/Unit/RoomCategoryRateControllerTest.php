<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\RoomCategory;
use App\Models\RoomCategoryRate;
use Illuminate\Http\Request;

class RoomCategoryRateControllerTest extends TestCase
{
    public function test_index_returns_rates_collection()
    {
        $rc = RoomCategory::create(['name' => 'Cat A', 'description' => null]);

        $rate = RoomCategoryRate::create([
            'room_category_id' => $rc->id,
            'base_one_adult' => 100,
        ]);

        $mockService = $this->createMock(\App\Services\RoomCategoryRateService::class);
        $mockService->expects($this->once())
            ->method('list')
            ->with($this->isInstanceOf(RoomCategory::class))
            ->willReturn(collect([$rate]));

        $controller = new \App\Http\Controllers\Api\RoomCategoryRateController();

        $resp = $controller->index($rc, $mockService);

        $this->assertEquals(200, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertCount(1, $data);
        $this->assertEquals($rate->id, $data[0]['id']);
    }

    public function test_store_creates_rate_and_returns_201()
    {
        $rc = RoomCategory::create(['name' => 'Cat B', 'description' => null]);

        $validated = ['base_one_adult' => 110, 'child_price' => 10];

        $rate = RoomCategoryRate::create(array_merge(['room_category_id' => $rc->id], $validated));

        $mockService = $this->createMock(\App\Services\RoomCategoryRateService::class);
        $mockService->expects($this->once())
            ->method('create')
            ->with($this->isInstanceOf(RoomCategory::class), $validated)
            ->willReturn($rate);

        $controller = new \App\Http\Controllers\Api\RoomCategoryRateController();

        $request = new class extends \App\Http\Requests\StoreRoomCategoryRateRequest {
            private $v;
            public function setValidated($v) { $this->v = $v; }
            public function validated($key = null, $default = null) { return $this->v; }
        };
        $request->setValidated($validated);

        $resp = $controller->store($request, $rc, $mockService);

        $this->assertEquals(201, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals($rate->id, $data['data']['id'] ?? $data['id'] ?? null);
    }

    public function test_update_calls_service_and_returns_updated()
    {
        $rate = RoomCategoryRate::create(['room_category_id' => RoomCategory::create(['name'=>'C','description'=>null])->id, 'base_one_adult' => 90]);

        $validated = ['base_one_adult' => 95];

        $mockService = $this->createMock(\App\Services\RoomCategoryRateService::class);
        $mockService->expects($this->once())
            ->method('update')
            ->with($this->isInstanceOf(RoomCategoryRate::class), $validated)
            ->willReturnCallback(function($r, $data) { $r->fill($data); $r->save(); return $r; });

        $controller = new \App\Http\Controllers\Api\RoomCategoryRateController();

        $request = new class extends \App\Http\Requests\UpdateRoomCategoryRateRequest {
            private $v;
            public function setValidated($v) { $this->v = $v; }
            public function validated($key = null, $default = null) { return $this->v; }
        };
        $request->setValidated($validated);

        $resp = $controller->update($request, $rate, $mockService);

        $this->assertEquals(200, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals(95, $data['data']['base_one_adult'] ?? $data['base_one_adult'] ?? null);
    }

    public function test_destroy_calls_service_and_returns_204()
    {
        $rate = RoomCategoryRate::create(['room_category_id' => RoomCategory::create(['name'=>'D','description'=>null])->id, 'base_one_adult' => 80]);

        $mockService = $this->createMock(\App\Services\RoomCategoryRateService::class);
        $mockService->expects($this->once())
            ->method('delete')
            ->with($this->isInstanceOf(RoomCategoryRate::class));

        $controller = new \App\Http\Controllers\Api\RoomCategoryRateController();

        $resp = $controller->destroy($rate, $mockService);

        $this->assertEquals(204, $resp->getStatusCode());
    }
}
