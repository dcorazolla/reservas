<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Room;
use App\Models\Reservation;
use App\Models\CancellationPolicy;
use App\Services\CancellationService;
use Carbon\Carbon;
use Tests\TestCase;

class CancellationServiceTest extends TestCase
{
    private CancellationService $service;

    public static function setUpBeforeClass(): void
    {
        parent::setUpBeforeClass();
        // Ensure migrations are run once before all tests
        // SQLite :memory: needs fresh migrate on each TestCase but we do it once per class
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(CancellationService::class);
    }

    // Helper: Create a property with all required fields
    private function createProperty(string $name = 'Test Property'): Property
    {
        return Property::create([
            'name' => $name,
            'timezone' => 'America/Sao_Paulo',
            'infant_max_age' => 2,
            'child_max_age' => 12,
            'child_factor' => 0.50,
            'base_one_adult' => 180.00,
            'base_two_adults' => 240.00,
            'additional_adult' => 80.00,
            'child_price' => 60.00,
        ]);
    }

    // Helper: Create a room for a property
    private function createRoom(Property $property, string $number = '101'): Room
    {
        return Room::create([
            'property_id' => $property->id,
            'number' => $number,
            'name' => 'Room ' . $number,
            'beds' => 1,
            'capacity' => 2,
            'active' => true,
        ]);
    }

    // Helper: Create a cancellation policy with rules
    private function createPolicy(Property $property, string $name = 'Default Policy'): CancellationPolicy
    {
        $policy = CancellationPolicy::create([
            'property_id' => $property->id,
            'name' => $name,
            'type' => 'fixed_timeline',
            'active' => true,
            'applies_from' => now()->subDays(1)->toDateString(),
            'applies_to' => null,
            'config' => [],
        ]);

        // Add standard rules
        $policy->rules()->create([
            'days_before_checkin_min' => 7,
            'days_before_checkin_max' => 999,
            'refund_percent' => 100,
            'priority' => 1,
        ]);

        $policy->rules()->create([
            'days_before_checkin_min' => 3,
            'days_before_checkin_max' => 6,
            'refund_percent' => 50,
            'priority' => 2,
        ]);

        $policy->rules()->create([
            'days_before_checkin_min' => 0,
            'days_before_checkin_max' => 2,
            'refund_percent' => 0,
            'priority' => 3,
        ]);

        return $policy;
    }

    public function test_policy_creation_works()
    {
        $property = $this->createProperty('PolicyCreationTest');
        $policy = $this->createPolicy($property);
        
        // Verify policy exists immediately after creation
        $found = \App\Models\CancellationPolicy::find($policy->id);
        $this->assertNotNull($found);
        $this->assertEquals($property->id, $found->property_id);
    }

    // Helper: Create a reservation
    private function createReservation(
        Property $property,
        Room $room,
        string $startDate,
        string $endDate,
        float $totalValue = 200.00,
        string $guestName = 'Test Guest'
    ): Reservation {
        // Note: property_id is NOT stored on reservations - it's accessed via room.property_id
        return Reservation::create([
            'room_id' => $room->id,
            'guest_name' => $guestName,
            'email' => strtolower(str_replace(' ', '_', $guestName)) . '@test.com',
            'room_id' => $room->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'adults_count' => 1,
            'children_count' => 0,
            'infants_count' => 0,
            'status' => 'confirmed',
            'price_per_day' => 100.00,
            'total_value' => $totalValue,
        ]);
    }

    public function test_calculate_refund_100_percent_when_7_days_before()
    {
        $property = $this->createProperty('Property 100');
        $room = $this->createRoom($property, '101');
        $policy = $this->createPolicy($property);

        $startDate = now()->addDays(10)->toDateString();
        $endDate = now()->addDays(12)->toDateString();
        $totalValue = 200.00;

        $reservation = $this->createReservation($property, $room, $startDate, $endDate, $totalValue, 'Guest 100');

        // DEBUG: Verify IDs - note: property_id is accessed via room relationship
        $this->assertEquals($property->id, $reservation->room->property_id, "Room should belong to property");
        $this->assertEquals($property->id, $policy->property_id, "Policy property_id should match");
        
        // DEBUG: Test each step
        $propertyId = $reservation->room->property_id;
        $all = \App\Models\CancellationPolicy::where('property_id', $propertyId)->get();
        $this->assertGreaterThan(0, $all->count(), "Should find policies for property: " . $propertyId);
        
        $active = \App\Models\CancellationPolicy::where('property_id', $propertyId)->active()->get();
        $this->assertGreaterThan(0, $active->count(), "Should find active policies");
        
        $applicable = \App\Models\CancellationPolicy::where('property_id', $propertyId)->active()->applicableAt(now()->toDateString())->get();
        $this->assertGreaterThan(0, $applicable->count(), "Should find applicable policies");

        $result = $this->service->calculateRefund($reservation);

        $this->assertEquals($totalValue, $result['refund_amount']);
        $this->assertEquals(100, $result['refund_percent']);
    }

