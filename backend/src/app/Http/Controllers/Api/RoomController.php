<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Services\RoomService;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function __construct(
        private RoomService $service
    ) {}

    public function index(Request $request)
    {
        return response()->json(
            $this->service->list(
                $this->getPropertyId($request),
                $request
            )
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'room_category_id' => 'nullable|exists:room_categories,id',
            'number'           => 'required|string|max:10|unique:rooms,number',
            'name'             => 'required|string|max:255',
            'beds'             => 'required|integer|min:1',
            'capacity'         => 'required|integer|min:1',
            'notes'            => 'nullable|string',
        ]);

        return response()->json(
            $this->service->create(
                $data,
                $this->getPropertyId($request)
            ),
            201
        );
    }

    public function update(Request $request, Room $room)
    {
        $propertyId = $this->getPropertyId($request);
        $this->assertBelongsToProperty($room, $propertyId);

        $data = $request->validate([
            'room_category_id' => 'nullable|exists:room_categories,id',
            'number'           => 'required|string|max:10|unique:rooms,number,' . $room->id,
            'name'             => 'required|string|max:255',
            'beds'             => 'required|integer|min:1',
            'capacity'         => 'required|integer|min:1',
            'active'           => 'boolean',
            'notes'            => 'nullable|string',
        ]);

        return response()->json(
            $this->service->update($room, $data)
        );
    }

    public function destroy(Request $request, Room $room)
    {
        $propertyId = $this->getPropertyId($request);
        $this->assertBelongsToProperty($room, $propertyId);

        $this->service->delete($room);

        return response()->json(null, 204);
    }
}
