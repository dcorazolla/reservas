<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\RoomCategoryRateResource;
use App\Http\Requests\StoreRoomCategoryRateRequest;
use App\Http\Requests\UpdateRoomCategoryRateRequest;
use App\Services\RoomCategoryRateService;
use App\Models\RoomCategory;
use App\Models\RoomCategoryRate;

class RoomCategoryRateController extends BaseApiController
{
    public function index(RoomCategory $roomCategory, RoomCategoryRateService $service)
    {
        return $this->ok(RoomCategoryRateResource::collection($service->list($roomCategory)));
    }

    public function store(StoreRoomCategoryRateRequest $request, RoomCategory $roomCategory, RoomCategoryRateService $service)
    {
        $data = $request->validated();

        $rate = $service->create($roomCategory, $data);
        return $this->created(new RoomCategoryRateResource($rate));
    }

    public function update(UpdateRoomCategoryRateRequest $request, RoomCategoryRate $rate, RoomCategoryRateService $service)
    {
        $data = $request->validated();

        return $this->ok(new RoomCategoryRateResource($service->update($rate, $data)));
    }

    public function destroy(RoomCategoryRate $rate, RoomCategoryRateService $service)
    {
        $service->delete($rate);
        return $this->noContent();
    }
}
