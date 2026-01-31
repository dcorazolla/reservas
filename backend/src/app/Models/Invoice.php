<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Payment;

class Invoice extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id','partner_id','property_id','number','issued_at','due_at','total','status'];

    protected $casts = [
        'issued_at' => 'date',
        'due_at' => 'date',
    ];

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function lines()
    {
        return $this->hasMany(InvoiceLine::class);
    }

    // Payments are allocated to invoice lines via `invoice_line_payments`.
    // Do not define a direct `payments()` relation because `payments` table is shared
    // across partners and doesn't contain `invoice_id`.
}
