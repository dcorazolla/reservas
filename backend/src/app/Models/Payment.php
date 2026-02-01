<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasUuidPrimary;

class Payment extends Model
{
    use HasFactory;
    use HasUuidPrimary;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id','external_id','partner_id','amount','method','paid_at','notes'];

    protected $casts = [
        'paid_at' => 'date',
    ];

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function allocations()
    {
        return $this->hasMany(InvoiceLinePayment::class, 'payment_id');
    }
}
