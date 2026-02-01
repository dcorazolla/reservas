<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Models\Property;
use App\Models\Room;
use App\Models\Reservation;

class ReservationControllerTest extends TestCase
{
    public function test_store_calls_service_and_returns_created_response()
    {
        $property = Property::create(['name' => 'P', 'timezone' => 'UTC']);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '101',
            'name' => 'R101',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $validated = [
            'room_id' => $room->id,
            'guest_name' => 'G',
            'email' => null,
            'phone' => null,
            'adults_count' => 2,
            'children_count' => 0,
            'infants_count' => 0,
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-03',
            'notes' => null,
        ];

        $mockService = $this->createMock(\App\Services\CreateReservationService::class);
        $reservation = Reservation::create([
            'room_id' => $room->id,
            'guest_name' => 'G',
            'adults_count' => 2,
            'children_count' => 0,
            'infants_count' => 0,
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-03',
            'status' => 'pre-reserva',
        ]);

        $mockService->expects($this->once())
            ->method('create')
            ->with($validated)
            ->willReturn($reservation);

        $controller = new \App\Http\Controllers\Api\ReservationController();

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

        $resp = $controller->store($request, $mockService);

        $this->assertEquals(201, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals($reservation->id, $data['id']);
    }

    public function test_update_recalculates_total_and_updates_reservation()
    {
        $property = Property::create(['name' => 'P2', 'timezone' => 'UTC']);
        $room = Room::create([
            'property_id' => $property->id,
            'number' => '102',
            'name' => 'R102',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $reservation = Reservation::create([
            'room_id' => $room->id,
            'guest_name' => 'Old',
            'adults_count' => 1,
            'children_count' => 0,
            'infants_count' => 0,
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-02',
            'status' => 'pre-reserva',
        ]);

        $validated = [
            'adults_count' => 2,
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-03',
        ];

        $mockCalc = $this->createMock(\App\Services\ReservationPriceCalculator::class);
        $mockCalc->expects($this->once())
            ->method('calculateDetailed')
            ->with($this->isInstanceOf(\App\Models\Room::class), '2026-02-01', '2026-02-03', 2, 0, 0)
            ->willReturn(['total' => 500.0]);

        $mockService = $this->createMock(\App\Services\ReservationService::class);
        $mockService->expects($this->once())
            ->method('update')
            ->with($reservation, $this->isType('array'))
            ->willReturnCallback(function($res, $data) use ($reservation) {
                $reservation->fill($data);
                $reservation->save();
                return $reservation;
            });

        $controller = new \App\Http\Controllers\Api\ReservationController();

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

        $resp = $controller->update($request, $reservation, $mockCalc, $mockService);

        $this->assertEquals(200, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals(500.0, $data['total_value']);
        $this->assertEquals(2, $data['adults_count']);
    }

    public function test_show_returns_reservation_resource()
    {
        $property = Property::create(['name' => 'P3', 'timezone' => 'UTC']);
        $room = Room::create([
            'property_id' => $property->id,
            'number' => '103',
            'name' => 'R103',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $reservation = Reservation::create([
            'room_id' => $room->id,
            'guest_name' => 'Show',
            'adults_count' => 1,
            'children_count' => 0,
            'infants_count' => 0,
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-02',
            'status' => 'pre-reserva',
        ]);

        $controller = new \App\Http\Controllers\Api\ReservationController();
        $resp = $controller->show($reservation);

        $this->assertEquals(200, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals($reservation->id, $data['id']);
    }
}
