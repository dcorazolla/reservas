<?php

namespace App\Services;

use App\Models\MinibarConsumption;
use Illuminate\Support\Str;

class MinibarService
{
    /**
     * Create a minibar consumption record
     *
     * @param array $data
     * @return MinibarConsumption
     */
    public function createConsumption(array $data): MinibarConsumption
    {
        $total = ((float)($data['unit_price'] ?? 0)) * ((int)($data['quantity'] ?? 1));

        return MinibarConsumption::create([
            'id' => (string) Str::uuid(),
            'reservation_id' => $data['reservation_id'] ?? null,
            'room_id' => $data['room_id'] ?? null,
            'product_id' => $data['product_id'] ?? null,
            'description' => $data['description'] ?? null,
            'quantity' => (int)($data['quantity'] ?? 1),
            'unit_price' => (float)($data['unit_price'] ?? 0),
            'total' => $total,
            'created_by' => $data['created_by'] ?? null,
        ]);
    }

    public function sumForReservation(string $reservationId): float
    {
        return (float) MinibarConsumption::where('reservation_id', $reservationId)->sum('total');
    }
}
