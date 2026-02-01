<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RoomCategory;
use App\Models\RoomCategoryRatePeriod;

class RoomCategoryRatePeriodSeeder extends Seeder
{
    public function run(): void
    {
        $categories = RoomCategory::all();

        foreach ($categories as $cat) {
            RoomCategoryRatePeriod::updateOrCreate(
                [
                    'room_category_id' => $cat->id,
                    'start_date' => '2026-12-24',
                    'end_date' => '2026-12-31',
                ],
                [
                    'base_one_adult' => 280.00,
                    'base_two_adults' => 340.00,
                    'additional_adult' => 120.00,
                    'child_price' => 90.00,
                    'description' => 'Alta temporada / Réveillon (categoria)'
                ]
            );
        }
    }
}
