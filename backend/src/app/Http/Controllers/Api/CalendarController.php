<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\RoomResource;
use App\Services\CalendarService;
use Illuminate\Http\Request;

class CalendarController extends BaseApiController
{
    public function __construct(
        private CalendarService $service
    ) {}

    public function index(Request $request)
    {
        $data = $request->validate([
            'start' => 'required|date',
            'end'   => 'required|date|after_or_equal:start',
        ]);

        $propertyId = $this->getPropertyId($request);

        $rooms = $this->service->getRoomsWithReservations($propertyId, $data['start'], $data['end']);

        return $this->ok([
            'start' => $data['start'],
            'end'   => $data['end'],
            'rooms' => RoomResource::collection($rooms),
        ]);
    }
}
