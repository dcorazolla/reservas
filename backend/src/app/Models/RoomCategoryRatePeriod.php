<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomCategoryRatePeriod extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'room_category_id',
        'start_date',
        'end_date',
        'base_one_adult',
        'base_two_adults',
        'additional_adult',
        'child_price',
        'description',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    public function category()
    {
        return $this->belongsTo(RoomCategory::class, 'room_category_id');
    }
}