    public function test_calculate_refund_50_percent_when_5_days_before()
    {
        $property = $this->createProperty('Property 50');
        $room = $this->createRoom($property, '102');
        $this->createPolicy($property);

        $startDate = now()->addDays(5)->toDateString();
        $endDate = now()->addDays(7)->toDateString();
        $totalValue = 200.00;

        $reservation = $this->createReservation($property, $room, $startDate, $endDate, $totalValue, 'Guest 50');

        $result = $this->service->calculateRefund($reservation);

        $this->assertEquals($totalValue * 0.5, $result['refund_amount']);
        $this->assertEquals(50, $result['refund_percent']);
    }

    public function test_calculate_refund_0_percent_when_less_than_3_days()
    {
        $property = $this->createProperty('Property 0');
        $room = $this->createRoom($property, '103');
        $this->createPolicy($property);

        $startDate = now()->addDays(2)->toDateString();
        $endDate = now()->addDays(3)->toDateString();
        $totalValue = 100.00;

        $reservation = $this->createReservation($property, $room, $startDate, $endDate, $totalValue, 'Guest 0');

        $result = $this->service->calculateRefund($reservation);

        $this->assertEquals(0, $result['refund_amount']);
        $this->assertEquals(0, $result['refund_percent']);
    }

    public function test_calculate_refund_uses_active_policy()
    {
        $property = $this->createProperty('Property Active');
        $room = $this->createRoom($property, '104');
        $policy = $this->createPolicy($property, 'Active Policy');

        $startDate = now()->addDays(5)->toDateString();
        $reservation = $this->createReservation($property, $room, $startDate, now()->addDays(6)->toDateString());

        $result = $this->service->calculateRefund($reservation);

        $this->assertNotNull($result['policy_id']);
        $this->assertEquals($policy->id, $result['policy_id']);
    }

    public function test_process_cancel_updates_reservation()
    {
        $property = $this->createProperty('Property Cancel');
        $room = $this->createRoom($property, '105');
        $this->createPolicy($property);

        $startDate = now()->addDays(5)->toDateString();
        $reservation = $this->createReservation($property, $room, $startDate, now()->addDays(7)->toDateString(), 200.00, 'Guest Cancel');

        $this->service->processCancel($reservation, 'Guest request');

        $reservation->refresh();

        $this->assertEquals('cancelled', $reservation->status);
        $this->assertNotNull($reservation->cancelled_at);
        $this->assertEquals('Guest request', $reservation->cancellation_reason);
    }

    public function test_process_cancel_creates_audit_log()
    {
        $property = $this->createProperty('Property Audit');
        $room = $this->createRoom($property, '106');
        $this->createPolicy($property);

        $startDate = now()->addDays(5)->toDateString();
        $reservation = $this->createReservation($property, $room, $startDate, now()->addDays(7)->toDateString(), 200.00, 'Guest Audit');

        $this->service->processCancel($reservation, 'System cancellation');

        $this->assertDatabaseHas('financial_audit_logs', [
            'resource_type' => 'Reservation',
            'resource_id' => $reservation->id,
            'event_type' => 'cancellation_processed',
        ]);
    }

    public function test_calculate_refund_returns_expected_structure()
    {
        $property = $this->createProperty('Property Struct');
        $room = $this->createRoom($property, '107');
        $this->createPolicy($property);

        $startDate = now()->addDays(10)->toDateString();
        $reservation = $this->createReservation($property, $room, $startDate, now()->addDays(12)->toDateString());

        $result = $this->service->calculateRefund($reservation);

        $this->assertArrayHasKey('refund_amount', $result);
        $this->assertArrayHasKey('refund_percent', $result);
        $this->assertArrayHasKey('retained_amount', $result);
        $this->assertArrayHasKey('reason', $result);
        $this->assertArrayHasKey('policy_id', $result);
    }

    public function test_refund_calculation_multiple_nights()
    {
        $property = $this->createProperty('Property MultiNight');
        $room = $this->createRoom($property, '108');
        $policy = $this->createPolicy($property);

        $startDate = now()->addDays(10)->toDateString();
        $endDate = now()->addDays(15)->toDateString();
        $totalValue = 500.00;

        $reservation = $this->createReservation($property, $room, $startDate, $endDate, $totalValue, 'Guest Multi');

        // Debug: verify data exists
        $this->assertNotNull($reservation->room);
        $this->assertNotNull($reservation->room->property_id);
        $this->assertEquals($property->id, $reservation->room->property_id);
        
        // Debug: verify policy exists
        $foundPolicy = CancellationPolicy::where('property_id', $property->id)->first();
        $this->assertNotNull($foundPolicy);
        
        $result = $this->service->calculateRefund($reservation);

        $this->assertEquals($totalValue, $result['refund_amount']);
    }
}
