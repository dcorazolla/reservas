<?php
namespace App\Http\Controllers\Api;

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
                $data['people_count']
            )
        );
    }
}
