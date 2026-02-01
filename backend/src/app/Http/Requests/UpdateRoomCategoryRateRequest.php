<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoomCategoryRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'base_one_adult'   => 'nullable|numeric|min:0',
            'base_two_adults'  => 'nullable|numeric|min:0',
            'additional_adult' => 'nullable|numeric|min:0',
            'child_price'      => 'nullable|numeric|min:0',
        ];
    }
}
