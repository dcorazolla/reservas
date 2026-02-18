<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function index()
    {
        return response()->json(Property::orderBy('name')->get());
    }

    public function show(Property $property)
    {
        return response()->json($property);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $property = Property::create($data);
        return response()->json($property, 201);
    }

    public function update(Request $request, Property $property)
    {
        $data = $this->validateData($request);
        $property->update($data);
        return response()->json($property);
    }

    public function destroy(Property $property)
    {
        // Prevent deletion if property has reservations through rooms
        $hasReservations = $property->rooms()
            ->whereHas('reservations')
            ->exists();
        
        if ($hasReservations) {
            return response()->json([
                'error' => 'CONFLICT',
                'message' => 'Propriedade possui reservas vinculadas e não pode ser excluída.',
            ], 409);
        }

        $property->delete();
        return response()->noContent();
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'name'               => 'required|string|max:255',
            'timezone'           => 'required|string|max:100',
            'infant_max_age'     => 'nullable|integer|min:0',
            'child_max_age'      => 'nullable|integer|min:0',
            'child_factor'       => 'nullable|numeric|min:0',
            'base_one_adult'     => 'nullable|numeric|min:0',
            'base_two_adults'    => 'nullable|numeric|min:0',
            'additional_adult'   => 'nullable|numeric|min:0',
            'child_price'        => 'nullable|numeric|min:0',
        ]);
    }
}
