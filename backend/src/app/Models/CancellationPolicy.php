<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasUuidPrimary;

class CancellationPolicy extends Model
{
    use HasUuidPrimary;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'property_id',
        'name',
        'description',
        'type',
        'config',
        'active',
        'applies_from',
        'applies_to',
        'created_by_id',
    ];

    protected $casts = [
        'config' => 'array',
        'active' => 'boolean',
        'applies_from' => 'date',
        'applies_to' => 'date',
    ];

    /**
     * Relationship: belongs to Property
     */
    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Relationship: has many refund rules
     */
    public function rules()
    {
        return $this->hasMany(CancellationRefundRule::class, 'policy_id');
    }

    /**
     * Relationship: created by user
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    /**
     * Scope: active policies only
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope: policies applicable at given date
     */
    public function scopeApplicableAt($query, $date = null)
    {
        $date = $date ? \Carbon\Carbon::parse($date)->toDateString() : now()->toDateString();

        return $query
            ->where('applies_from', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('applies_to')
                  ->orWhere('applies_to', '>=', $date);
            });
    }
}
