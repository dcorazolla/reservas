<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\CancellationPolicy;
use App\Models\CancellationRefundRule;
use App\Models\User;
use Carbon\Carbon;
use Tests\TestCase;

class CancellationPolicyTest extends TestCase
{
    private Property $property;

    protected function setUp(): void
    {
        parent::setUp();

        $this->property = Property::create([
            'name' => 'Test Property',
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

    public function test_create_cancellation_policy()
    {
        $policy = CancellationPolicy::create([
            'property_id' => $this->property->id,
            'name' => 'Test Policy',
            'description' => 'This is a test policy',
            'type' => 'fixed_timeline',
            'config' => ['key' => 'value'],
            'active' => true,
            'applies_from' => now()->toDateString(),
        ]);

        $this->assertNotNull($policy->id);
        $this->assertEquals($this->property->id, $policy->property_id);
        $this->assertEquals('Test Policy', $policy->name);
        $this->assertEquals('fixed_timeline', $policy->type);
    }

    public function test_policy_belongs_to_property()
    {
        $policy = CancellationPolicy::create([
            'property_id' => $this->property->id,
            'name' => 'Relation Test',
            'type' => 'fixed_timeline',
            'active' => true,
            'applies_from' => now()->toDateString(),
        ]);

        $this->assertEquals($this->property->id, $policy->property()->first()->id);
    }

    public function test_policy_has_many_rules()
    {
        $policy = CancellationPolicy::create([
            'property_id' => $this->property->id,
            'name' => 'Rules Test',
            'type' => 'percentage_cascade',
            'active' => true,
            'applies_from' => now()->toDateString(),
        ]);

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

        $this->assertEquals(2, $policy->rules()->count());
    }

    public function test_policy_active_scope()
    {
        $policy = CancellationPolicy::create([
            'property_id' => $this->property->id,
            'name' => 'Active Policy',
            'type' => 'fixed_timeline',
            'active' => true,
            'applies_from' => now()->toDateString(),
        ]);

        $activePolicies = CancellationPolicy::active()->get();

        $this->assertGreaterThan(0, $activePolicies->count());
        $this->assertTrue($activePolicies->first()->active);
    }

    public function test_policy_config_casting()
    {
        $config = ['rule_type' => 'fixed', 'percentage' => 50];

        $policy = CancellationPolicy::create([
            'property_id' => $this->property->id,
            'name' => 'Config Test',
            'type' => 'fixed_timeline',
            'config' => $config,
            'active' => true,
            'applies_from' => now()->toDateString(),
        ]);

        $policy->refresh();

        $this->assertIsArray($policy->config);
        $this->assertEquals('fixed', $policy->config['rule_type']);
        $this->assertEquals(50, $policy->config['percentage']);
    }

    public function test_policy_applies_from_date_casting()
    {
        $dateString = '2026-03-15';

        $policy = CancellationPolicy::create([
            'property_id' => $this->property->id,
            'name' => 'Date Test',
            'type' => 'fixed_timeline',
            'applies_from' => $dateString,
            'active' => true,
        ]);

        $policy->refresh();

        $this->assertInstanceOf(Carbon::class, $policy->applies_from);
        $this->assertEquals('2026-03-15', $policy->applies_from->toDateString());
    }

    public function test_policy_created_by_relationship()
    {
        $user = User::factory()->create(['property_id' => $this->property->id]);

        $policy = CancellationPolicy::create([
            'property_id' => $this->property->id,
            'name' => 'Created By Test',
            'type' => 'fixed_timeline',
            'created_by_id' => $user->id,
            'active' => true,
            'applies_from' => now()->toDateString(),
        ]);

        $this->assertEquals($user->id, $policy->createdBy()->first()->id);
    }

    public function test_refund_rule_creation()
    {
        $policy = CancellationPolicy::create([
            'property_id' => $this->property->id,
            'name' => 'Rule Test',
            'type' => 'percentage_cascade',
            'active' => true,
            'applies_from' => now()->toDateString(),
        ]);

        $rule = $policy->rules()->create([
            'days_before_checkin_min' => 7,
            'days_before_checkin_max' => 999,
            'refund_percent' => 100,
            'penalty_type' => 'fixed',
            'penalty_amount' => 0,
            'label' => 'Free cancellation',
            'priority' => 1,
        ]);

        $this->assertInstanceOf(CancellationRefundRule::class, $rule);
        $this->assertEquals(100, $rule->refund_percent);
        $this->assertEquals('Free cancellation', $rule->label);
        $this->assertEquals($policy->id, $rule->policy_id);
    }

    public function test_policy_fillable_attributes()
    {
        $attributes = [
            'property_id' => $this->property->id,
            'name' => 'Fillable Test',
            'description' => 'Test description',
            'type' => 'fixed_timeline',
            'config' => ['test' => true],
            'active' => true,
            'applies_from' => now()->toDateString(),
            'applies_to' => now()->addMonth()->toDateString(),
        ];

        $policy = CancellationPolicy::create($attributes);

        $this->assertEquals('Fillable Test', $policy->name);
        $this->assertEquals('Test description', $policy->description);
        $this->assertEquals('fixed_timeline', $policy->type);
    }
}
