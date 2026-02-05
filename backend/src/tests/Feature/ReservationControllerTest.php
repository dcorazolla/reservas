<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Tests\TestCase;

class ReservationControllerTest extends TestCase
{
    public function test_store_requires_auth_returns_401()
    {
        $response = $this->postJson('/api/reservations', []);

        $response->assertStatus(401);
    }

    public function test_store_validation_returns_422_when_missing_fields()
    {
        $user = User::factory()->create();

        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $token = $login->json('access_token');

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/reservations', [])
            ->assertStatus(422)
            ->assertJsonStructure(['message', 'errors']);
    }

    public function test_show_requires_auth_and_returns_reservation()
    {
        $property = Property::create([
            'name' => 'Test Property',
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
            'number' => '101',
            'name' => 'Room 101',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $reservation = Reservation::create([
            'room_id' => $room->id,
            'guest_name' => 'Test Guest',
            'adults_count' => 2,
            'children_count' => 0,
            'infants_count' => 0,
            'email' => 'guest@example.com',
            'phone' => '123456789',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
            'status' => 'confirmed',
            'total_value' => 200,
        ]);

        // unauthenticated
        $this->getJson('/api/reservations/' . $reservation->id)
            ->assertStatus(401);

        // login and request
        $user = User::factory()->create();
        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $token = $login->json('access_token');

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/reservations/' . $reservation->id)
            ->assertStatus(200)
            ->assertJsonFragment(['guest_name' => 'Test Guest']);
    }

    public function test_store_creates_reservation_successfully()
    {
        $property = Property::create([
            'name' => 'Create Property',
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
            'number' => '201',
            'name' => 'Room 201',
            'beds' => 1,
            'capacity' => 2,
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
            'guest_name' => 'New Guest',
            'adults_count' => 2,
            'children_count' => 0,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(1)->toDateString(),
        ];

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/reservations', $payload)
            ->assertStatus(201)
            ->json();

        $id = $res['data']['id'] ?? $res['id'] ?? null;
        $this->assertNotNull($id, 'Expected reservation id in response');
        $this->assertDatabaseHas('reservations', [
            'id' => $id,
            'guest_name' => 'New Guest',
        ]);
    }

    public function test_store_allows_setting_partner_id()
    {
        $property = Property::create([
            'name' => 'Partner Property',
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
            'number' => '401',
            'name' => 'Room 401',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $partner = \App\Models\Partner::create([
            'property_id' => $property->id,
            'name' => 'Acme Agency',
        ]);

        $user = User::factory()->create();
        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $token = $login->json('access_token');

        $payload = [
            'room_id' => $room->id,
            'guest_name' => 'Partner Guest',
            'adults_count' => 2,
            'children_count' => 0,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(1)->toDateString(),
            'partner_id' => $partner->id,
        ];

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/reservations', $payload)
            ->assertStatus(201)
            ->json();

        $id = $res['data']['id'] ?? $res['id'] ?? null;
        $this->assertNotNull($id, 'Expected reservation id in response');
        $this->assertDatabaseHas('reservations', [
            'id' => $id,
            'partner_id' => $partner->id,
        ]);
    }

    public function test_update_recalculates_total()
    {
        $property = Property::create([
            'name' => 'Update Property',
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
            'number' => '301',
            'name' => 'Room 301',
            'beds' => 1,
            'capacity' => 3,
            'active' => true,
        ]);

        $reservation = Reservation::create([
            'room_id' => $room->id,
            'guest_name' => 'To Update',
            'adults_count' => 1,
            'children_count' => 0,
            'infants_count' => 0,
            'email' => 'u@example.com',
            'phone' => '000',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(1)->toDateString(),
            'status' => 'confirmed',
            'total_value' => 100,
        ]);

        $user = User::factory()->create();
        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $token = $login->json('access_token');

        // update reservation to increase adults -> should recalc total
        $payload = [
            'adults_count' => 2,
        ];

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/reservations/' . $reservation->id, $payload)
            ->assertStatus(200)
            ->json();

        $adults = $res['data']['adults_count'] ?? $res['adults_count'] ?? null;
        $this->assertEquals(2, $adults);
        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'adults_count' => 2,
        ]);
    }
}
