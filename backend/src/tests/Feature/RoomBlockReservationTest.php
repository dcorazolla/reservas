<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Room;
use App\Models\RoomBlock;
use App\Models\User;
use Tests\TestCase;

class RoomBlockReservationTest extends TestCase
{
    public function test_cannot_create_reservation_when_room_block_exists()
    {
        $property = Property::create([
            'name' => 'Block Property',
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
            'number' => '801',
            'name' => 'Room 801',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        // Create a room block overlapping today
        RoomBlock::create([
            'property_id' => $property->id,
            'room_id' => $room->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
            'type' => 'maintenance',
            'reason' => 'Maintenance',
            'recurrence' => 'none',
        ]);

        $user = User::factory()->create();
        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $token = $login->json('access_token');

        $payload = [
            'room_id' => $room->id,
            'guest_name' => 'Blocked Guest',
            'adults_count' => 1,
            'children_count' => 0,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(1)->toDateString(),
        ];

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/reservations', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors('room_id');
    }
}
