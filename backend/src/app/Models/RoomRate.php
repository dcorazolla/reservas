<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasUuidPrimary;

class RoomRate extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    use HasFactory;
    use HasUuidPrimary;

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
