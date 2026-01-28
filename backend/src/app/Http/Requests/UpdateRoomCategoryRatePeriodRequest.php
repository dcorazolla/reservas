<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoomCategoryRatePeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date'       => 'required|date',
            'end_date'         => 'required|date|after:start_date',
            'base_one_adult'   => 'nullable|numeric|min:0',
            'base_two_adults'  => 'nullable|numeric|min:0',
            'additional_adult' => 'nullable|numeric|min:0',
            'child_price'      => 'nullable|numeric|min:0',
            'description'      => 'nullable|string',
        ];
    }
}
