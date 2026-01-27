<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use App\Http\Controllers\Concerns\EnsuresPropertyScope;

abstract class Controller
{
    use EnsuresPropertyScope;

    final protected function getPropertyId(Request $request): int
    {
        if ($request->attributes->has('property_id')) {
            return $request->attributes->get('property_id');
        }

        // JWT (futuro padrão)
        if ($request->user()?->property_id) {
            $propertyId = (int) $request->user()->property_id;
        } else {
            // Header (temporário)
            $propertyId = (int) $request->header('X-Property-Id');
        }

        if (!$propertyId) {
            throw new BadRequestHttpException('Property context not informed');
        }

        $request->attributes->set('property_id', $propertyId);

        return $propertyId;
    }
}
