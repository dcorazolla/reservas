<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run()
    {
        for ($i = 1; $i <= 13; $i++) {
            Room::create([
                'name' => 'Quarto ' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'number' => $i,
                'capacity' => 2,
                'beds' => 1
            ]);
        }
    }
}

