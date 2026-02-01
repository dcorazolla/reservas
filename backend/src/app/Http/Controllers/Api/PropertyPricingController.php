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
            'base_one_adult' => $property->base_one_adult,
            'base_two_adults' => $property->base_two_adults,
            'additional_adult' => $property->additional_adult,
            'child_price' => $property->child_price,
            'infant_max_age' => $property->infant_max_age,
            'child_max_age' => $property->child_max_age,
            'child_factor' => $property->child_factor,
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
            'base_one_adult' => $property->base_one_adult,
            'base_two_adults' => $property->base_two_adults,
            'additional_adult' => $property->additional_adult,
            'child_price' => $property->child_price,
            'infant_max_age' => $property->infant_max_age,
            'child_max_age' => $property->child_max_age,
            'child_factor' => $property->child_factor,
        ]);
    }
}
