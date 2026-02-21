<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasUuidPrimary;

class CancellationRefundRule extends Model
{
    use HasUuidPrimary;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'policy_id',
        'days_before_checkin_min',
        'days_before_checkin_max',
        'refund_percent',
        'penalty_type',
        'penalty_amount',
        'label',
        'priority',
    ];

    protected $casts = [
        'refund_percent' => 'decimal:2',
        'penalty_amount' => 'decimal:2',
    ];

    /**
     * Relationship: belongs to CancellationPolicy
     */
    public function policy()
    {
        return $this->belongsTo(CancellationPolicy::class);
    }

    /**
     * Scope: order by priority descending, then by days ascending
     */
    public function scopeOrderedByPriority($query)
    {
        return $query
            ->orderBy('priority', 'desc')
            ->orderBy('days_before_checkin_min', 'desc');
    }
}
