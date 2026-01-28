<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomCategory extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['name', 'description'];

    public function rooms()
    {
        return $this->hasMany(Room::class, 'room_category_id');
    }

    public function rate()
    {
        return $this->hasOne(RoomCategoryRate::class, 'room_category_id');
    }

    public function ratePeriods()
    {
        return $this->hasMany(RoomCategoryRatePeriod::class, 'room_category_id');
    }
}
