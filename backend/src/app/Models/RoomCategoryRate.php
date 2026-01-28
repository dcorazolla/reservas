<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomCategoryRate extends Model
{
    protected $fillable = [
        'room_category_id',
        'base_one_adult',
        'base_two_adults',
        'additional_adult',
        'child_price',
    ];

    public function category()
    {
        return $this->belongsTo(RoomCategory::class, 'room_category_id');
    }
}
