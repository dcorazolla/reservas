<?php

namespace App\Http\Controllers;

use App\Services\CreateReservationService;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function store(Request $request, CreateReservationService $service)
    {
        $data = $request->validate([
            'room_id'      => 'required|exists:rooms,id',
            'guest_name'   => 'required|string|max:255',
            'people_count' => 'required|integer|min:1',
            'start_date'   => 'required|date',
            'end_date'     => 'required|date',
            'notes'        => 'nullable|string',
        ]);

        $reservation = $service->create($data);

        return response()->json($reservation, 201);
    }
}
