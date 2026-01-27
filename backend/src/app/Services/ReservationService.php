<?php

namespace App\Services;

use App\Models\Reservation;
use Illuminate\Validation\ValidationException;

class ReservationService
{
    public function create(array $data): Reservation
    {
        $this->assertNoDateConflict(
            $data['room_id'],
            $data['start_date'],
            $data['end_date']
        );

        return Reservation::create($data);
    }

    public function update(Reservation $reservation, array $data): Reservation
    {
        $this->assertNoDateConflict(
            $reservation->room_id,
            $data['start_date'],
            $data['end_date'],
            $reservation->id
        );

        $reservation->update($data);

        return $reservation;
    }

    protected function assertNoDateConflict(
        int $roomId,
        string $start,
        string $end,
        ?int $ignoreReservationId = null
    ): void {
        $query = Reservation::conflicting($roomId, $start, $end);

        if ($ignoreReservationId) {
            $query->where('id', '!=', $ignoreReservationId);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'date' => 'Conflito de datas para este quarto',
            ]);
        }
    }
}
