<?php

namespace Tests\Feature;

use App\Models\Partner;
use Tests\TestCase;

class PartnerControllerTest extends TestCase
{
    private function authToken()
    {
        $user = \App\Models\User::factory()->create();
        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        return $login->json('access_token');
    }
    public function test_index_returns_list()
    {
        Partner::truncate();

        $p1 = Partner::create(['id' => (string) \Illuminate\Support\Str::uuid(), 'name' => 'P1']);
        $p2 = Partner::create(['id' => (string) \Illuminate\Support\Str::uuid(), 'name' => 'P2']);

        $token = $this->authToken();

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/partners')
            ->assertStatus(200)
            ->json();

        $this->assertIsArray($res);
        $this->assertCount(2, $res);
    }

    public function test_store_validates_and_creates_partner()
    {
        Partner::truncate();

        $payload = [
            'name' => 'New Partner',
            'email' => 'partner@example.com',
            'phone' => '12345',
        ];

        $token = $this->authToken();

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/partners', $payload)
            ->assertStatus(201)
            ->json();

        $id = $res['id'] ?? $res['data']['id'] ?? null;
        $this->assertNotNull($id);
        $this->assertDatabaseHas('partners', ['id' => $id, 'name' => 'New Partner']);
    }

    public function test_show_returns_partner()
    {
        Partner::truncate();

        $partner = Partner::create(['id' => (string) \Illuminate\Support\Str::uuid(), 'name' => 'ShowMe']);

        $token = $this->authToken();

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/partners/' . $partner->id)
            ->assertStatus(200)
            ->assertJsonFragment(['name' => 'ShowMe']);
    }

    public function test_update_changes_fields()
    {
        Partner::truncate();

        $partner = Partner::create(['id' => (string) \Illuminate\Support\Str::uuid(), 'name' => 'Before']);

        $payload = ['name' => 'After'];

        $token = $this->authToken();

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/partners/' . $partner->id, $payload)
            ->assertStatus(200)
            ->json();

        $this->assertDatabaseHas('partners', ['id' => $partner->id, 'name' => 'After']);
    }

    public function test_destroy_deletes_partner()
    {
        Partner::truncate();

        $partner = Partner::create(['id' => (string) \Illuminate\Support\Str::uuid(), 'name' => 'ToDelete']);

        $token = $this->authToken();

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/partners/' . $partner->id)
            ->assertStatus(204);

        $this->assertDatabaseMissing('partners', ['id' => $partner->id]);
    }
}
