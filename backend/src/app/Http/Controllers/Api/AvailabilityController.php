<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Reservation;
use App\Services\ReservationPriceCalculator;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AvailabilityController extends Controller
{
    public function search(Request $request, ReservationPriceCalculator $calculator)
    {
        $data = $request->validate([
            'checkin'      => 'required|date',
            'checkout'     => 'required|date|after:checkin',
            'adults'       => 'required|integer|min:1',
            'children'     => 'required|integer|min:0',
            'infants'      => 'nullable|integer|min:0',
            'property_ids' => 'array',
            'property_ids.*' => 'integer',
        ]);

        $adults   = (int) $data['adults'];
        $children = (int) $data['children'];
        $infants  = (int) ($data['infants'] ?? 0);

        $start = Carbon::parse($data['checkin'])->startOfDay();
        $end   = Carbon::parse($data['checkout'])->startOfDay();

        $propertyId = $this->getPropertyId($request);

        $roomsQuery = Room::with(['category', 'property'])
            ->active()
            ->forProperty($propertyId);

        if (!empty($data['property_ids'])) {
            $roomsQuery->whereIn('property_id', $data['property_ids']);
        }

        $rooms = $roomsQuery->get();

        $results = [];

        foreach ($rooms as $room) {
            // Capacity check: infants do not count
            $capacityOk = ($adults + $children) <= $room->capacity;
            if (!$capacityOk) {
                continue;
            }

            // Check conflicts
            $conflict = Reservation::conflicting($room->id, $start->toDateString(), $end->toDateString())->exists();
            if ($conflict) {
                continue;
            }

            $calc = $calculator->calculateDetailed(
                $room,
                $start->toDateString(),
                $end->toDateString(),
                $adults,
                $children,
                $infants
            );

            $results[] = [
                'room_id'        => $room->id,
                'room_name'      => $room->name,
                'room_number'    => $room->number,
                'capacity'       => $room->capacity,
                'property_id'    => $room->property_id,
                'property_name'  => $room->property?->name,
                'category_id'    => $room->room_category_id,
                'category_name'  => $room->category?->name,
                'adults'         => $adults,
                'children'       => $children,
                'infants'        => $infants,
                'pricing_source' => $calc['source'],
                'total'          => $calc['total'],
                'days'           => $calc['days'],
            ];
        }

        return response()->json($results);
    }
}
