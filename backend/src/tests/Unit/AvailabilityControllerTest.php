<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Models\Property;
use App\Models\Room;
use App\Models\Reservation;

class AvailabilityControllerTest extends TestCase
{
    public function test_search_returns_available_rooms_with_pricing()
    {
        $property = Property::create(['name' => 'AvailProp', 'timezone' => 'UTC']);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '200',
            'name' => 'Room 200',
            'beds' => 1,
            'capacity' => 3,
            'active' => true,
        ]);

        $data = [
            'checkin' => '2026-02-01',
            'checkout' => '2026-02-03',
            'adults' => 2,
            'children' => 0,
            'infants' => 0,
        ];

        $mockCalc = $this->createMock(\App\Services\ReservationPriceCalculator::class);
        $mockCalc->expects($this->once())
            ->method('calculateDetailed')
            ->with($this->isInstanceOf(\App\Models\Room::class), '2026-02-01', '2026-02-03', 2, 0, 0)
            ->willReturn(['source' => 'room_rate', 'total' => 200.0, 'days' => 2]);

        $controller = new \App\Http\Controllers\Api\AvailabilityController();

        $request = new class($data, $property->id) extends Request {
            private $v;
            public function __construct($v, $pid)
            {
                parent::__construct();
                $this->v = $v;
                $this->attributes->set('property_id', $pid);
            }
            public function validate($rules)
            {
                return $this->v;
            }
        };

        $resp = $controller->search($request, $mockCalc);

        $this->assertEquals(200, $resp->getStatusCode());
        $out = json_decode($resp->getContent(), true);
        $this->assertCount(1, $out);
        $this->assertEquals($room->id, $out[0]['room_id']);
        $this->assertEquals(200.0, $out[0]['total']);
    }

    public function test_search_skips_conflicting_and_over_capacity_rooms()
    {
        $property = Property::create(['name' => 'AvailProp2', 'timezone' => 'UTC']);

        // room too small
        $small = Room::create([
            'property_id' => $property->id,
            'number' => '201',
            'name' => 'Small',
            'beds' => 1,
            'capacity' => 1,
            'active' => true,
        ]);

        // room with conflict
        $conflictRoom = Room::create([
            'property_id' => $property->id,
            'number' => '202',
            'name' => 'Conf',
            'beds' => 1,
            'capacity' => 3,
            'active' => true,
        ]);

        // create a conflicting reservation on confRoom
        Reservation::create([
            'room_id' => $conflictRoom->id,
            'guest_name' => 'X',
            'adults_count' => 1,
            'children_count' => 0,
            'infants_count' => 0,
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-04',
            'status' => 'pre-reserva',
        ]);

        $good = Room::create([
            'property_id' => $property->id,
            'number' => '203',
            'name' => 'Good',
            'beds' => 1,
            'capacity' => 3,
            'active' => true,
        ]);

        $data = [
            'checkin' => '2026-02-01',
            'checkout' => '2026-02-03',
            'adults' => 2,
            'children' => 0,
            'infants' => 0,
        ];

        $mockCalc = $this->createMock(\App\Services\ReservationPriceCalculator::class);
        $mockCalc->expects($this->once())
            ->method('calculateDetailed')
            ->with($this->isInstanceOf(\App\Models\Room::class), '2026-02-01', '2026-02-03', 2, 0, 0)
            ->willReturn(['source' => 'room_rate', 'total' => 300.0, 'days' => 2]);

        $controller = new \App\Http\Controllers\Api\AvailabilityController();

        $request = new class($data, $property->id) extends Request {
            private $v;
            public function __construct($v, $pid)
            {
                parent::__construct();
                $this->v = $v;
                $this->attributes->set('property_id', $pid);
            }
            public function validate($rules)
            {
                return $this->v;
            }
        };

        $resp = $controller->search($request, $mockCalc);

        $this->assertEquals(200, $resp->getStatusCode());
        $out = json_decode($resp->getContent(), true);
        // only 'good' room should be present
        $this->assertCount(1, $out);
        $this->assertEquals($good->id, $out[0]['room_id']);
    }
}
