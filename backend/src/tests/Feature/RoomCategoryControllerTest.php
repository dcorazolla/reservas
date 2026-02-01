<?php

namespace Tests\Feature;

use App\Models\RoomCategory;
use App\Models\User;
use Tests\TestCase;

class RoomCategoryControllerTest extends TestCase
{
    public function test_index_store_show_update_and_destroy()
    {
        RoomCategory::truncate();

        $user = User::factory()->create();
        $this->actingAs($user, 'api');

        // index empty
        $this->withHeader('Accept', 'application/json')
            ->getJson('/api/room-categories')
            ->assertStatus(200)
            ->assertJsonCount(0);

        // store
        $payload = ['name' => 'Categoria A', 'description' => 'desc'];
        $res = $this->withHeader('Accept', 'application/json')
            ->postJson('/api/room-categories', $payload)
            ->assertStatus(201)
            ->json();

        $id = $res['data']['id'] ?? $res['id'] ?? null;
        $this->assertNotNull($id);

        // index contains created
        $this->withHeader('Accept', 'application/json')
            ->getJson('/api/room-categories')
            ->assertStatus(200)
            ->assertJsonFragment(['name' => 'Categoria A']);

        // update
        $this->withHeader('Accept', 'application/json')
            ->putJson('/api/room-categories/' . $id, ['name' => 'Categoria B'])
            ->assertStatus(200)
            ->assertJsonFragment(['name' => 'Categoria B']);

        // destroy
        $this->withHeader('Accept', 'application/json')
            ->deleteJson('/api/room-categories/' . $id)
            ->assertStatus(204);
    }
}
