<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Tests\TestCase;

class AvailabilityControllerTest extends TestCase
{
    public function test_search_requires_auth_and_validates()
    {
        // unauthenticated should be 401
        $this->postJson('/api/availability/search', [])->assertStatus(401);

        // authenticated but missing required fields -> 422
        $user = User::factory()->create();
        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $token = $login->json('access_token');

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/availability/search', [])
            ->assertStatus(422)
            ->assertJsonStructure(['message', 'errors']);
    }

    public function test_search_returns_only_capacity_ok_and_non_conflicting_rooms()
    {
        $property = Property::create([
            'name' => 'Avail Property',
            'timezone' => 'UTC',
            'infant_max_age' => 2,
            'child_max_age' => 12,
            'child_factor' => 50,
            'base_one_adult' => 100,
            'base_two_adults' => 150,
            'additional_adult' => 30,
            'child_price' => 25,
        ]);

        // room A capacity 2
        $roomA = Room::create([
            'property_id' => $property->id,
            'room_category_id' => null,
            'number' => '1',
            'name' => 'A',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        // room B capacity 1
        $roomB = Room::create([
            'property_id' => $property->id,
            'room_category_id' => null,
            'number' => '2',
            'name' => 'B',
            'beds' => 1,
            'capacity' => 1,
            'active' => true,
        ]);

        // create a conflicting reservation for room A
        $reservation = Reservation::create([
            'room_id' => $roomA->id,
            'guest_name' => 'Conflicter',
            'adults_count' => 1,
            'children_count' => 0,
            'infants_count' => 0,
            'email' => 'c@example.com',
            'phone' => '000',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
            'status' => 'confirmed',
            'total_value' => 100,
        ]);

        $user = User::factory()->create();
        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $token = $login->json('access_token');

        $payload = [
            'checkin' => now()->toDateString(),
            'checkout' => now()->addDays(1)->toDateString(),
            'adults' => 2,
            'children' => 0,
        ];

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/availability/search', $payload)
            ->assertStatus(200)
            ->json();

        // roomA has conflict and should be excluded; roomB capacity 1 should be excluded for adults=2
        $this->assertIsArray($res);
        $this->assertCount(0, $res);

        // now search with adults=1 -> roomB should be included (no conflict)
        $payload['adults'] = 1;
        $res2 = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/availability/search', $payload)
            ->assertStatus(200)
            ->json();

        $this->assertIsArray($res2);
        $this->assertCount(1, $res2);
        $this->assertEquals($roomB->id, $res2[0]['room_id']);
    }
}
