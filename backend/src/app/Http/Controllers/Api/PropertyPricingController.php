<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\Request;

class PropertyPricingController extends Controller
{
    public function show(Request $request)
    {
        $propertyId = $this->getPropertyId($request);
        $property = Property::findOrFail($propertyId);
        return response()->json([
            'base_one_adult' => $this->normalizeNumber($property->base_one_adult),
            'base_two_adults' => $this->normalizeNumber($property->base_two_adults),
            'additional_adult' => $this->normalizeNumber($property->additional_adult),
            'child_price' => $this->normalizeNumber($property->child_price),
            'infant_max_age' => $this->normalizeNumber($property->infant_max_age),
            'child_max_age' => $this->normalizeNumber($property->child_max_age),
            'child_factor' => $this->normalizeNumber($property->child_factor),
        ]);
    }

    public function update(Request $request)
    {
        $propertyId = $this->getPropertyId($request);
        $property = Property::findOrFail($propertyId);

        $data = $request->validate([
            'base_one_adult'   => 'nullable|numeric|min:0',
            'base_two_adults'  => 'nullable|numeric|min:0',
            'additional_adult' => 'nullable|numeric|min:0',
            'child_price'      => 'nullable|numeric|min:0',
            'infant_max_age'   => 'nullable|integer|min:0',
            'child_max_age'    => 'nullable|integer|min:0',
            'child_factor'     => 'nullable|numeric|min:0',
        ]);

        $property->update($data);
        return response()->json([
            'base_one_adult' => $this->normalizeNumber($property->base_one_adult),
            'base_two_adults' => $this->normalizeNumber($property->base_two_adults),
            'additional_adult' => $this->normalizeNumber($property->additional_adult),
            'child_price' => $this->normalizeNumber($property->child_price),
            'infant_max_age' => $this->normalizeNumber($property->infant_max_age),
            'child_max_age' => $this->normalizeNumber($property->child_max_age),
            'child_factor' => $this->normalizeNumber($property->child_factor),
        ]);
    }

    /**
     * Normalize numeric values stored as decimals/strings into int or float for JSON responses.
     * If the value is null, return null.
     */
    private function normalizeNumber($value)
    {
        if (is_null($value)) {
            return null;
        }

        // Convert string/decimal to float
        $float = (float) $value;

        // If it's a whole number, return as int to match existing tests
        if (floor($float) == $float) {
            return (int) $float;
        }

        return $float;
    }
}
