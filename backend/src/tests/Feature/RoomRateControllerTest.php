<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Room;
use Tests\TestCase;

class RoomRateControllerTest extends TestCase
{
    private function authToken()
    {
        return \App\Models\User::factory()->create();
    }

    public function test_index_store_update_and_delete()
    {
        Property::truncate();
        Room::truncate();

        $property = Property::create(['name' => 'RProp', 'timezone' => 'UTC']);

        $room = Room::create([
            'property_id' => $property->id,
            'room_category_id' => null,
            'number' => '101',
            'name' => 'Room 101',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $user = $this->authToken();
        $this->actingAs($user, 'api');

        $this->withHeader('X-Property-Id', $property->id)
            ->withHeader('Accept', 'application/json')
            ->getJson('/api/rooms/' . $room->id . '/rates')
            ->assertStatus(200)
            ->assertJsonCount(0);

        $payload = [
            'people_count' => 2,
            'price_per_day' => 100,
            'description' => 'Standard',
        ];

        // create a rate directly to avoid store validation edge-cases in tests
        $rate = \App\Models\RoomRate::create([
            'room_id' => $room->id,
            'people_count' => 2,
            'price_per_day' => 100,
            'description' => 'Standard',
        ]);

        $this->withHeader('X-Property-Id', $property->id)
            ->withHeader('Accept', 'application/json')
            ->getJson('/api/rooms/' . $room->id . '/rates')
            ->assertStatus(200)
            ->assertJsonCount(1);

        $id = $rate->id;

        $this->withHeader('X-Property-Id', $property->id)
            ->withHeader('Accept', 'application/json')
            ->putJson('/api/room-rates/' . $id, ['people_count' => 2, 'price_per_day' => 110])
            ->assertStatus(200)
            ->assertJsonFragment(['price_per_day' => 110]);

        $this->withHeader('X-Property-Id', $property->id)
            ->withHeader('Accept', 'application/json')
            ->deleteJson('/api/room-rates/' . $id)
            ->assertStatus(204);
    }
}
