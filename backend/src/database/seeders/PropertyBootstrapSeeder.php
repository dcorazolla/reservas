<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Seeder;

class PropertyBootstrapSeeder extends Seeder
{
    public function run(): void
    {
        // Cria ou recupera a propriedade principal
        $property = Property::firstOrCreate(
            ['name' => 'Pousada Casa do Cerrado'],
            ['timezone' => 'America/Sao_Paulo']
        );

        // Associa todos os usuários sem property à propriedade criada
        User::whereNull('property_id')
            ->update(['property_id' => $property->id]);
    }
}
