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

    // Enums
    const TYPE_MAINTENANCE = 'maintenance';
    const TYPE_CLEANING = 'cleaning';
    const TYPE_PRIVATE = 'private';
    const TYPE_CUSTOM = 'custom';
    
    const RECURRENCE_NONE = 'none';
    const RECURRENCE_DAILY = 'daily';
    const RECURRENCE_WEEKLY = 'weekly';
    const RECURRENCE_MONTHLY = 'monthly';

    protected $fillable = [
        'room_id', 'start_date', 'end_date', 'type', 'reason', 'recurrence', 'created_by',
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
