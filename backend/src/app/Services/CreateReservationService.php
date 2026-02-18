<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\RoomBlock;
use App\Services\ReservationPriceCalculator;
use Carbon\Carbon;
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
            $startDate = $data['start_date'];
            $endDate = $data['end_date'];

            // Check for room blocks that overlap the requested dates
            $blockExists = RoomBlock::where('room_id', $data['room_id'])
                ->where('start_date', '<', $endDate)
                ->where('end_date', '>', $startDate)
                ->get();

            if ($blockExists->count() > 0) {
                // Check if any block actually blocks the reservation (considering recurrence)
                if ($this->isBlockedByRecurringRules($blockExists, $startDate, $endDate)) {
                    throw ValidationException::withMessages([
                        'room_id' => ['Room is blocked for the requested dates.']
                    ]);
                }
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
                $startDate,
                $endDate,
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
                'start_date'     => $startDate,
                'end_date'       => $endDate,
                'status'         => 'pre-reserva',
                'total_value'    => $calc['total'],
                'notes'          => $data['notes'] ?? null,
            ]);
        });
    }

    /**
     * Check if a date range is blocked by any of the given room blocks,
     * considering recurring rules.
     */
    private function isBlockedByRecurringRules($blocks, string $startDate, string $endDate): bool
    {
        $start = Carbon::createFromFormat('Y-m-d', $startDate);
        $end = Carbon::createFromFormat('Y-m-d', $endDate);

        foreach ($blocks as $block) {
            $blockStart = $block->start_date;
            $blockEnd = $block->end_date;

            // Check each day of the reservation against the block
            $current = $start->clone();
            while ($current->lt($end)) {
                if ($this->dateIsBlocked($current, $blockStart, $blockEnd, $block->recurrence)) {
                    return true;
                }
                $current->addDay();
            }
        }

        return false;
    }

    /**
     * Check if a specific date is blocked by a room block considering recurrence.
     */
    private function dateIsBlocked(Carbon $date, $blockStart, $blockEnd, string $recurrence): bool
    {
        // Date must be within block range
        if ($date->lt($blockStart) || $date->gte($blockEnd)) {
            return false;
        }

        // Non-recurring blocks: date is in range = blocked
        if ($recurrence === 'none') {
            return true;
        }

        // Recurring blocks: check if date matches recurrence pattern
        $dayDiff = $date->diffInDays($blockStart);

        return match ($recurrence) {
            'daily' => true,
            'weekly' => $dayDiff % 7 === 0,
            'monthly' => $date->day === $blockStart->day,
            default => false,
        };
    }
}
