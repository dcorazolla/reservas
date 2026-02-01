<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\RoomRatePeriod;

class UpdateRoomRatePeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var RoomRatePeriod|null $period */
        $period = $this->route('period');
        $capacity = $period?->room?->capacity ?? 1;

        return [
            'people_count'  => 'required|integer|min:1|max:' . $capacity,
            'start_date'    => 'required|date',
            'end_date'      => 'required|date|after:start_date',
            'price_per_day' => 'required|numeric|min:0',
            'description'   => 'nullable|string',
        ];
    }
}
