<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'name',
        'timezone',
        'infant_max_age',
        'child_max_age',
        'child_factor',
        'base_one_adult',
        'base_two_adults',
        'additional_adult',
        'child_price',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }

    public function roomCategories()
    {
        return $this->hasMany(RoomCategory::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
