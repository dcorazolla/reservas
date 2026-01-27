<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Model;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

trait EnsuresPropertyScope
{
    protected function assertBelongsToProperty(Model $model, int $propertyId): void
    {
        if ((int) $model->property_id !== $propertyId) {
            throw new NotFoundHttpException();
        }
    }
}
