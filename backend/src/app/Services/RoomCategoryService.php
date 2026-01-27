<?php

namespace App\Services;

use App\Models\RoomCategory;
use Illuminate\Validation\ValidationException;

class RoomCategoryService
{
    public function list()
    {
        return RoomCategory::orderBy('name')->get();
    }

    public function create(array $data): RoomCategory
    {
        return RoomCategory::create($data);
    }

    public function update(RoomCategory $roomCategory, array $data): RoomCategory
    {
        $roomCategory->update($data);
        return $roomCategory;
    }

    public function delete(RoomCategory $roomCategory): void
    {
        if ($roomCategory->rooms()->exists()) {
            throw ValidationException::withMessages([
                'room_category_id' => 'Categoria possui quartos vinculados e não pode ser removida.',
            ]);
        }

        $roomCategory->delete();
    }
}
