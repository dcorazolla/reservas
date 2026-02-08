<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Room;
use App\Models\Reservation;
use App\Models\Partner;
use App\Models\MinibarConsumption;
use App\Models\Invoice;
use App\Models\User;
use Tests\TestCase;

class MinibarCheckoutTest extends TestCase
{
    public function test_checkout_blocked_when_guest_has_minibar_and_no_payment()
    {
        $property = Property::create([
            'name' => 'MB Property',
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
            'number' => '700',
            'name' => 'Room 700',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $reservation = Reservation::create([
            'room_id' => $room->id,
            'guest_name' => 'Minibar Guest',
            'adults_count' => 1,
            'children_count' => 0,
            'infants_count' => 0,
            'email' => 'mb@example.com',
            'phone' => '000',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(1)->toDateString(),
            'status' => 'checked_in',
            'total_value' => 100,
        ]);

        $user = User::factory()->create();
        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);
        $token = $login->json('access_token');

        // create minibar consumption
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/minibar-consumptions', [
                'reservation_id' => $reservation->id,
                'description' => 'Soda',
                'quantity' => 2,
                'unit_price' => 5,
            ])->assertStatus(201);

        // attempt checkout -> should be blocked (guest owes 10)
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/reservations/' . $reservation->id . '/checkout')
            ->assertStatus(422)
            ->assertJsonFragment(['message' => 'Checkout bloqueado: existem valores pendentes']);
    }

    public function test_checkout_allows_when_partner_pays_and_only_minibar_is_charged()
    {
        $property = Property::create([
            'name' => 'MB Partner Property',
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
            'number' => '701',
            'name' => 'Room 701',
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);

        $partner = Partner::create(['property_id' => $property->id, 'name' => 'Agency']);

        $reservation = Reservation::create([
            'room_id' => $room->id,
            'guest_name' => 'Partner Guest',
            'adults_count' => 1,
            'children_count' => 0,
            'infants_count' => 0,
            'email' => 'p@example.com',
            'phone' => '000',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(1)->toDateString(),
            'status' => 'checked_in',
            'total_value' => 200,
            'partner_id' => $partner->id,
        ]);

        $user = User::factory()->create();
        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);
        $token = $login->json('access_token');

        // create minibar consumption
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/minibar-consumptions', [
                'reservation_id' => $reservation->id,
                'description' => 'Water',
                'quantity' => 1,
                'unit_price' => 3,
            ])->assertStatus(201);

        // partner pays: checkout should succeed and create minibar invoice for guest
        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/reservations/' . $reservation->id . '/checkout')
            ->assertStatus(200)
            ->json();

        $this->assertDatabaseHas('reservations', ['id' => $reservation->id, 'status' => 'checked_out']);

        // minibar invoice creation should have been attempted (audit log exists)
        $this->assertDatabaseHas('financial_audit_logs', [
            'event_type' => 'reservation.minibar_invoice_created',
            'resource_type' => 'reservation',
            'resource_id' => $reservation->id,
        ]);
    }
}
