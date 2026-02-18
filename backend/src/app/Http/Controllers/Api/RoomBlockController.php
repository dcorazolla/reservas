<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\RoomBlock;
use Carbon\Carbon;
use Illuminate\Http\Request;

class RoomBlockController extends BaseApiController
{
    public function index(Request $request)
    {
        $propertyId = $this->getPropertyId($request);

        $query = RoomBlock::where('property_id', $propertyId);

        // Optional filters
        if ($request->query('room_id')) {
            $query->where('room_id', $request->query('room_id'));
        }

        if ($request->query('type')) {
            $type = $request->query('type');
            if (in_array($type, ['maintenance', 'cleaning', 'private', 'custom'])) {
                $query->where('type', $type);
            }
        }

        if ($request->query('recurrence')) {
            $recurrence = $request->query('recurrence');
            if (in_array($recurrence, ['none', 'daily', 'weekly', 'monthly'])) {
                $query->where('recurrence', $recurrence);
            }
        }

        // Date range filter (returns blocks overlapping the range)
        if ($request->query('from') && $request->query('to')) {
            $from = $request->query('from');
            $to = $request->query('to');
            $query->where('start_date', '<', $to)->where('end_date', '>', $from);
        }

        // Pagination
        $perPage = $request->query('per_page', 15);
        $blocks = $query->paginate($perPage);

        return $this->ok($blocks);
    }

    public function store(Request $request)
    {
        $propertyId = $this->getPropertyId($request);
        
        $this->authorize('create', RoomBlock::class);
        $data = $request->validate([
            'room_id' => 'required|uuid|exists:rooms,id',
            'start_date' => 'required|date_format:Y-m-d',
            'end_date' => 'required|date_format:Y-m-d',
            'type' => 'required|in:maintenance,cleaning,private,custom',
            'reason' => 'sometimes|nullable|string|max:255',
            'recurrence' => 'sometimes|in:none,daily,weekly,monthly|default:none',
        ]);

        // Validate start_date < end_date
        $start = Carbon::createFromFormat('Y-m-d', $data['start_date']);
        $end = Carbon::createFromFormat('Y-m-d', $data['end_date']);
        if ($end->lte($start)) {
            return $this->validationError(['end_date' => ['The end_date must be after start_date.']]);
        }

        // Verify room belongs to property
        $room = \App\Models\Room::where('id', $data['room_id'])
            ->where('property_id', $propertyId)
            ->firstOrFail();

        $data['property_id'] = $propertyId;
        $data['created_by'] = $request->user()?->id ?? null;
        $data['recurrence'] = $data['recurrence'] ?? 'none';

        $block = RoomBlock::create($data);

        return $this->created($block);
    }

    public function update(Request $request, RoomBlock $roomBlock)
    {
        $propertyId = $this->getPropertyId($request);

        // Verify block belongs to property
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

        if (isset($data['start_date'], $data['end_date'])) {
            $start = Carbon::createFromFormat('Y-m-d', $data['start_date']);
            $end = Carbon::createFromFormat('Y-m-d', $data['end_date']);
            if ($end->lte($start)) {
                return $this->validationError(['end_date' => ['The end_date must be after start_date.']]);
            }
        }

        $roomBlock->fill($data);
        $roomBlock->save();

        return $this->ok($roomBlock);
    }

    public function destroy(Request $request, RoomBlock $roomBlock)
    {
        $propertyId = $this->getPropertyId($request);
        
        // Verify block belongs to property
        if ($roomBlock->property_id !== $propertyId) {
            return $this->forbidden('Block does not belong to this property.');
        }

        $this->authorize('delete', $roomBlock);
        $roomBlock->delete();

        return $this->noContent();
    }

    /**
     * Expand recurring blocks for a given date range.
     * Returns all blocked dates (including expanded recurring blocks).
     * 
     * GET /api/room-blocks/expand?room_id=uuid&from=2026-02-01&to=2026-02-28
     * Response: { blocked_dates: ['2026-02-01', '2026-02-02', ...] }
     */
    public function expand(Request $request)
    {
        $propertyId = $this->getPropertyId($request);

        $request->validate([
            'room_id' => 'required|uuid|exists:rooms,id',
            'from' => 'required|date_format:Y-m-d',
            'to' => 'required|date_format:Y-m-d',
        ]);

        $roomId = $request->query('room_id');
        $from = Carbon::createFromFormat('Y-m-d', $request->query('from'));
        $to = Carbon::createFromFormat('Y-m-d', $request->query('to'));

        // Verify room belongs to property
        $room = \App\Models\Room::where('id', $roomId)
            ->where('property_id', $propertyId)
            ->firstOrFail();

        $blockedDates = [];
        $blocks = RoomBlock::where('room_id', $roomId)
            ->where('property_id', $propertyId)
            ->where('start_date', '<', $to->toDateString())
            ->where('end_date', '>', $from->toDateString())
            ->get();

        foreach ($blocks as $block) {
            $blockStart = $block->start_date;
            $blockEnd = $block->end_date;

            if ($block->recurrence === 'none') {
                // Non-recurring: add all dates in range
                $current = max($blockStart, $from);
                while ($current->lte(min($blockEnd, $to))) {
                    $blockedDates[] = $current->toDateString();
                    $current->addDay();
                }
            } else {
                // Recurring: expand based on recurrence rule
                $current = max($blockStart, $from);
                while ($current->lte(min($blockEnd, $to))) {
                    if ($this->matchesRecurrence($current, $blockStart, $block->recurrence)) {
                        $blockedDates[] = $current->toDateString();
                    }
                    $current->addDay();
                }
            }
        }

        // Remove duplicates and sort
        $blockedDates = array_unique($blockedDates);
        sort($blockedDates);

        return $this->ok(['blocked_dates' => $blockedDates]);
    }

    /**
     * Check if a given date matches the recurrence pattern.
     */
    private function matchesRecurrence(Carbon $date, Carbon $baseDate, string $recurrence): bool
    {
        $dayDiff = $date->diffInDays($baseDate);

        return match ($recurrence) {
            'daily' => true,
            'weekly' => $dayDiff % 7 === 0,
            'monthly' => $date->day === $baseDate->day,
            default => false,
        };
    }
}
