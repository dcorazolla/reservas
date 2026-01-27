<?php

namespace App\Services;

use App\Models\Reservation;
use App\Services\ReservationPriceCalculator;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CreateReservationService
{
    public function __construct(
        protected ReservationPriceCalculator $calculator
    ) {}

    public function create(array $data): Reservation
    {
        return DB::transaction(function () use ($data) {

            $calculation = $this->calculator->calculate(
                $data['room_id'],
                $data['start_date'],
                $data['end_date'],
                $data['people_count']
            );

            if ($calculation['total'] <= 0) {
                throw new RuntimeException('Valor da reserva inválido.');
            }

            return Reservation::create([
                'room_id'      => $data['room_id'],
                'guest_name'   => $data['guest_name'],
                'people_count' => $data['people_count'],
                'start_date'   => $data['start_date'],
                'end_date'     => $data['end_date'],
                'status'       => 'pending',
                'total_value'  => $calculation['total'],
                'notes'        => $data['notes'] ?? null,
            ]);
        });
    }
}
