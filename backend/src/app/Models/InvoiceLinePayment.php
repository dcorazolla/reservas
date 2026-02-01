<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceLinePayment extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id','payment_id','invoice_line_id','amount'];

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function invoiceLine()
    {
        return $this->belongsTo(InvoiceLine::class);
    }
}
