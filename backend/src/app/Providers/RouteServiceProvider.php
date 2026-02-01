<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use App\Models\Invoice;
use App\Models\Property;

class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        parent::boot();

        // Scoped route-model binding for invoice and other property-scoped models.
        Route::bind('invoice', function ($value) {
            $request = request();

            $propertyId = $request->attributes->get('property_id')
                ?? ($request->user()?->property_id ?? null)
                ?? $request->header('X-Property-Id')
                ?? $request->query('property_id')
                ?? null;

            if (!$propertyId && app()->environment(['local', 'testing'])) {
                $propertyId = (string) (Property::query()->orderBy('id')->value('id') ?? null);
            }

            $query = Invoice::where('id', $value);
            if ($propertyId) {
                $query->where('property_id', $propertyId);
            }

            return $query->firstOrFail();
        });
    }
}
