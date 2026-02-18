<?php

namespace App\Services;

use App\Models\RoomBlock;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RoomBlockService
{
    /**
     * List room blocks for a property with filters.
     * 
     * @param string $propertyId
     * @param Request $request
     * @return \Illuminate\Pagination\Paginator
     */
    public function list(string $propertyId, Request $request)
    {
        $query = RoomBlock::query()
            ->whereHas('room', function ($q) use ($propertyId) {
                $q->where('property_id', $propertyId);
            })
            ->orderBy('start_date', 'asc');

        // Filter by room_id
        if ($request->query('room_id')) {
            $query->where('room_id', $request->query('room_id'));
        }

        // Filter by type
        if ($request->query('type')) {
            $type = $request->query('type');
            if (in_array($type, ['maintenance', 'cleaning', 'private', 'custom'])) {
                $query->where('type', $type);
            }
        }

        // Filter by recurrence
        if ($request->query('recurrence')) {
            $recurrence = $request->query('recurrence');
            if (in_array($recurrence, ['none', 'daily', 'weekly', 'monthly'])) {
                $query->where('recurrence', $recurrence);
            }
        }

        // Filter by date range (overlapping blocks)
        if ($request->query('from') && $request->query('to')) {
            $from = $request->query('from');
            $to = $request->query('to');
            $query->where('start_date', '<=', $to)->where('end_date', '>=', $from);
        }

        return $query->get();
    }

    /**
     * Create a new room block.
     * 
     * @param array $data
     * @param string $propertyId
     * @param string|null $createdBy
     * @return RoomBlock
     */
    public function create(array $data, string $propertyId, ?string $createdBy = null): RoomBlock
    {
        $this->validateDateRange($data['start_date'], $data['end_date']);
        $this->verifyRoomBelongsToProperty($data['room_id'], $propertyId);

        return RoomBlock::create([
            ...$data,
            'created_by' => $createdBy,
            'recurrence' => $data['recurrence'] ?? 'none',
        ]);
    }

    /**
     * Update an existing room block.
     * 
     * @param RoomBlock $block
     * @param array $data
     * @return RoomBlock
     */
    public function update(RoomBlock $block, array $data): RoomBlock
    {
        // Validate date range if either start_date or end_date is being updated
        if (isset($data['start_date']) || isset($data['end_date'])) {
            $start = $data['start_date'] ?? $block->start_date->toDateString();
            $end = $data['end_date'] ?? $block->end_date->toDateString();
            $this->validateDateRange($start, $end);
        }

        $block->update($data);

        return $block->refresh();
    }

    /**
     * Delete a room block.
     * 
     * @param RoomBlock $block
     * @return void
     */
    public function delete(RoomBlock $block): void
    {
        $block->delete();
    }

    /**
     * Expand recurring blocks for a given date range.
     * Returns all blocked dates (including expanded recurring blocks).
     * 
     * @param string $roomId
     * @param string $propertyId
     * @param string $from (YYYY-MM-DD)
     * @param string $to (YYYY-MM-DD)
     * @return array
     */
    public function expandBlocks(string $roomId, string $propertyId, string $from, string $to): array
    {
        $this->verifyRoomBelongsToProperty($roomId, $propertyId);

        $fromDate = Carbon::createFromFormat('Y-m-d', $from);
        $toDate = Carbon::createFromFormat('Y-m-d', $to);

        $blockedDates = [];
        $blocks = RoomBlock::where('room_id', $roomId)
            ->whereHas('room', function ($q) use ($propertyId) {
                $q->where('property_id', $propertyId);
            })
            ->where('start_date', '<', $toDate->toDateString())
            ->where('end_date', '>', $fromDate->toDateString())
            ->get();

        foreach ($blocks as $block) {
            $blockStart = $block->start_date;
            $blockEnd = $block->end_date;

            if ($block->recurrence === 'none') {
                // Non-recurring: add all dates in range
                $current = max($blockStart, $fromDate);
                while ($current->lt($toDate) && $current->lt($blockEnd)) {
                    $blockedDates[] = $current->toDateString();
                    $current->addDay();
                }
            } else {
                // Recurring: expand based on recurrence rule
                $current = max($blockStart, $fromDate);
                while ($current->lt($toDate) && $current->lt($blockEnd)) {
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

        return $blockedDates;
    }

    /**
     * Validate that end_date > start_date.
     * 
     * @param string $startDate (YYYY-MM-DD)
     * @param string $endDate (YYYY-MM-DD)
     * @return void
     */
    private function validateDateRange(string $startDate, string $endDate): void
    {
        $start = Carbon::createFromFormat('Y-m-d', $startDate);
        $end = Carbon::createFromFormat('Y-m-d', $endDate);

        if ($end->lte($start)) {
            throw ValidationException::withMessages([
                'end_date' => ['The end_date must be after start_date.'],
            ]);
        }
    }

    /**
     * Verify that a room belongs to a property.
     * 
     * @param string $roomId
     * @param string $propertyId
     * @return void
     */
    private function verifyRoomBelongsToProperty(string $roomId, string $propertyId): void
    {
        $room = \App\Models\Room::where('id', $roomId)
            ->where('property_id', $propertyId)
            ->first();

        if (!$room) {
            throw ValidationException::withMessages([
                'room_id' => ['Room does not exist or does not belong to this property.'],
            ]);
        }
    }

    /**
     * Check if a given date matches the recurrence pattern.
     * 
     * @param Carbon $date
     * @param Carbon $baseDate
     * @param string $recurrence
     * @return bool
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
