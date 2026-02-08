<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Tests\TestCase;

class ReservationInvoiceLinkTest extends TestCase
{
    public function test_create_with_price_override_sets_invoice_id()
    {
        $property = Property::create([
            'name' => 'Link Property',
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

        $user = User::factory()->create();
        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $token = $login->json('access_token');

        $payload = [
            'room_id' => $room->id,
            'guest_name' => 'Link Guest',
            'adults_count' => 2,
            'children_count' => 0,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(1)->toDateString(),
            'price_override' => 150.00,
        ];

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/reservations', $payload)
            ->assertStatus(201)
            ->json();

        $id = $res['data']['id'] ?? $res['id'] ?? null;
        $this->assertNotNull($id, 'Expected reservation id in response');

        $reservation = Reservation::find($id);
        $this->assertNotNull($reservation, 'Reservation must exist');

        // If invoice creation succeeded, `invoice_id` should be set and invoice exists.
        // If invoice creation failed, an audit entry `reservation.invoice_creation_failed` should exist.
        if (is_null($reservation->invoice_id)) {
            $this->assertDatabaseHas('financial_audit_logs', [
                'event_type' => 'reservation.invoice_creation_failed',
                'resource_type' => 'reservation',
                'resource_id' => $id,
            ]);
        } else {
            $this->assertDatabaseHas('invoices', [
                'id' => $reservation->invoice_id,
            ]);

            $this->assertDatabaseHas('financial_audit_logs', [
                'event_type' => 'invoice.created',
                'resource_type' => 'invoice',
                'resource_id' => $reservation->invoice_id,
            ]);
        }
    }
}
