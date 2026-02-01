<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\RoomCategory;
use App\Models\RoomCategoryRatePeriod;

class RoomCategoryRatePeriodControllerTest extends TestCase
{
    public function test_index_returns_periods_from_service()
    {
        $rc = RoomCategory::create(['name' => 'RC1']);

        $period = RoomCategoryRatePeriod::create([
            'room_category_id' => $rc->id,
            'start_date' => now()->subDays(1)->toDateString(),
            'end_date' => now()->addDays(1)->toDateString(),
            'base_one_adult' => 100,
        ]);

        $mockService = $this->createMock(\App\Services\RoomCategoryRatePeriodService::class);
        $mockService->expects($this->once())
            ->method('list')
            ->with($this->isInstanceOf(RoomCategory::class))
            ->willReturn(collect([$period]));

        $controller = new \App\Http\Controllers\Api\RoomCategoryRatePeriodController();

        $resp = $controller->index($rc, $mockService);

        $this->assertEquals(200, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertIsArray($data);
        $this->assertCount(1, $data);
        $this->assertEquals($period->id, $data[0]['id']);
    }

    public function test_store_validated_and_returns_created()
    {
        $rc = RoomCategory::create(['name' => 'RC2']);

        $validated = [
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
            'base_one_adult' => 150,
        ];

        $period = new RoomCategoryRatePeriod($validated);
        $period->id = Str::uuid()->toString();
        $period->room_category_id = $rc->id;
        $period->save();

        $mockService = $this->createMock(\App\Services\RoomCategoryRatePeriodService::class);
        $mockService->expects($this->once())
            ->method('create')
            ->with($this->isInstanceOf(RoomCategory::class), $validated)
            ->willReturn($period);

        $request = new class($validated) extends \App\Http\Requests\StoreRoomCategoryRatePeriodRequest {
            private $v;
            public function __construct($v)
            {
                parent::__construct();
                $this->v = $v;
            }
            public function validated($key = null, $default = null)
            {
                if ($key === null) return $this->v;
                return $this->v[$key] ?? $default;
            }
        };

        $controller = new \App\Http\Controllers\Api\RoomCategoryRatePeriodController();

        $resp = $controller->store($request, $rc, $mockService);

        $this->assertEquals(201, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals($period->id, $data['id']);
    }

    public function test_update_calls_service_and_returns_ok()
    {
        $period = RoomCategoryRatePeriod::create([
            'room_category_id' => RoomCategory::create(['name' => 'RC3'])->id,
            'start_date' => now()->subDays(2)->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
            'base_one_adult' => 120,
        ]);

        $validated = ['base_one_adult' => 200];

        $mockService = $this->createMock(\App\Services\RoomCategoryRatePeriodService::class);
        $mockService->expects($this->once())
            ->method('update')
            ->with($this->isInstanceOf(RoomCategoryRatePeriod::class), $validated)
            ->willReturnCallback(function($p, $data) {
                $p->fill($data);
                $p->save();
                return $p;
            });

        $request = new class($validated) extends \App\Http\Requests\UpdateRoomCategoryRatePeriodRequest {
            private $v;
            public function __construct($v)
            {
                parent::__construct();
                $this->v = $v;
            }
            public function validated($key = null, $default = null)
            {
                if ($key === null) return $this->v;
                return $this->v[$key] ?? $default;
            }
        };

        $controller = new \App\Http\Controllers\Api\RoomCategoryRatePeriodController();

        $resp = $controller->update($request, $period, $mockService);

        $this->assertEquals(200, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals(200, $data['base_one_adult']);
    }

    public function test_destroy_calls_service_and_returns_204()
    {
        $period = RoomCategoryRatePeriod::create([
            'room_category_id' => RoomCategory::create(['name' => 'RC4'])->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(1)->toDateString(),
            'base_one_adult' => 100,
        ]);

        $mockService = $this->createMock(\App\Services\RoomCategoryRatePeriodService::class);
        $mockService->expects($this->once())
            ->method('delete')
            ->with($this->isInstanceOf(RoomCategoryRatePeriod::class));

        $controller = new \App\Http\Controllers\Api\RoomCategoryRatePeriodController();

        $resp = $controller->destroy($period, $mockService);

        $this->assertEquals(204, $resp->getStatusCode());
    }
}
