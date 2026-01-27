<?php

namespace Database\Seeders;

use App\Models\RoomCategory;
use Illuminate\Database\Seeder;

class RoomCategorySeeder extends Seeder
{
    public function run()
    {
        RoomCategory::insert([
            ['name' => 'Superior'],
            ['name' => 'Comum com Ar Condicionado'],
            ['name' => 'Comum sem Ar Condicionado'],
        ]);
    }
}
