<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;
use App\Models\RoomRatePeriod;

class RoomRatePeriodSeeder extends Seeder
{
    public function run(): void
    {
        Room::all()->each(function (Room $room) {
            RoomRatePeriod::updateOrCreate(
                [
                    'room_id' => $room->id,
                    'people_count' => 2,
                    'start_date' => '2026-12-24',
                    'end_date' => '2026-12-31',
                ],
                [
                    'price_per_day' => 350.00,
                    'description' => 'Alta temporada / Réveillon',
                ]
            );
        });
    }
}
