<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasUuidPrimary;

class InvoiceLine extends Model
{
    use HasFactory;
    use HasUuidPrimary;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id','invoice_id','description','quantity','unit_price','line_total'];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function allocations()
    {
        return $this->hasMany(InvoiceLinePayment::class, 'invoice_line_id');
    }

    // UUID generation handled by HasUuidPrimary trait
}
