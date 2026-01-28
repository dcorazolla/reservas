<?php

namespace Database\Seeders;

use App\Models\RoomCategory;
use Illuminate\Database\Seeder;

class RoomCategorySeeder extends Seeder
{
    public function run()
    {
        RoomCategory::firstOrCreate(['name' => 'Superior']);
        RoomCategory::firstOrCreate(['name' => 'Comum com Ar Condicionado']);
        RoomCategory::firstOrCreate(['name' => 'Comum sem Ar Condicionado']);
    }
}
