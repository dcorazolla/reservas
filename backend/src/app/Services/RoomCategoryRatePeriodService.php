<?php
namespace App\Services;

use App\Models\RoomCategory;
use App\Models\RoomCategoryRatePeriod;
use Illuminate\Support\Collection;

class RoomCategoryRatePeriodService
{
    public function list(RoomCategory $category): Collection
    {
        return $category->ratePeriods()->orderByDesc('start_date')->get();
    }

    public function create(RoomCategory $category, array $data): RoomCategoryRatePeriod
    {
        return RoomCategoryRatePeriod::create([
            ...$data,
            'room_category_id' => $category->id,
        ]);
    }

    public function update(RoomCategoryRatePeriod $period, array $data): RoomCategoryRatePeriod
    {
        $period->update($data);
        return $period;
    }

    public function delete(RoomCategoryRatePeriod $period): void
    {
        $period->delete();
    }
}
