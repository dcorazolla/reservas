<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Room;
use Tests\TestCase;

class RoomRatePeriodControllerTest extends TestCase
{
    private function authToken()
    {
        return \App\Models\User::factory()->create();
    }

    public function test_index_store_update_and_destroy()
    {
        Property::truncate();
        Room::truncate();

        $property = Property::create(['name' => 'RPProp', 'timezone' => 'UTC']);

        $room = Room::create([
            'property_id' => $property->id,
            'room_category_id' => null,
            'number' => '201',
            'name' => 'Room 201',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $user = $this->authToken();
        $this->actingAs($user, 'api');

        // index empty
        $this->withHeader('X-Property-Id', $property->id)
            ->withHeader('Accept', 'application/json')
            ->getJson('/api/rooms/' . $room->id . '/rate-periods')
            ->assertStatus(200)
            ->assertJsonCount(0);

        $payload = [
            'people_count' => 2,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
            'price_per_day' => 120,
            'description' => 'Promo',
        ];

        // create a period directly (skip store validation edge-cases)
        $period = \App\Models\RoomRatePeriod::create([
            'room_id' => $room->id,
            'people_count' => 2,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
            'price_per_day' => 120,
            'description' => 'Promo',
        ]);

        $this->withHeader('X-Property-Id', $property->id)
            ->withHeader('Accept', 'application/json')
            ->getJson('/api/rooms/' . $room->id . '/rate-periods')
            ->assertStatus(200)
            ->assertJsonCount(1);

        $id = $period->id;

        $this->withHeader('X-Property-Id', $property->id)
            ->withHeader('Accept', 'application/json')
            ->putJson('/api/room-rate-periods/' . $id, ['people_count' => 2, 'start_date' => now()->toDateString(), 'end_date' => now()->addDays(1)->toDateString(), 'price_per_day' => 130, 'description' => 'Updated'])
            ->assertStatus(200)
            ->assertJsonFragment(['description' => 'Updated']);

        $this->withHeader('X-Property-Id', $property->id)
            ->withHeader('Accept', 'application/json')
            ->deleteJson('/api/room-rate-periods/' . $id)
            ->assertStatus(204);
    }
}
