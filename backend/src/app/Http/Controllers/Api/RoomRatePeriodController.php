<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\RoomRatePeriodResource;
use App\Http\Requests\StoreRoomRatePeriodRequest;
use App\Http\Requests\UpdateRoomRatePeriodRequest;
use App\Services\RoomRatePeriodService;
use App\Models\Room;
use App\Models\RoomRatePeriod;
use Illuminate\Http\Request;

class RoomRatePeriodController extends BaseApiController
{
    public function index(Request $request, Room $room, RoomRatePeriodService $service)
    {
        $propertyId = $this->getPropertyId($request);
        $this->assertBelongsToProperty($room, $propertyId);

        return $this->ok(RoomRatePeriodResource::collection($service->list($room)));
    }

    public function store(StoreRoomRatePeriodRequest $request, Room $room, RoomRatePeriodService $service)
    {
        $propertyId = $this->getPropertyId($request);
        $this->assertBelongsToProperty($room, $propertyId);

        $data = $request->validated();

        $period = $service->create($room, $data);
        return $this->created(new RoomRatePeriodResource($period));
    }

    public function update(UpdateRoomRatePeriodRequest $request, RoomRatePeriod $period, RoomRatePeriodService $service)
    {
        $propertyId = $this->getPropertyId($request);
        $this->assertBelongsToProperty($period->room, $propertyId);

        $data = $request->validated();

        return $this->ok(new RoomRatePeriodResource($service->update($period, $data)));
    }

    public function destroy(Request $request, RoomRatePeriod $period, RoomRatePeriodService $service)
    {
        $propertyId = $this->getPropertyId($request);
        $this->assertBelongsToProperty($period->room, $propertyId);

        $service->delete($period);
        return $this->noContent();
    }
}
