<?php
namespace App\Services;

use App\Models\Room;
use App\Models\RoomRatePeriod;
use Illuminate\Support\Collection;

class RoomRatePeriodService
{
    public function list(Room $room): Collection
    {
        return $room->ratePeriods()->orderByDesc('start_date')->get();
    }

    public function create(Room $room, array $data): RoomRatePeriod
    {
        return $room->ratePeriods()->create($data);
    }

    public function update(RoomRatePeriod $period, array $data): RoomRatePeriod
    {
        $period->update($data);
        return $period;
    }

    public function delete(RoomRatePeriod $period): void
    {
        $period->delete();
    }
}
