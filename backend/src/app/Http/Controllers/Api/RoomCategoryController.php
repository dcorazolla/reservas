<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RoomCategory;
use App\Services\RoomCategoryService;
use Illuminate\Http\Request;

class RoomCategoryController extends Controller
{
    public function __construct(
        private RoomCategoryService $service
    ) {}

    public function index()
    {
        return response()->json(
            $this->service->list()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:room_categories,name',
            'description' => 'nullable|string',
        ]);

        return response()->json(
            $this->service->create($data),
            201
        );
    }

    public function update(Request $request, RoomCategory $roomCategory)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:room_categories,name,' . $roomCategory->id,
            'description' => 'nullable|string',
        ]);

        return response()->json(
            $this->service->update($roomCategory, $data)
        );
    }

    public function destroy(RoomCategory $roomCategory)
    {
        $this->service->delete($roomCategory);

        return response()->json(null, 204);
    }
}
