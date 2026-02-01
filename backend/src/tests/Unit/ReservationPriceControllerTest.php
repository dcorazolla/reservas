<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Models\Property;
use App\Models\Room;

class ReservationPriceControllerTest extends TestCase
{
    public function test_calculate_calls_service_and_returns_response()
    {
        $property = Property::create(['name' => 'P', 'timezone' => 'UTC']);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '10',
            'name' => 'R10',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $validated = [
            'room_id' => $room->id,
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-03',
            'people_count' => 2,
        ];

        $mockCalc = $this->createMock(\App\Services\ReservationPriceCalculator::class);
        $mockCalc->expects($this->once())
            ->method('calculate')
            ->with($validated['room_id'], $validated['start_date'], $validated['end_date'], $validated['people_count'])
            ->willReturn(['total' => 123.45]);

        $controller = new \App\Http\Controllers\Api\ReservationPriceController();

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

        $resp = $controller->calculate($request, $mockCalc);

        $this->assertEquals(200, $resp->getStatusCode());
        $this->assertEquals(['total' => 123.45], $resp->getData(true));
    }

    public function test_calculate_detailed_calls_service_and_returns_response()
    {
        $property = Property::create(['name' => 'P2', 'timezone' => 'UTC']);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '20',
            'name' => 'R20',
            'beds' => 1,
            'capacity' => 4,
            'active' => true,
        ]);

        $validated = [
            'room_id' => $room->id,
            'start_date' => '2026-02-05',
            'end_date' => '2026-02-07',
            'adults_count' => 2,
            'children_count' => 1,
            'infants_count' => 0,
        ];

        $mockCalc = $this->createMock(\App\Services\ReservationPriceCalculator::class);
        $mockCalc->expects($this->once())
            ->method('calculateDetailed')
            ->with($this->isInstanceOf(Room::class), $validated['start_date'], $validated['end_date'], 2, 1, 0)
            ->willReturn(['total' => 200.0]);

        $controller = new \App\Http\Controllers\Api\ReservationPriceController();

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

        $resp = $controller->calculateDetailed($request, $mockCalc);

        $this->assertEquals(200, $resp->getStatusCode());
        $this->assertEquals(['total' => 200.0], $resp->getData(true));
    }
}
