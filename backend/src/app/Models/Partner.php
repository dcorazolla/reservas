<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasUuidPrimary;

class Partner extends Model
{
    use HasFactory;
    use HasUuidPrimary;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'property_id', 'name', 'email', 'phone', 'tax_id', 'address', 'notes'
    ];

    protected $casts = [
        'id' => 'string',
    ];

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
