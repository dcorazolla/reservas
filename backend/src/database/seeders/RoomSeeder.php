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
            ['name' => 'Quarto 01', 'number' => '1', 'capacity' => 5, 'beds' => 4],
            ['name' => 'Quarto 02', 'number' => '2', 'capacity' => 2, 'beds' => 1],
            ['name' => 'Quarto 03', 'number' => '3', 'capacity' => 2, 'beds' => 1],
            ['name' => 'Quarto 04', 'number' => '4', 'capacity' => 4, 'beds' => 3],
            ['name' => 'Quarto 05', 'number' => '5', 'capacity' => 4, 'beds' => 3],
            ['name' => 'Quarto 06', 'number' => '6', 'capacity' => 3, 'beds' => 2],
            ['name' => 'Quarto 07', 'number' => '7', 'capacity' => 3, 'beds' => 2],
            ['name' => 'Quarto 08', 'number' => '8', 'capacity' => 2, 'beds' => 1],
            ['name' => 'Quarto 09', 'number' => '9', 'capacity' => 2, 'beds' => 1],
            ['name' => 'Quarto 10', 'number' => '10', 'capacity' => 2, 'beds' => 1],
            ['name' => 'Quarto 11', 'number' => '11', 'capacity' => 2, 'beds' => 1],
            ['name' => 'Quarto 12', 'number' => '12', 'capacity' => 2, 'beds' => 1],
            ['name' => 'Quarto 13', 'number' => '13', 'capacity' => 2, 'beds' => 1],
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

