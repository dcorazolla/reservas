<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Partner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class PartnerController extends BaseApiController
{
    public function index()
    {
        return response()->json(Partner::all());
    }

    public function store(Request $request)
    {
        Log::debug('PartnerController@store start', ['input' => $request->all()]);

        try {
            $data = $request->validate([
            'name' => 'required|string|max:191',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'tax_id' => 'nullable|string',
            'address' => 'nullable|string',
        ]);
            // Ensure we have an ID client-side so we don't rely on DB defaults
            if (empty($data['id'])) {
                $data['id'] = (string) \Illuminate\Support\Str::uuid();
            }

            $partner = Partner::create($data);

            Log::debug('PartnerController@store created', ['partner_id' => $partner->id]);

            return response()->json($partner, 201);
        } catch (Exception $e) {
            Log::error('PartnerController@store exception', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            throw $e;
        }
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
