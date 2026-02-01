<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Models\Property;
use App\Models\Room;
use App\Models\RoomRatePeriod;

class RoomRatePeriodControllerTest extends TestCase
{
    public function test_index_returns_periods_collection()
    {
        $property = Property::create(['name' => 'P-rp', 'timezone' => 'UTC']);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '10',
            'name' => 'R10',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $period = RoomRatePeriod::create([
            'room_id' => $room->id,
            'people_count' => 2,
            'start_date' => '2026-01-01',
            'end_date' => '2026-01-10',
            'price_per_day' => 120,
        ]);

        $mockService = $this->createMock(\App\Services\RoomRatePeriodService::class);
        $mockService->expects($this->once())
            ->method('list')
            ->with($this->isInstanceOf(Room::class))
            ->willReturn(collect([$period]));

        $controller = new \App\Http\Controllers\Api\RoomRatePeriodController();

        $request = new Request();
        $request->attributes->set('property_id', (string) $property->id);

        $resp = $controller->index($request, $room, $mockService);

        $this->assertEquals(200, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertCount(1, $data);
        $this->assertEquals($period->id, $data[0]['id']);
    }

    public function test_store_creates_period_and_returns_201()
    {
        $property = Property::create(['name' => 'P-rp2', 'timezone' => 'UTC']);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '11',
            'name' => 'R11',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $validated = [
            'people_count' => 2,
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-05',
            'price_per_day' => 130,
            'description' => 'promo',
        ];

        $period = RoomRatePeriod::create(array_merge(['room_id' => $room->id], $validated));

        $mockService = $this->createMock(\App\Services\RoomRatePeriodService::class);
        $mockService->expects($this->once())
            ->method('create')
            ->with($this->isInstanceOf(Room::class), $validated)
            ->willReturn($period);

        $controller = new \App\Http\Controllers\Api\RoomRatePeriodController();

        $request = new class extends \App\Http\Requests\StoreRoomRatePeriodRequest {
            private $v;
            public function __construct()
            {
                parent::__construct();
            }
            public function setValidated($v) { $this->v = $v; }
            public function validated($key = null, $default = null) { return $this->v; }
        };
        $request->setValidated($validated);
        $request->attributes->set('property_id', (string) $property->id);

        $resp = $controller->store($request, $room, $mockService);

        $this->assertEquals(201, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals($period->id, $data['data']['id'] ?? $data['id'] ?? null);
    }

    public function test_update_calls_service_and_returns_updated()
    {
        $property = Property::create(['name' => 'P-rp3', 'timezone' => 'UTC']);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '12',
            'name' => 'R12',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $period = RoomRatePeriod::create([
            'room_id' => $room->id,
            'people_count' => 1,
            'start_date' => '2026-03-01',
            'end_date' => '2026-03-05',
            'price_per_day' => 90,
        ]);

        $validated = ['people_count' => 2, 'price_per_day' => 110];

        $mockService = $this->createMock(\App\Services\RoomRatePeriodService::class);
        $mockService->expects($this->once())
            ->method('update')
            ->with($this->isInstanceOf(RoomRatePeriod::class), $validated)
            ->willReturnCallback(function($p, $data) { $p->fill($data); $p->save(); return $p; });

        $controller = new \App\Http\Controllers\Api\RoomRatePeriodController();

        $request = new class extends \App\Http\Requests\UpdateRoomRatePeriodRequest {
            private $v;
            public function __construct()
            {
                parent::__construct();
            }
            public function setValidated($v) { $this->v = $v; }
            public function validated($key = null, $default = null) { return $this->v; }
        };
        $request->setValidated($validated);
        $request->attributes->set('property_id', (string) $property->id);

        $resp = $controller->update($request, $period, $mockService);

        $this->assertEquals(200, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals(110, $data['data']['price_per_day'] ?? $data['price_per_day'] ?? null);
        $this->assertEquals(2, $data['data']['people_count'] ?? $data['people_count'] ?? null);
    }

    public function test_destroy_calls_service_and_returns_204()
    {
        $property = Property::create(['name' => 'P-rp4', 'timezone' => 'UTC']);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '13',
            'name' => 'R13',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $period = RoomRatePeriod::create([
            'room_id' => $room->id,
            'people_count' => 1,
            'start_date' => '2026-04-01',
            'end_date' => '2026-04-05',
            'price_per_day' => 95,
        ]);

        $mockService = $this->createMock(\App\Services\RoomRatePeriodService::class);
        $mockService->expects($this->once())
            ->method('delete')
            ->with($this->isInstanceOf(RoomRatePeriod::class));

        $controller = new \App\Http\Controllers\Api\RoomRatePeriodController();

        $request = new Request();
        $request->attributes->set('property_id', (string) $property->id);

        $resp = $controller->destroy($request, $period, $mockService);

        $this->assertEquals(204, $resp->getStatusCode());
    }
}
