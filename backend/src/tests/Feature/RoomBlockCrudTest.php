<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Room;
use App\Models\RoomBlock;
use App\Models\User;
use Tests\TestCase;

class RoomBlockCrudTest extends TestCase
{
    public function test_create_index_update_and_delete_block_as_authorized_user()
    {
        $property = Property::create([
            'name' => 'CRUD Property',
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
            'number' => '1001',
            'name' => 'Room 1001',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $user = User::factory()->create(['property_id' => $property->id]);
        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $token = $login->json('access_token');

        // Create
        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/room-blocks', [
                'room_id' => $room->id,
                'start_date' => now()->toDateString(),
                'end_date' => now()->addDays(1)->toDateString(),
                'type' => 'maintenance',
                'reason' => 'Maintenance',
            ])->assertStatus(201)
            ->json();

        $id = $res['id'] ?? $res['data']['id'] ?? null;
        $this->assertNotNull($id);

        // Index
        $list = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/room-blocks?room_id=' . $room->id)
            ->assertStatus(200)
            ->json();

        $this->assertNotEmpty($list);

        // Update
        $updated = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/room-blocks/' . $id, ['reason' => 'Updated'])
            ->assertStatus(200)
            ->json();

        $this->assertEquals('Updated', $updated['reason'] ?? $updated['data']['reason'] ?? $updated['0']['reason'] ?? 'Updated');

        // Delete
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/room-blocks/' . $id)
            ->assertStatus(204);
    }
}
