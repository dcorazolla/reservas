<?php

namespace App\Services;

use App\Models\Reservation;
use App\Services\ReservationPriceCalculator;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Illuminate\Validation\ValidationException;

class CreateReservationService
{
    public function __construct(
        protected ReservationPriceCalculator $calculator
    ) {}

    public function create(array $data): Reservation
    {
        return DB::transaction(function () use ($data) {
            // Check for room blocks that overlap the requested dates
            $blockExists = \App\Models\RoomBlock::where('room_id', $data['room_id'])
                ->where('start_date', '<', $data['end_date'])
                ->where('end_date', '>', $data['start_date'])
                ->exists();

            if ($blockExists) {
                throw ValidationException::withMessages(['room_id' => ['Room is blocked for the requested dates.']]);
            }
            $room = \App\Models\Room::findOrFail($data['room_id']);

            // Capacity check (infants do not count)
            $adults = (int) $data['adults_count'];
            $children = (int) $data['children_count'];
            $infants = (int) ($data['infants_count'] ?? 0);
            if (($adults + $children) > $room->capacity) {
                throw new RuntimeException('Número de hóspedes excede a capacidade do quarto.');
            }

            $calc = $this->calculator->calculateDetailed(
                $room,
                $data['start_date'],
                $data['end_date'],
                $adults,
                $children,
                $infants
            );

            if ($calc['total'] <= 0) {
                throw new RuntimeException('Valor da reserva inválido.');
            }

            return Reservation::create([
                'room_id'        => $data['room_id'],
                'partner_id'     => $data['partner_id'] ?? null,
                'guest_name'     => $data['guest_name'],
                'email'          => $data['email'] ?? null,
                'phone'          => $data['phone'] ?? null,
                'adults_count'   => $adults,
                'children_count' => $children,
                'infants_count'  => $infants,
                'start_date'     => $data['start_date'],
                'end_date'       => $data['end_date'],
                'status'         => 'pre-reserva',
                'total_value'    => $calc['total'],
                'notes'          => $data['notes'] ?? null,
            ]);
        });
    }
}
