<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\RoomCategoryRatePeriodResource;
use App\Http\Requests\StoreRoomCategoryRatePeriodRequest;
use App\Http\Requests\UpdateRoomCategoryRatePeriodRequest;
use App\Services\RoomCategoryRatePeriodService;
use App\Models\RoomCategory;
use App\Models\RoomCategoryRatePeriod;

class RoomCategoryRatePeriodController extends BaseApiController
{
    public function index(RoomCategory $roomCategory, RoomCategoryRatePeriodService $service)
    {
        return $this->ok(RoomCategoryRatePeriodResource::collection($service->list($roomCategory)));
    }

    public function store(StoreRoomCategoryRatePeriodRequest $request, RoomCategory $roomCategory, RoomCategoryRatePeriodService $service)
    {
        $data = $request->validated();

        $period = $service->create($roomCategory, $data);
        return $this->created(new RoomCategoryRatePeriodResource($period));
    }

    public function update(UpdateRoomCategoryRatePeriodRequest $request, RoomCategoryRatePeriod $period, RoomCategoryRatePeriodService $service)
    {
        $data = $request->validated();

        return $this->ok(new RoomCategoryRatePeriodResource($service->update($period, $data)));
    }

    public function destroy(RoomCategoryRatePeriod $period, RoomCategoryRatePeriodService $service)
    {
        $service->delete($period);
        return $this->noContent();
    }
}
