<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Property;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure default property exists
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

        // Create or update admin user with property association
        User::updateOrCreate(
            [
                'email' => 'admin@admin.com',
            ],
            [
                'name' => 'Administrador',
                'password' => \Illuminate\Support\Facades\Hash::make('123456'),
                'property_id' => $property->id,
            ]
        );
    }
}
