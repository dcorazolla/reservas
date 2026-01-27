<?php

namespace App\Services;

use App\Models\Room;
use App\Http\Filters\RoomFilter;
use Illuminate\Http\Request;

class RoomService
{
    public function list(int $propertyId, Request $request)
    {
        $query = Room::with('category')
            ->forProperty($propertyId);

        $filter = new RoomFilter($request);

        return $filter->apply($query)->get();
    }

    public function create(array $data, int $propertyId): Room
    {
        return Room::create([
            ...$data,
            'property_id' => $propertyId,
        ]);
    }

    public function update(Room $room, array $data): Room
    {
        $room->update($data);
        return $room->load('category');
    }

    public function delete(Room $room): void
    {
        $room->update(['active' => false]);
    }
}
