<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancialAuditLog extends Model
{
    protected $table = 'financial_audit_logs';

    public $incrementing = false;

    protected $keyType = 'string';

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
