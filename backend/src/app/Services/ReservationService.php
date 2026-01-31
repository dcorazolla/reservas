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

        // Persist only supported columns to avoid schema mismatches
        return Reservation::create([
            'room_id'        => $data['room_id'],
            'guest_name'     => $data['guest_name'],
            'email'          => $data['email'] ?? null,
            'phone'          => $data['phone'] ?? null,
            'adults_count'   => (int) $data['adults_count'],
            'children_count' => (int) ($data['children_count'] ?? 0),
            'infants_count'  => (int) ($data['infants_count'] ?? 0),
            'start_date'     => $data['start_date'],
            'end_date'       => $data['end_date'],
            'status'         => $data['status'] ?? 'pre-reserva',
            'total_value'    => $data['total_value'] ?? null,
            'notes'          => $data['notes'] ?? null,
        ]);
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
        string $roomId,
        string $start,
        string $end,
        ?string $ignoreReservationId = null
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
