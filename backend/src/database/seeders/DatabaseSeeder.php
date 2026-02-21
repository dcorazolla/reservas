<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use UpdateRoomNumbersSeeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            PropertyBootstrapSeeder::class,
            RoomCategorySeeder::class,
            RoomSeeder::class,
            RoomCategoryRateSeeder::class,
            RoomCategoryRatePeriodSeeder::class,
            RoomRateSeeder::class,
            RoomRatePeriodSeeder::class,
            ProductSeeder::class,
            PartnerReservationsSeeder::class,
            RoomBlockSeeder::class,
        ]);
    }
}
