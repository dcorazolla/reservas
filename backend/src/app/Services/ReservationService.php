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
            'partner_id'     => $data['partner_id'] ?? null,
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
        // Use the room being set in the update payload if present, otherwise
        // fall back to the reservation's existing room. Also ensure start/end
        // are provided (caller should supply them) and normalize values.
        $roomId = $data['room_id'] ?? $reservation->room_id;
        $start = $data['start_date'] ?? $reservation->start_date->toDateString();
        $end = $data['end_date'] ?? $reservation->end_date->toDateString();

        $this->assertNoDateConflict(
            $roomId,
            $start,
            $end,
            $reservation->id
        );

        $reservation->update($data);

        return $reservation;
    }

    public function delete(Reservation $reservation): bool
    {
        return $reservation->delete();
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
