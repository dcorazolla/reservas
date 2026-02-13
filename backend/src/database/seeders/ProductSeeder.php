<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['name' => 'Água 500ml', 'sku' => 'AG500', 'price' => 2.50, 'stock' => 50, 'description' => 'Garrafa de água mineral 500ml'],
            ['name' => 'Cerveja Lata 350ml', 'sku' => 'CV350', 'price' => 3.50, 'stock' => 40, 'description' => 'Cerveja em lata 350ml'],
            ['name' => 'Snack Mix', 'sku' => 'SNACK1', 'price' => 4.00, 'stock' => 30, 'description' => 'Mix de snacks salgados'],
        ];

        foreach ($items as $i) {
            Product::create(array_merge($i, ['id' => (string) Str::uuid(), 'active' => true]));
        }
    }
}
