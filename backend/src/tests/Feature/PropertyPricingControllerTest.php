<?php

namespace Tests\Feature;

use App\Models\Property;
use Tests\TestCase;

class PropertyPricingControllerTest extends TestCase
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

    public function test_show_returns_pricing()
    {
        Property::truncate();

        $property = Property::create([
            'name' => 'PriceProp',
            'timezone' => 'UTC',
            'base_one_adult' => 100,
            'base_two_adults' => 150,
            'additional_adult' => 20,
            'child_price' => 30,
            'infant_max_age' => 2,
            'child_max_age' => 12,
            'child_factor' => 50,
        ]);

        $token = $this->authToken();

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/properties/pricing')
            ->assertStatus(200)
            ->assertJsonFragment(['base_one_adult' => '100.00', 'child_price' => '30.00']);
    }

    public function test_update_changes_pricing()
    {
        Property::truncate();

        $property = Property::create([
            'name' => 'PriceProp2',
            'timezone' => 'UTC',
            'base_one_adult' => 100,
            'base_two_adults' => 150,
            'additional_adult' => 20,
            'child_price' => 30,
            'infant_max_age' => 2,
            'child_max_age' => 12,
            'child_factor' => 50,
        ]);

        $token = $this->authToken();

        $payload = ['base_one_adult' => 120, 'child_price' => 40];

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/properties/pricing', $payload)
            ->assertStatus(200)
            ->assertJsonFragment(['base_one_adult' => '120.00', 'child_price' => '40.00']);

        $this->assertDatabaseHas('properties', ['id' => $property->id, 'base_one_adult' => 120]);
    }
}
