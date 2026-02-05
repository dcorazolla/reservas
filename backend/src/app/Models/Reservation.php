<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasUuidPrimary;

class Reservation extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'room_id',
        'partner_id',
        'guest_name',
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

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function scopeConflicting($query, $roomId, $start, $end)
    {
        return $query
            ->where('room_id', $roomId)
            ->where('status', '!=', 'cancelado')
            ->where('start_date', '<', $end)
            ->where('end_date', '>', $start);
    }

    use HasUuidPrimary;
}

