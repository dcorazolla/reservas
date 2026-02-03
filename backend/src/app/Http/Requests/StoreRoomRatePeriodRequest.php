<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Room;

class StoreRoomRatePeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var Room|null $room */
        $room = $this->route('room');
        $capacity = $room?->capacity ?? 1;
        // TEMP DEBUG: log incoming request data during tests to diagnose date parsing issues
        if (app()->environment('testing')) {
            try {
                $payload = json_encode($this->all(), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                file_put_contents(storage_path('logs/store_room_rate_period_request.debug.log'), $payload . "\n", FILE_APPEND);
            } catch (\Throwable $e) {
                // ignore logging errors during tests
            }
        }

        $start = $this->input('start_date');
        $afterRule = $start ? 'after:' . $start : 'after:start_date';

        return [
            'people_count'  => 'required|integer|min:1|max:' . $capacity,
            'start_date'    => 'required|date',
            'end_date'      => 'required|date|' . $afterRule,
            'price_per_day' => 'required|numeric|min:0',
            'description'   => 'nullable|string',
        ];
    }
}
