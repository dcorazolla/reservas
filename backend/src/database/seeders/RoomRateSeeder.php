<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;
use App\Models\RoomRate;

class RoomRateSeeder extends Seeder
{
    public function run(): void
    {
        Room::all()->each(function (Room $room) {
            for ($i = 1; $i <= $room->capacity; $i++) {
                RoomRate::updateOrCreate(
                    [
                        'room_id' => $room->id,
                        'people_count' => $i,
                    ],
                    [
                        'price_per_day' => 100 + (($i - 1) * 50),
                    ]
                );
            }
        });
    }
}
