<?php

namespace App\Services;

use App\Models\Room;
use App\Models\RoomRate;
use App\Models\RoomRatePeriod;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use RuntimeException;

class ReservationPriceCalculator
{
    public function calculate(
        int $roomId,
        string $startDate,
        string $endDate,
        int $peopleCount
    ): array {
        $room = Room::findOrFail($roomId);

        if ($peopleCount > $room->capacity) {
            throw new RuntimeException('Número de pessoas excede a capacidade do quarto.');
        }

        $start = Carbon::parse($startDate)->startOfDay();
        $end   = Carbon::parse($endDate)->startOfDay();

        if ($end <= $start) {
            throw new RuntimeException('Data de saída deve ser maior que a data de entrada.');
        }

        $days = new Collection();
        $total = 0;

        for ($date = $start->copy(); $date->lt($end); $date->addDay()) {
            $price = $this->priceForDay(
                $room->id,
                $peopleCount,
                $date
            );

            $days->push([
                'date' => $date->toDateString(),
                'price' => $price,
            ]);

            $total += $price;
        }

        return [
            'total' => $total,
            'days'  => $days,
        ];
    }

    protected function priceForDay(
        int $roomId,
        int $peopleCount,
        Carbon $date
    ): float {
        $periodRate = RoomRatePeriod::where('room_id', $roomId)
            ->where('people_count', $peopleCount)
            ->whereDate('start_date', '<=', $date)
            ->whereDate('end_date', '>=', $date)
            ->orderByDesc('start_date')
            ->first();

        if ($periodRate) {
            return (float) $periodRate->price_per_day;
        }

        $baseRate = RoomRate::where('room_id', $roomId)
            ->where('people_count', $peopleCount)
            ->first();

        if (!$baseRate) {
            throw new RuntimeException('Tarifa base não encontrada.');
        }

        return (float) $baseRate->price_per_day;
    }
}
