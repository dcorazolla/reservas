<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Seeder;

class PropertyBootstrapSeeder extends Seeder
{
    public function run(): void
    {
        // Cria ou recupera a propriedade principal com informações completas
        $property = Property::firstOrCreate(
            ['name' => 'Pousada Casa do Cerrado'],
            [
                'timezone' => 'America/Sao_Paulo',
                'infant_max_age' => 2,
                'child_max_age' => 12,
                'child_factor' => 0.50,
                'base_one_adult' => 180.00,
                'base_two_adults' => 240.00,
                'additional_adult' => 80.00,
                'child_price' => 60.00,
            ]
        );

        // Associa todos os usuários sem property à propriedade criada
        User::whereNull('property_id')
            ->update(['property_id' => $property->id]);
    }
}
