<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasUuidPrimary;

class RoomCategoryRate extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    use HasUuidPrimary;
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
