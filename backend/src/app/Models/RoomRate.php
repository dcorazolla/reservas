<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RoomRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'people_count',
        'price_per_day',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
