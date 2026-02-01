<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Models\Property;
use App\Models\Room;
use App\Models\RoomRate;

class RoomRateControllerTest extends TestCase
{
    public function test_index_returns_rates_collection()
    {
        $property = Property::create(['name' => 'P-rr', 'timezone' => 'UTC']);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '1',
            'name' => 'R1',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $rate = RoomRate::create(['room_id' => $room->id, 'people_count' => 1, 'price_per_day' => 100]);

        $mockService = $this->createMock(\App\Services\RoomRateService::class);
        $mockService->expects($this->once())
            ->method('list')
            ->with($this->isInstanceOf(Room::class))
            ->willReturn(collect([$rate]));

        $controller = new \App\Http\Controllers\Api\RoomRateController();

        $request = new Request();
        $request->attributes->set('property_id', (string) $property->id);

        $resp = $controller->index($request, $room, $mockService);

        $this->assertEquals(200, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertCount(1, $data);
        $this->assertEquals($rate->id, $data[0]['id']);
    }

    public function test_store_creates_rate_and_returns_201()
    {
        $property = Property::create(['name' => 'P-rr2', 'timezone' => 'UTC']);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '2',
            'name' => 'R2',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $validated = ['people_count' => 2, 'price_per_day' => 150];

        $rate = RoomRate::create(array_merge(['room_id' => $room->id], $validated));

        $mockService = $this->createMock(\App\Services\RoomRateService::class);
        $mockService->expects($this->once())
            ->method('create')
            ->with($this->isInstanceOf(Room::class), $validated)
            ->willReturn($rate);

        $controller = new \App\Http\Controllers\Api\RoomRateController();

        $request = new class extends \App\Http\Requests\StoreRoomRateRequest {
            private $v;
            public function __construct()
            {
                parent::__construct();
            }
            public function setValidated($v)
            {
                $this->v = $v;
            }
            public function validated($key = null, $default = null)
            {
                return $this->v;
            }
        };
        $request->setValidated($validated);
        $request->attributes->set('property_id', (string) $property->id);

        $resp = $controller->store($request, $room, $mockService);

        $this->assertEquals(201, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals($rate->id, $data['data']['id'] ?? $data['id'] ?? null);
    }

    public function test_update_calls_service_and_returns_updated()
    {
        $property = Property::create(['name' => 'P-rr3', 'timezone' => 'UTC']);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '3',
            'name' => 'R3',
            'beds' => 1,
            'capacity' => 4,
            'active' => true,
        ]);

        $rate = RoomRate::create(['room_id' => $room->id, 'people_count' => 1, 'price_per_day' => 100]);

        $validated = ['people_count' => 3, 'price_per_day' => 200];

        $mockService = $this->createMock(\App\Services\RoomRateService::class);
        $mockService->expects($this->once())
            ->method('update')
            ->with($this->isInstanceOf(RoomRate::class), $validated)
            ->willReturnCallback(function($r, $data) {
                $r->fill($data);
                $r->save();
                return $r;
            });

        $controller = new \App\Http\Controllers\Api\RoomRateController();

        $request = new class extends \App\Http\Requests\UpdateRoomRateRequest {
            private $v;
            public function __construct()
            {
                parent::__construct();
            }
            public function setValidated($v)
            {
                $this->v = $v;
            }
            public function validated($key = null, $default = null)
            {
                return $this->v;
            }
        };
        $request->setValidated($validated);
        $request->attributes->set('property_id', (string) $property->id);

        $resp = $controller->update($request, $rate, $mockService);

        $this->assertEquals(200, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $payload = $data['data'] ?? $data;
        $this->assertEquals(200, $data['data']['price_per_day'] ?? $payload['price_per_day']);
        $this->assertEquals(3, $payload['people_count']);
    }

    public function test_destroy_calls_service_and_returns_204()
    {
        $property = Property::create(['name' => 'P-rr4', 'timezone' => 'UTC']);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '4',
            'name' => 'R4',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $rate = RoomRate::create(['room_id' => $room->id, 'people_count' => 1, 'price_per_day' => 100]);

        $mockService = $this->createMock(\App\Services\RoomRateService::class);
        $mockService->expects($this->once())
            ->method('delete')
            ->with($this->isInstanceOf(RoomRate::class));

        $controller = new \App\Http\Controllers\Api\RoomRateController();

        $request = new Request();
        $request->attributes->set('property_id', (string) $property->id);

        $resp = $controller->destroy($request, $rate, $mockService);

        $this->assertEquals(204, $resp->getStatusCode());
    }
}
