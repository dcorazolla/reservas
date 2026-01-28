<?php
namespace App\Services;

use App\Models\Room;

class CalendarService
{
    public function getRoomsWithReservations(int $propertyId, string $start, string $end)
    {
        return Room::active()
            ->forProperty($propertyId)
            ->orderBy('name')
            ->with(['reservations' => function ($q) use ($start, $end) {
                $q->where('start_date', '<', $end)
                  ->where('end_date', '>', $start);
            }])
            ->get();
    }
}
