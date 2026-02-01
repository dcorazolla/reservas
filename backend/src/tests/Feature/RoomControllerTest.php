<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Room;
use App\Models\User;
use Tests\TestCase;

class RoomControllerTest extends TestCase
{
    public function test_index_returns_rooms_for_property()
    {
        $property = Property::create([
            'name' => 'Rooms Property',
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

        $user = User::factory()->create();
        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $token = $login->json('access_token');

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/rooms')
            ->assertStatus(200)
            ->json();

        $this->assertIsArray($res);
        $this->assertNotEmpty($res);
    }

    public function test_store_update_and_delete_room()
    {
        $property = Property::create([
            'name' => 'Rooms Property 2',
            'timezone' => 'UTC',
            'infant_max_age' => 2,
            'child_max_age' => 12,
            'child_factor' => 50,
            'base_one_adult' => 100,
            'base_two_adults' => 150,
            'additional_adult' => 30,
            'child_price' => 25,
        ]);

        $user = User::factory()->create();
        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $token = $login->json('access_token');

        // create
        $payload = [
            'number' => '402',
            'name' => 'Room 402',
            'beds' => 1,
            'capacity' => 2,
        ];

        $create = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/rooms', $payload)
            ->assertStatus(201)
            ->json();

        $id = $create['id'] ?? $create['data']['id'] ?? null;
        $this->assertNotNull($id);
        $this->assertDatabaseHas('rooms', ['id' => $id, 'number' => '402']);

        // update
        $updatePayload = [
            'number' => '402',
            'name' => 'Room 402 Updated',
            'beds' => 2,
            'capacity' => 3,
        ];

        $updated = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/rooms/' . $id, $updatePayload)
            ->assertStatus(200)
            ->json();

        $this->assertEquals('Room 402 Updated', $updated['name'] ?? $updated['data']['name'] ?? null);

        // delete
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/rooms/' . $id)
            ->assertStatus(204);

        $this->assertDatabaseMissing('rooms', ['id' => $id]);
    }
}
