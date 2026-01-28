<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Room;

class StoreRoomRateRequest extends FormRequest
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

        return [
            'people_count'  => 'required|integer|min:1|max:' . $capacity,
            'price_per_day' => 'required|numeric|min:0',
        ];
    }
}
