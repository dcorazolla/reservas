<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RoomCategoryRateResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'room_category_id' => $this->room_category_id,
            'base_one_adult' => $this->base_one_adult,
            'base_two_adults' => $this->base_two_adults,
            'additional_adult' => $this->additional_adult,
            'child_price' => $this->child_price,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
