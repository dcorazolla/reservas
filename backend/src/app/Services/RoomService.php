<?php

namespace App\Services;

use App\Models\Room;
use App\Http\Filters\RoomFilter;
use Illuminate\Http\Request;

class RoomService
{
    public function list(string $propertyId, Request $request)
    {
        $query = Room::with('category')
            ->forProperty($propertyId);

        $filter = new RoomFilter($request);

        return $filter->apply($query)->get();
    }

    public function create(array $data, string $propertyId): Room
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
        if ($room->reservations()->exists()) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'room_id' => 'Quarto possui reservas vinculadas e não pode ser removido.',
            ]);
        }

        if ($room->rates()->exists() || $room->ratePeriods()->exists()) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'room_id' => 'Quarto possui tarifas/períodos vinculados e não pode ser removido.',
            ]);
        }

        $room->delete();
    }
}
