<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasUuidPrimary;

class AuthSession extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    use HasUuidPrimary;

    protected $fillable = [
        'id',
        'user_id',
        'jwt_id',
        'refresh_token_hash',
        'expires_at',
        'revoked_at',
        'last_used_at',
        'ip',
        'user_agent',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'revoked_at' => 'datetime',
        'last_used_at' => 'datetime',
    ];
}
