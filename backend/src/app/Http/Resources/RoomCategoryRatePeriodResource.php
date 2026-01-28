<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RoomCategoryRatePeriodResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'room_category_id' => $this->room_category_id,
            'start_date' => optional($this->start_date)->toDateString(),
            'end_date' => optional($this->end_date)->toDateString(),
            'base_one_adult' => $this->base_one_adult,
            'base_two_adults' => $this->base_two_adults,
            'additional_adult' => $this->additional_adult,
            'child_price' => $this->child_price,
            'description' => $this->description,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
