<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\MinibarConsumption;
use App\Services\MinibarService;
use Illuminate\Http\Request;

class MinibarConsumptionController extends BaseApiController
{
    public function index(Request $request, MinibarService $service)
    {
        $query = MinibarConsumption::query();

        if ($request->query('reservation_id')) {
            $query->where('reservation_id', $request->query('reservation_id'));
        }

        $items = $query->orderBy('created_at', 'desc')->get();

        return $this->ok($items);
    }

    public function store(Request $request, MinibarService $service)
    {
        $data = $request->validate([
            'reservation_id' => 'sometimes|nullable|uuid|exists:reservations,id',
            'room_id' => 'sometimes|nullable|uuid|exists:rooms,id',
            'product_id' => 'sometimes|nullable|uuid',
            'description' => 'sometimes|nullable|string',
            'quantity' => 'sometimes|integer|min:1',
            'unit_price' => 'sometimes|numeric|min:0',
        ]);

        $data['created_by'] = $request->user()?->id ?? null;

        $item = $service->createConsumption($data);

        return $this->created($item);
    }

    public function destroy(Request $request, MinibarConsumption $minibarConsumption)
    {
        $minibarConsumption->delete();

        return $this->noContent();
    }
}
