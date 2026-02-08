<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancialAuditLog extends Model
{
    protected $table = 'financial_audit_logs';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'event_type',
        'resource_type',
        'resource_id',
        'payload',
        'user_id',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public $timestamps = true;
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancialAuditLog extends Model
{
    protected $table = 'financial_audit_logs';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'event_type',
        'resource_type',
        'resource_id',
        'payload',
        'user_id',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public $timestamps = true;
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasUuidPrimary;

class FinancialAuditLog extends Model
{
    use HasFactory;
    use HasUuidPrimary;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id','event_type','payload','actor_type','actor_id','resource_type','resource_id','hash'];

    protected $casts = [
        'payload' => 'array',
    ];

    // UUID generation handled by HasUuidPrimary trait
}
