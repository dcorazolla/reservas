<?php
namespace App\Services;

use App\Models\Room;
use App\Models\Reservation;

class CalendarService
{
    public function getCalendar(string $start, string $end): array
    {
        $rooms = Room::active()
            ->orderBy('name')
            ->get();

        $reservations = Reservation::where(function ($q) use ($start, $end) {
                $q->where('start_date', '<', $end)
                  ->where('end_date', '>', $start);
            })
            ->get()
            ->groupBy('room_id');

        return [
            'start' => $start,
            'end'   => $end,
            'rooms' => $rooms->map(function ($room) use ($reservations) {
                return [
                    'id' => $room->id,
                    'number' => $room->number ?? null,
                    'name' => $room->name,
                    'capacity' => $room->capacity,
                    'reservations' => $reservations[$room->id] ?? [],
                ];
            }),
        ];
    }
}
