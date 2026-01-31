<?php

namespace App\Http\Controllers\Api;

use App\Models\Reservation;
use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\ReservationResource;
use App\Services\CreateReservationService;
use App\Services\ReservationPriceCalculator;
use App\Services\ReservationService;
use Illuminate\Http\Request;

class ReservationController extends BaseApiController
{
    public function store(Request $request, CreateReservationService $service)
    {
        $data = $request->validate([
            'room_id'        => 'required|exists:rooms,id',
            'guest_name'     => 'required|string|max:255',
            'email'          => 'nullable|email',
            'phone'          => 'nullable|string',
            'adults_count'   => 'required|integer|min:1',
            'children_count' => 'required|integer|min:0',
            'infants_count'  => 'nullable|integer|min:0',
            'start_date'     => 'required|date',
            'end_date'       => 'required|date|after:start_date',
            'notes'          => 'nullable|string',
        ]);

        $reservation = $service->create($data);

        return $this->created(new ReservationResource($reservation));
    }

    public function update(
        Request $request,
        Reservation $reservation,
        ReservationPriceCalculator $calculator,
        ReservationService $service
    ) {
        $data = $request->validate([
            'guest_name'     => 'sometimes|required|string|max:255',
            'email'          => 'sometimes|nullable|email',
            'phone'          => 'sometimes|nullable|string',
            'people_count'   => 'sometimes|integer|min:1',
            'adults_count'   => 'sometimes|integer|min:1',
            'children_count' => 'sometimes|integer|min:0',
            'infants_count'  => 'sometimes|integer|min:0',
            'start_date'     => 'sometimes|date',
            'end_date'       => 'sometimes|date|after:start_date',
            'status'         => 'sometimes|string',
            'notes'          => 'sometimes|nullable|string',
        ]);

        $room = $reservation->room;

        $start = $data['start_date'] ?? optional($reservation->start_date)->toDateString();
        $end   = $data['end_date'] ?? optional($reservation->end_date)->toDateString();

        // Derive counts
        $adults   = $data['adults_count'] ?? null;
        $children = $data['children_count'] ?? null;
        $infants  = $data['infants_count'] ?? $reservation->infants_count ?? 0;

        if ($adults === null && array_key_exists('people_count', $data)) {
            $adults = (int) $data['people_count'];
            $children = $children ?? 0;
        }

        $adults   = $adults   ?? $reservation->adults_count ?? 1;
        $children = $children ?? $reservation->children_count ?? 0;

        // Recalculate total using the backend engine
        $calc = $calculator->calculateDetailed($room, $start, $end, (int)$adults, (int)$children, (int)$infants);

        $update = [
            'guest_name'     => $data['guest_name']     ?? $reservation->guest_name,
            'email'          => array_key_exists('email', $data) ? $data['email'] : $reservation->email,
            'phone'          => array_key_exists('phone', $data) ? $data['phone'] : $reservation->phone,
            'start_date'     => $start,
            'end_date'       => $end,
            'status'         => $data['status']         ?? $reservation->status,
            'notes'          => array_key_exists('notes', $data) ? $data['notes'] : $reservation->notes,
            'adults_count'   => (int) $adults,
            'children_count' => (int) $children,
            'infants_count'  => (int) $infants,
            'total_value'    => $calc['total'],
        ];

        $updated = $service->update($reservation, $update);

        return $this->ok(new ReservationResource($updated));
    }

    public function show(Reservation $reservation)
    {
        return $this->ok(new ReservationResource($reservation));
    }
}
