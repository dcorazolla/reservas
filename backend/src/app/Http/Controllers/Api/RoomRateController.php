<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\RoomRateResource;
use App\Http\Requests\StoreRoomRateRequest;
use App\Http\Requests\UpdateRoomRateRequest;
use App\Services\RoomRateService;
use App\Models\Room;
use App\Models\RoomRate;
use Illuminate\Http\Request;

class RoomRateController extends BaseApiController
{
    public function index(Request $request, Room $room, RoomRateService $service)
    {
        $propertyId = $this->getPropertyId($request);
        $this->assertBelongsToProperty($room, $propertyId);

        return $this->ok(RoomRateResource::collection($service->list($room)));
    }

    public function store(StoreRoomRateRequest $request, Room $room, RoomRateService $service)
    {
        $propertyId = $this->getPropertyId($request);
        $this->assertBelongsToProperty($room, $propertyId);

        $data = $request->validated();

        $rate = $service->create($room, $data);
        return $this->created(new RoomRateResource($rate));
    }

    public function update(UpdateRoomRateRequest $request, RoomRate $rate, RoomRateService $service)
    {
        $propertyId = $this->getPropertyId($request);
        $this->assertBelongsToProperty($rate->room, $propertyId);

        $data = $request->validated();

        return $this->ok(new RoomRateResource($service->update($rate, $data)));
    }

    public function destroy(Request $request, RoomRate $rate, RoomRateService $service)
    {
        $propertyId = $this->getPropertyId($request);
        $this->assertBelongsToProperty($rate->room, $propertyId);

        $service->delete($rate);
        return $this->noContent();
    }
}
