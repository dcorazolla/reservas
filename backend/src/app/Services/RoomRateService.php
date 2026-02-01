<?php
namespace App\Services;

use App\Models\Room;
use App\Models\RoomRate;
use Illuminate\Support\Collection;

class RoomRateService
{
    public function list(Room $room): Collection
    {
        return $room->rates()->orderBy('people_count')->get();
    }

    public function create(Room $room, array $data): RoomRate
    {
        return $room->rates()->create($data);
    }

    public function update(RoomRate $rate, array $data): RoomRate
    {
        $rate->update($data);
        return $rate;
    }

    public function delete(RoomRate $rate): void
    {
        $rate->delete();
    }
}
