<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RoomBlock extends Model
{
    use HasUuids;

    protected $table = 'room_blocks';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'room_id', 'start_date', 'end_date', 'reason', 'partner_id', 'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
