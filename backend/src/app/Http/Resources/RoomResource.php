<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RoomResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number ?? null,
            'name' => $this->name,
            'capacity' => $this->capacity,
            'reservations' => ReservationResource::collection($this->whenLoaded('reservations')),
        ];
    }
}
