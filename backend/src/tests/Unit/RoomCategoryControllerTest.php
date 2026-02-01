<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Models\RoomCategory;

class RoomCategoryControllerTest extends TestCase
{
    public function test_index_returns_list_from_service()
    {
        $expected = [
            ['id' => 'rc-1', 'name' => 'C1'],
        ];

        $mockService = $this->createMock(\App\Services\RoomCategoryService::class);
        $mockService->expects($this->once())
            ->method('list')
            ->willReturn($expected);

        $controller = new \App\Http\Controllers\Api\RoomCategoryController($mockService);

        $resp = $controller->index();

        $this->assertEquals(200, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals($expected, $data);
    }

    public function test_store_validates_and_returns_201()
    {
        $validated = [
            'name' => 'Categoria X',
            'description' => 'desc',
        ];

        $roomCategory = RoomCategory::create($validated);

        $mockService = $this->createMock(\App\Services\RoomCategoryService::class);
        $mockService->expects($this->once())
            ->method('create')
            ->with($validated)
            ->willReturn($roomCategory);

        $controller = new \App\Http\Controllers\Api\RoomCategoryController($mockService);

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

        $resp = $controller->store($request);

        $this->assertEquals(201, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals($roomCategory->id, $data['id']);
    }

    public function test_update_calls_service_and_returns_updated()
    {
        $rc = RoomCategory::create(['name' => 'Orig', 'description' => null]);

        $validated = ['name' => 'Updated', 'description' => 'u'];

        $mockService = $this->createMock(\App\Services\RoomCategoryService::class);
        $mockService->expects($this->once())
            ->method('update')
            ->with($this->isInstanceOf(RoomCategory::class), $validated)
            ->willReturnCallback(function($r, $data) {
                $r->fill($data);
                $r->save();
                return $r;
            });

        $controller = new \App\Http\Controllers\Api\RoomCategoryController($mockService);

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

        $resp = $controller->update($request, $rc);

        $this->assertEquals(200, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals('Updated', $data['name']);
    }

    public function test_destroy_calls_service_and_returns_204()
    {
        $rc = RoomCategory::create(['name' => 'ToDel', 'description' => null]);

        $mockService = $this->createMock(\App\Services\RoomCategoryService::class);
        $mockService->expects($this->once())
            ->method('delete')
            ->with($this->isInstanceOf(RoomCategory::class));

        $controller = new \App\Http\Controllers\Api\RoomCategoryController($mockService);

        $resp = $controller->destroy($rc);

        $this->assertEquals(204, $resp->getStatusCode());
    }
}
