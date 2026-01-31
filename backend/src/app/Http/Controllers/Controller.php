<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use App\Http\Controllers\Concerns\EnsuresPropertyScope;
use App\Models\Property;

abstract class Controller
{
    use EnsuresPropertyScope;

    final protected function getPropertyId(Request $request): string
    {
        if ($request->attributes->has('property_id')) {
            return (string) $request->attributes->get('property_id');
        }

        // JWT (futuro padrão)
        if ($request->user()?->property_id) {
            $propertyId = (string) $request->user()->property_id;
        } else {
            // Header (temporário) ou Query Param
            $propertyId = (string) ($request->header('X-Property-Id')
                           ?: $request->header('Property-Id')
                           ?: $request->query('property_id')
                           ?: $request->query('propertyId')
                           ?: '');
        }

        // Fallbacks para ambiente local/testing
        // Removido fallback numérico. Em ambiente local/teste, tenta primeiro ID existente.

        if (!$propertyId && app()->environment(['local', 'testing'])) {
            $propertyId = (string) (Property::query()->orderBy('id')->value('id') ?? '');
        }

        if (!$propertyId) {
            throw new BadRequestHttpException('Property context not informed. Provide JWT with property_id, header X-Property-Id, or query property_id.');
        }

        $request->attributes->set('property_id', $propertyId);

        return (string) $propertyId;
    }
}
