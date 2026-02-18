<?php

namespace App\Http\Controllers\Api;

use App\Models\RoomBlock;
use App\Services\RoomBlockService;
use Illuminate\Http\Request;

class RoomBlockController extends BaseApiController
{
    public function __construct(
        private RoomBlockService $service
    ) {}

    public function index(Request $request)
    {
        $propertyId = $this->getPropertyId($request);

        $blocks = $this->service->list($propertyId, $request);

        return $this->ok($blocks);
    }

    public function store(Request $request)
    {
        $this->authorize('create', RoomBlock::class);

        $propertyId = $this->getPropertyId($request);

        $data = $request->validate([
            'room_id' => 'required|uuid|exists:rooms,id',
            'start_date' => 'required|date_format:Y-m-d',
            'end_date' => 'required|date_format:Y-m-d',
            'type' => 'required|in:maintenance,cleaning,private,custom',
            'reason' => 'sometimes|nullable|string|max:255',
            'recurrence' => 'sometimes|in:none,daily,weekly,monthly|default:none',
        ]);

        $block = $this->service->create(
            $data,
            $propertyId,
            $request->user()?->id
        );

        return $this->created($block);
    }

    public function update(Request $request, RoomBlock $roomBlock)
    {
        $propertyId = $this->getPropertyId($request);

        if ($roomBlock->property_id !== $propertyId) {
            return $this->forbidden('Block does not belong to this property.');
        }

        $this->authorize('update', $roomBlock);

        $data = $request->validate([
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
            'type' => 'sometimes|in:maintenance,cleaning,private,custom',
            'reason' => 'sometimes|nullable|string|max:255',
            'recurrence' => 'sometimes|in:none,daily,weekly,monthly',
        ]);

        $block = $this->service->update($roomBlock, $data);

        return $this->ok($block);
    }

    public function destroy(Request $request, RoomBlock $roomBlock)
    {
        $propertyId = $this->getPropertyId($request);

        if ($roomBlock->property_id !== $propertyId) {
            return $this->forbidden('Block does not belong to this property.');
        }

        $this->authorize('delete', $roomBlock);

        $this->service->delete($roomBlock);

        return $this->noContent();
    }

    /**
     * Expand recurring blocks for a given date range.
     * GET /room-blocks/expand?room_id=uuid&from=2026-02-01&to=2026-02-28
     */
    public function expand(Request $request)
    {
        $propertyId = $this->getPropertyId($request);

        $validated = $request->validate([
            'room_id' => 'required|uuid|exists:rooms,id',
            'from' => 'required|date_format:Y-m-d',
            'to' => 'required|date_format:Y-m-d',
        ]);

        $blockedDates = $this->service->expandBlocks(
            $validated['room_id'],
            $propertyId,
            $validated['from'],
            $validated['to']
        );

        return $this->ok(['blocked_dates' => $blockedDates]);
    }
}
