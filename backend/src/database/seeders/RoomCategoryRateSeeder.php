<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RoomCategory;
use App\Models\RoomCategoryRate;

class RoomCategoryRateSeeder extends Seeder
{
    public function run(): void
    {
        $categories = RoomCategory::all();

        foreach ($categories as $cat) {
            RoomCategoryRate::updateOrCreate(
                ['room_category_id' => $cat->id],
                [
                    'base_one_adult' => 200.00,
                    'base_two_adults' => 260.00,
                    'additional_adult' => 90.00,
                    'child_price' => 70.00,
                ]
            );
        }
    }
}
