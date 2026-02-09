<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\RoomBlock;
use Illuminate\Http\Request;

class RoomBlockController extends BaseApiController
{
    public function index(Request $request)
    {
        $propertyId = $this->getPropertyId($request);

        $query = RoomBlock::whereHas('room', function ($q) use ($propertyId) {
            $q->where('property_id', $propertyId);
        });

        // Optional filters
        if ($request->query('room_id')) {
            $query->where('room_id', $request->query('room_id'));
        }

        if ($request->query('from') && $request->query('to')) {
            $from = $request->query('from');
            $to = $request->query('to');
            $query->where('start_date', '<', $to)->where('end_date', '>', $from);
        }

        $blocks = $query->get();

        return $this->ok($blocks);
    }

    public function store(Request $request)
    {
        $this->authorize('create', RoomBlock::class);
        $data = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'reason' => 'sometimes|nullable|string',
            'partner_id' => 'sometimes|nullable|uuid|exists:partners,id',
        ]);

        $data['created_by'] = $request->user()?->id ?? null;

        $block = RoomBlock::create($data);

        return $this->created($block);
    }

    public function update(Request $request, RoomBlock $roomBlock)
    {
        $this->authorize('update', $roomBlock);

        $data = $request->validate([
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'reason' => 'sometimes|nullable|string',
            'partner_id' => 'sometimes|nullable|uuid|exists:partners,id',
        ]);

        $roomBlock->fill($data);
        $roomBlock->save();

        return $this->ok($roomBlock);
    }

    public function destroy(RoomBlock $roomBlock)
    {
        $this->authorize('delete', $roomBlock);
        $roomBlock->delete();

        return $this->noContent();
    }
}
