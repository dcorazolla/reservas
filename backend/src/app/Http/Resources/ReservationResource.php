<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReservationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'room_id' => $this->room_id,
            'guest_name' => $this->guest_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'adults_count' => $this->adults_count,
            'children_count' => $this->children_count,
            'infants_count' => $this->infants_count,
            'people_count' => max(1, (int)$this->adults_count + (int)$this->children_count),
            'start_date' => optional($this->start_date)->toDateString(),
            'end_date' => optional($this->end_date)->toDateString(),
            'status' => $this->status,
            'total_value' => $this->total_value,
            'notes' => $this->notes,
            'partner_id' => $this->partner_id,
            'partner' => $this->whenLoaded('partner', function () {
                return [
                    'id' => $this->partner->id,
                    'name' => $this->partner->name,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
