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
        'id', 'property_id', 'name', 'email', 'phone', 'tax_id', 'address', 'notes', 'billing_rule', 'partner_discount_percent'
    ];

    protected $casts = [
        'id' => 'string',
        'partner_discount_percent' => 'float',
    ];

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
