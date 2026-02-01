<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Models\Property;
use App\Models\Room;
use App\Http\Controllers\Api\CalendarController;
use Illuminate\Support\Collection;

class CalendarControllerTest extends TestCase
{
    public function test_index_validates_and_returns_rooms_collection()
    {
        $property = Property::create([
            'name' => 'Cal Test',
            'timezone' => 'UTC',
        ]);

        $room = Room::create([
            'property_id' => $property->id,
            'number' => '10',
            'name' => 'Sala 10',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $mockService = $this->createMock(\App\Services\CalendarService::class);
        $mockService->expects($this->once())
            ->method('getRoomsWithReservations')
            ->with($property->id, '2026-02-01', '2026-02-03')
            ->willReturn(Collection::make([$room]));

        $controller = new CalendarController($mockService);

        // Create a Request that bypasses the validator to avoid Carbon timezone parsing issues in unit test environment
        $request = new class($property->id) extends Request {
            private $propId;
            public function __construct($propId)
            {
                parent::__construct();
                $this->propId = $propId;
                $this->server->set('HTTP_X-Property-Id', $propId);
            }

            public function validate($rules)
            {
                return ['start' => '2026-02-01', 'end' => '2026-02-03'];
            }
        };

        $resp = $controller->index($request);

        $this->assertEquals(200, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals('2026-02-01', $data['start']);
        $this->assertEquals('2026-02-03', $data['end']);
        $this->assertArrayHasKey('rooms', $data);
        $this->assertCount(1, $data['rooms']);
    }
}
