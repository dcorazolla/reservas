<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CalendarService;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function __construct(
        private CalendarService $service
    ) {}

    public function index(Request $request)
    {
        $data = $request->validate([
            'start' => 'required|date',
            'end'   => 'required|date|after_or_equal:start',
        ]);

        return response()->json(
            $this->service->getCalendar(
                $data['start'],
                $data['end']
            )
        );
    }
}
