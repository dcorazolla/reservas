<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomPropertyBackfillSeeder extends Seeder
{
    public function run(): void
    {
        $property = Property::firstOrFail();

        Room::whereNull('property_id')
            ->update(['property_id' => $property->id]);
    }
}
