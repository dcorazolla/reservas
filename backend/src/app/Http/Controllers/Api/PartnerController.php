<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\BaseApiController;
use App\Models\Partner;
use Illuminate\Http\Request;

class PartnerController extends BaseApiController
{
    public function index()
    {
        return response()->json(Partner::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:191',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'tax_id' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        $partner = Partner::create($data);

        return response()->json($partner, 201);
    }

    public function show(Partner $partner)
    {
        return response()->json($partner);
    }

    public function update(Request $request, Partner $partner)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:191',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'tax_id' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        $partner->update($data);

        return response()->json($partner);
    }

    public function destroy(Partner $partner)
    {
        $partner->delete();
        return response()->json(null, 204);
    }
}
