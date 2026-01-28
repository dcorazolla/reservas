<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'guest_name',
        'people_count',
        'adults_count',
        'children_count',
        'infants_count',
        'email',
        'phone',
        'start_date',
        'end_date',
        'status',
        'total_value',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
        'total_value'=> 'decimal:2',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function scopeConflicting($query, $roomId, $start, $end)
    {
        return $query
            ->where('room_id', $roomId)
            ->where('status', '!=', 'cancelado')
            ->where('start_date', '<', $end)
            ->where('end_date', '>', $start);
    }
}

