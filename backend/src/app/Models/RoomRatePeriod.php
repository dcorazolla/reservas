<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RoomRatePeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'people_count',
        'start_date',
        'end_date',
        'price_per_day',
        'description',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
