<?php
namespace App\Http\Controllers\Api;

use App\Models\Room;
use App\Services\ReservationPriceCalculator;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ReservationPriceController extends Controller
{
    public function calculate(Request $request, ReservationPriceCalculator $calculator)
    {
        $data = $request->validate([
            'room_id'      => 'required|exists:rooms,id',
            'start_date'   => 'required|date',
            'end_date'     => 'required|date',
            'people_count' => 'required|integer|min:1',
        ]);

        return response()->json(
            $calculator->calculate(
                $data['room_id'],
                $data['start_date'],
                $data['end_date'],
                (int) $data['people_count']
            )
        );
    }

    public function calculateDetailed(Request $request, ReservationPriceCalculator $calculator)
    {
        $data = $request->validate([
            'room_id'        => 'required|exists:rooms,id',
            'start_date'     => 'required|date',
            'end_date'       => 'required|date',
            'adults_count'   => 'required|integer|min:1',
            'children_count' => 'required|integer|min:0',
            'infants_count'  => 'nullable|integer|min:0',
        ]);

        $room = Room::findOrFail($data['room_id']);
        return response()->json(
            $calculator->calculateDetailed(
                $room,
                $data['start_date'],
                $data['end_date'],
                (int) $data['adults_count'],
                (int) $data['children_count'],
                (int) ($data['infants_count'] ?? 0)
            )
        );
    }
}
