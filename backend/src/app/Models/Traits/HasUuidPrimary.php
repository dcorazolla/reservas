<?php

namespace App\Models\Traits;

use Illuminate\Support\Str;

trait HasUuidPrimary
{
    /**
     * Boot trait to generate UUID primary keys when missing.
     */
    protected static function bootHasUuidPrimary(): void
    {
        static::creating(function ($model) {
            if (method_exists($model, 'getKeyType') && $model->getKeyType() === 'string' && empty($model->getKey())) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }
}
