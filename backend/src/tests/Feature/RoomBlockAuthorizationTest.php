<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Room;
use App\Models\RoomBlock;
use App\Models\User;
use Tests\TestCase;

class RoomBlockAuthorizationTest extends TestCase
{
    public function test_user_without_property_cannot_create_block()
    {
        $property = Property::create([
            'name' => 'Auth Property',
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
            'number' => '901',
            'name' => 'Room 901',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $user = User::factory()->create(); // no property_id set
        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $token = $login->json('access_token');

        $payload = [
            'room_id' => $room->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(1)->toDateString(),
            'reason' => 'Test',
        ];

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/room-blocks', $payload)
            ->assertStatus(403);
    }

    public function test_user_with_same_property_can_delete_block()
    {
        $property = Property::create([
            'name' => 'Auth Property 2',
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
            'number' => '902',
            'name' => 'Room 902',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $block = RoomBlock::create([
            'room_id' => $room->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(1)->toDateString(),
            'reason' => 'Test',
        ]);

        // create user belonging to same property
        $user = User::factory()->create(['property_id' => $property->id]);
        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $token = $login->json('access_token');

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/room-blocks/' . $block->id)
            ->assertStatus(204);
    }
}
