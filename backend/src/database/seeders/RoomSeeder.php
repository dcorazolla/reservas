<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\Property;
use App\Models\RoomCategory;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run()
    {
        $property = Property::firstOrCreate(
            ['name' => 'Pousada Casa do Cerrado'],
            ['timezone' => 'America/Sao_Paulo']
        );

        $categories = RoomCategory::orderBy('name')->get();

        // Cria 3 quartos, um para cada categoria existente
        $rooms = [
            ['name' => 'Quarto 01', 'number' => '1', 'capacity' => 2, 'beds' => 1],
            ['name' => 'Quarto 02', 'number' => '2', 'capacity' => 3, 'beds' => 2],
            ['name' => 'Quarto 03', 'number' => '3', 'capacity' => 2, 'beds' => 1],
        ];

        foreach ($rooms as $idx => $data) {
            Room::create([
                'property_id' => $property->id,
                'room_category_id' => $categories[$idx % max(1, $categories->count())]->id,
                'name' => $data['name'],
                'number' => $data['number'],
                'capacity' => $data['capacity'],
                'beds' => $data['beds'],
                'active' => true,
            ]);
        }
    }
}

