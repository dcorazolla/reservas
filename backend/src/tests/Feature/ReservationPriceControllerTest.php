<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Tests\TestCase;

class ReservationPriceControllerTest extends TestCase
{
    public function test_calculate_returns_total_and_days()
    {
        $property = Property::create([
            'name' => 'Price Property',
            'timezone' => 'UTC',
            'infant_max_age' => 2,
            'child_max_age' => 12,
            'child_factor' => 50,
            'base_one_adult' => 100,
            'base_two_adults' => 150,
            'additional_adult' => 30,
            'child_price' => 25,
        ]);

        $room = Room::create([
            'property_id' => $property->id,
            'room_category_id' => null,
            'number' => '501',
            'name' => 'Room 501',
            'beds' => 1,
            'capacity' => 3,
            'active' => true,
        ]);

        $user = User::factory()->create();
        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $token = $login->json('access_token');

        $payload = [
            'room_id' => $room->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
            'people_count' => 2,
        ];

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/reservations/calculate', $payload)
            ->assertStatus(200)
            ->json();

        $this->assertArrayHasKey('total', $res);
        $this->assertArrayHasKey('days', $res);
    }

    public function test_calculate_detailed_returns_source_total_and_days()
    {
        $property = Property::create([
            'name' => 'Price Property 2',
            'timezone' => 'UTC',
            'infant_max_age' => 2,
            'child_max_age' => 12,
            'child_factor' => 50,
            'base_one_adult' => 100,
            'base_two_adults' => 150,
            'additional_adult' => 30,
            'child_price' => 25,
        ]);

        $room = Room::create([
            'property_id' => $property->id,
            'room_category_id' => null,
            'number' => '502',
            'name' => 'Room 502',
            'beds' => 1,
            'capacity' => 3,
            'active' => true,
        ]);

        $user = User::factory()->create();
        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $token = $login->json('access_token');

        $payload = [
            'room_id' => $room->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
            'adults_count' => 2,
            'children_count' => 1,
            'infants_count' => 0,
        ];

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/reservations/calculate-detailed', $payload)
            ->assertStatus(200)
            ->json();

        $this->assertArrayHasKey('source', $res);
        $this->assertArrayHasKey('total', $res);
        $this->assertArrayHasKey('days', $res);
    }
}
