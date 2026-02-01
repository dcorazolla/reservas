<?php
namespace App\Services;

use App\Models\RoomCategory;
use App\Models\RoomCategoryRate;
use Illuminate\Support\Collection;

class RoomCategoryRateService
{
    public function list(RoomCategory $category): Collection
    {
        return collect($category->rate ? [$category->rate] : []);
    }

    public function create(RoomCategory $category, array $data): RoomCategoryRate
    {
        return RoomCategoryRate::create([
            ...$data,
            'room_category_id' => $category->id,
        ]);
    }

    public function update(RoomCategoryRate $rate, array $data): RoomCategoryRate
    {
        $rate->update($data);
        return $rate;
    }

    public function delete(RoomCategoryRate $rate): void
    {
        $rate->delete();
    }
}
