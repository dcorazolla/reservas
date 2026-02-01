<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasUuidPrimary;

class Room extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'property_id',
        'room_category_id',
        'number',
        'name',
        'beds',
        'capacity',
        'active',
        'notes',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function category()
    {
        return $this->belongsTo(RoomCategory::class, 'room_category_id');
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    /* Scopes */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeForProperty($query, string $propertyId)
    {
        return $query->where('property_id', $propertyId);
    }

    public function rates()
    {
        return $this->hasMany(RoomRate::class);
    }

    public function ratePeriods()
    {
        return $this->hasMany(RoomRatePeriod::class);
    }
    
    use HasUuidPrimary;
    
}
