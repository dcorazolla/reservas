<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialAuditLog extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id','event_type','payload','actor_type','actor_id','resource_type','resource_id','hash'];

    protected $casts = [
        'payload' => 'array',
    ];
}
