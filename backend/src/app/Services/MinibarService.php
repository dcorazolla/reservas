<?php

namespace App\Services;

use App\Models\MinibarConsumption;
use App\Models\Product;
use App\Models\FinancialAuditLog;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
        $quantity = (int)($data['quantity'] ?? 1);
        $unitPrice = (float)($data['unit_price'] ?? 0);
        $total = $unitPrice * $quantity;

        // If a product_id was provided, try to decrement stock safely inside a transaction.
        if (!empty($data['product_id'])) {
            return DB::transaction(function () use ($data, $quantity, $unitPrice, $total) {
                $product = Product::where('id', $data['product_id'])->lockForUpdate()->first();

                if (!$product) {
                    throw ValidationException::withMessages(['product_id' => ['Produto informado não encontrado.']]);
                }

                if (!$product->active) {
                    throw ValidationException::withMessages(['product_id' => ['Produto está desativado.']]);
                }

                if ($product->stock < $quantity) {
                    FinancialAuditLog::create([
                        'event_type' => 'minibar.consumption_failed_insufficient_stock',
                        'payload' => ['product_id' => $product->id, 'requested' => $quantity, 'available' => $product->stock],
                        'resource_type' => 'product',
                        'resource_id' => $product->id,
                    ]);
                    throw ValidationException::withMessages(['quantity' => ['Quantidade solicitada maior que o stock disponível.']]);
                }

                // Decrement stock and save
                $product->stock = max(0, $product->stock - $quantity);
                $product->save();

                FinancialAuditLog::create([
                    'event_type' => 'minibar.stock_decremented',
                    'payload' => ['product_id' => $product->id, 'decrement' => $quantity, 'remaining' => $product->stock],
                    'resource_type' => 'product',
                    'resource_id' => $product->id,
                ]);

                $cons = MinibarConsumption::create([
                    'id' => (string) Str::uuid(),
                    'reservation_id' => $data['reservation_id'] ?? null,
                    'room_id' => $data['room_id'] ?? null,
                    'product_id' => $product->id,
                    'description' => $data['description'] ?? $product->name ?? null,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total' => $total,
                    'created_by' => $data['created_by'] ?? null,
                ]);

                return $cons;
            });
        }

        // No product linked: create consumption without stock checks
        return MinibarConsumption::create([
            'id' => (string) Str::uuid(),
            'reservation_id' => $data['reservation_id'] ?? null,
            'room_id' => $data['room_id'] ?? null,
            'product_id' => $data['product_id'] ?? null,
            'description' => $data['description'] ?? null,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total' => $total,
            'created_by' => $data['created_by'] ?? null,
        ]);
    }

    public function sumForReservation(string $reservationId): float
    {
        return (float) MinibarConsumption::where('reservation_id', $reservationId)->sum('total');
    }
}
