<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Model;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

trait EnsuresPropertyScope
{
    protected function assertBelongsToProperty(Model $model, string $propertyId): void
    {
        if ((string) $model->property_id !== (string) $propertyId) {
            throw new NotFoundHttpException();
        }
    }
}
