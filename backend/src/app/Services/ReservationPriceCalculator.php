<?php

namespace App\Services;

use App\Models\Room;
use App\Models\RoomRate;
use App\Models\RoomRatePeriod;
use App\Models\RoomCategoryRate;
use App\Models\RoomCategoryRatePeriod;
use App\Models\Property;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use RuntimeException;

class ReservationPriceCalculator
{
    public function calculate(
        string|int $roomId,
        string $startDate,
        string $endDate,
        int $peopleCount
    ): array {
        $room = Room::findOrFail($roomId);

        if ($peopleCount > $room->capacity) {
            throw new RuntimeException('Número de pessoas excede a capacidade do quarto.');
        }

        try {
            $start = Carbon::createFromFormat('Y-m-d', $startDate)->startOfDay();
        } catch (\Throwable $e) {
            $start = Carbon::parse($startDate)->startOfDay();
        }

        try {
            $end = Carbon::createFromFormat('Y-m-d', $endDate)->startOfDay();
        } catch (\Throwable $e) {
            $end = Carbon::parse($endDate)->startOfDay();
        }

        if ($end <= $start) {
            throw new RuntimeException('Data de saída deve ser maior que a data de entrada.');
        }

        $days = new Collection();
        $total = 0;

        for ($date = $start->copy(); $date->lt($end); $date->addDay()) {
            $price = $this->priceForDayLegacy(
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

    protected function priceForDayLegacy(
        string|int $roomId,
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

        if ($baseRate) {
            return (float) $baseRate->price_per_day;
        }

        // Legacy fallback
        $room = Room::findOrFail($roomId);
        $property = $room->property;
        if (!$property) {
            throw new RuntimeException('Tarifa base não encontrada.');
        }
        $baseForTwo = (float) ($property->base_two_adults ?? 0);
        $additional = (float) ($property->additional_adult ?? 0);
        $extraPeople = max(0, $peopleCount - 2);
        $computed = $baseForTwo + ($additional * $extraPeople);
        if ($computed <= 0) {
            throw new RuntimeException('Tarifa base não encontrada.');
        }
        return $computed;
    }

    public function calculateDetailed(
        Room $room,
        string $startDate,
        string $endDate,
        int $adults,
        int $children,
        int $infants = 0
    ): array {
        try {
            $start = Carbon::createFromFormat('Y-m-d', $startDate)->startOfDay();
        } catch (\Throwable $e) {
            $start = Carbon::parse($startDate)->startOfDay();
        }

        try {
            $end = Carbon::createFromFormat('Y-m-d', $endDate)->startOfDay();
        } catch (\Throwable $e) {
            $end = Carbon::parse($endDate)->startOfDay();
        }

        $days = [];
        $total = 0.0;
        $source = '';
        $peopleCount = max(1, $adults + $children); // infants are free and don't count toward capacity pricing

        for ($date = $start->copy(); $date->lt($end); $date->addDay()) {
            $pricing = $this->resolvePricingForDate($room, $date, $peopleCount);
            $source = $pricing['source'];
            $dayPrice = $this->computeDayPrice($pricing['rate'], $room->property, $adults, $children);
            $days[] = [
                'date' => $date->toDateString(),
                'price' => $dayPrice,
            ];
            $total += $dayPrice;
        }

        return [
            'source' => $source,
            'total'  => $total,
            'days'   => $days,
        ];
    }

    protected function resolvePricingForDate(Room $room, Carbon $date, int $peopleCount): array
    {
        // 1) room period (by people count)
        $rp = RoomRatePeriod::where('room_id', $room->id)
            ->where('people_count', $peopleCount)
            ->whereDate('start_date', '<=', $date)
            ->whereDate('end_date', '>=', $date)
            ->orderByDesc('start_date')
            ->first();
        if ($rp) return ['source' => 'room_period', 'rate' => $rp];

        // 2) category period
        if ($room->room_category_id) {
            $cp = RoomCategoryRatePeriod::where('room_category_id', $room->room_category_id)
                ->whereDate('start_date', '<=', $date)
                ->whereDate('end_date', '>=', $date)
                ->orderByDesc('start_date')
                ->first();
            if ($cp) return ['source' => 'category_period', 'rate' => $cp];
        }

        // 3) room base (by people count)
        $rb = RoomRate::where('room_id', $room->id)
            ->where('people_count', $peopleCount)
            ->first();
        if ($rb) return ['source' => 'room_base', 'rate' => $rb];

        // 4) category base
        if ($room->room_category_id) {
            $cb = RoomCategoryRate::where('room_category_id', $room->room_category_id)->first();
            if ($cb) return ['source' => 'category_base', 'rate' => $cb];
        }

        // 5) property base
        $property = $room->property;
        return ['source' => 'property_base', 'rate' => $property];
    }

    protected function computeDayPrice($rate, Property $property, int $adults, int $children): float
    {
        // If using room-specific rate(s), use explicit price_per_day which already accounts for total people.
        if (isset($rate->price_per_day)) {
            return (float) $rate->price_per_day;
        }

        // Adults
        $baseOne = (float) ($rate->base_one_adult ?? 0);
        $baseTwo = (float) ($rate->base_two_adults ?? 0);
        $addAdult = (float) ($rate->additional_adult ?? 0);

        $adultCost = 0.0;
        if ($adults <= 1 && $baseOne > 0) {
            $adultCost = $baseOne;
        } else {
            $adultCost = $baseTwo + max(0, $adults - 2) * $addAdult;
        }

        // Children
        $childPrice = $rate->child_price;
        if ($childPrice === null) {
            // Fallback: child_factor * adult per-person rate
            $adultPerPerson = $baseOne > 0 ? $baseOne : ($baseTwo > 0 ? ($baseTwo / 2) : 0);
            $childPrice = $adultPerPerson * (float) ($property->child_factor ?? 0.5);
        }

        $childrenCost = (float) $childPrice * $children;

        return $adultCost + $childrenCost;
    }
}
