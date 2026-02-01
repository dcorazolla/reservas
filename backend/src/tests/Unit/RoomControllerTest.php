<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Models\Property;
use App\Models\Room;

class RoomControllerTest extends TestCase
{
    public function test_index_returns_list_from_service()
    {
        $property = Property::create(['name' => 'P', 'timezone' => 'UTC']);

        $expected = [
            ['id' => 1, 'name' => 'R1'],
        ];

        $mockService = $this->createMock(\App\Services\RoomService::class);
        $mockService->expects($this->once())
            ->method('list')
            ->with((string) $property->id, $this->isInstanceOf(Request::class))
            ->willReturn($expected);

        $controller = new \App\Http\Controllers\Api\RoomController($mockService);

        $request = new Request();
        $request->attributes->set('property_id', (string) $property->id);

        $resp = $controller->index($request);

        $this->assertEquals(200, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals($expected, $data);
    }

    public function test_store_creates_room_and_returns_201()
    {
        $property = Property::create(['name' => 'P2', 'timezone' => 'UTC']);

        $validated = [
            'room_category_id' => null,
            'number' => '200',
            'name' => 'Room 200',
            'beds' => 1,
            'capacity' => 2,
            'notes' => null,
        ];

        $mockService = $this->createMock(\App\Services\RoomService::class);
        $room = Room::create(array_merge($validated, ['property_id' => $property->id, 'active' => true]));

        $mockService->expects($this->once())
            ->method('create')
            ->with($validated, (string) $property->id)
            ->willReturn($room);

        $controller = new \App\Http\Controllers\Api\RoomController($mockService);

        $request = new class($validated) extends Request {
            private $v;
            public function __construct($v)
            {
                parent::__construct();
                $this->v = $v;
            }
            public function validate($rules)
            {
                return $this->v;
            }
        };

        $request->attributes->set('property_id', (string) $property->id);

        $resp = $controller->store($request);

        $this->assertEquals(201, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals($room->id, $data['id']);
    }

    public function test_update_calls_service_and_returns_updated()
    {
        $property = Property::create(['name' => 'P3', 'timezone' => 'UTC']);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '300',
            'name' => 'R300',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $validated = [
            'room_category_id' => null,
            'number' => '300',
            'name' => 'R300-updated',
            'beds' => 2,
            'capacity' => 3,
            'active' => true,
            'notes' => 'updated',
        ];

        $mockService = $this->createMock(\App\Services\RoomService::class);
        $mockService->expects($this->once())
            ->method('update')
            ->with($this->isInstanceOf(Room::class), $validated)
            ->willReturnCallback(function($r, $data) {
                $r->fill($data);
                $r->save();
                return $r;
            });

        $controller = new \App\Http\Controllers\Api\RoomController($mockService);

        $request = new class($validated) extends Request {
            private $v;
            public function __construct($v)
            {
                parent::__construct();
                $this->v = $v;
            }
            public function validate($rules)
            {
                return $this->v;
            }
        };

        $request->attributes->set('property_id', (string) $property->id);

        $resp = $controller->update($request, $room);

        $this->assertEquals(200, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals('R300-updated', $data['name']);
        $this->assertEquals(3, $data['capacity']);
    }

    public function test_destroy_calls_service_and_returns_204()
    {
        $property = Property::create(['name' => 'P4', 'timezone' => 'UTC']);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '400',
            'name' => 'R400',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $mockService = $this->createMock(\App\Services\RoomService::class);
        $mockService->expects($this->once())
            ->method('delete')
            ->with($this->isInstanceOf(Room::class));

        $controller = new \App\Http\Controllers\Api\RoomController($mockService);

        $request = new Request();
        $request->attributes->set('property_id', (string) $property->id);

        $resp = $controller->destroy($request, $room);

        $this->assertEquals(204, $resp->getStatusCode());
    }
}
