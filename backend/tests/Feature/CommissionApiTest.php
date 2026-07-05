<?php

use App\Models\User;
use App\Models\Partner;
use App\Models\Business;
use App\Models\Plan;
use App\Models\Commission;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::create(['name' => 'Superadmin']);
    $this->superadmin = User::factory()->create();
    $this->superadmin->assignRole('Superadmin');

    $this->partner = Partner::create([
        'name' => 'Agent X',
        'email' => 'agentx@example.com',
        'referral_code' => 'AGENTX',
        'commission_type' => 'percentage',
        'commission_value' => 10,
    ]);

    $owner = User::factory()->create();
    $this->business = Business::create([
        'name' => 'Acme store',
        'owner_id' => $owner->id,
    ]);

    $this->plan = Plan::create([
        'name' => 'Advanced Plan',
        'price_monthly' => 500,
        'price_yearly' => 5000,
        'features' => [],
    ]);
});

test('superadmin can list partner commissions', function () {
    Commission::create([
        'partner_id' => $this->partner->id,
        'business_id' => $this->business->id,
        'plan_id' => $this->plan->id,
        'amount_paid_by_tenant' => 1000,
        'commission_amount' => 100,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($this->superadmin)->getJson('/api/v1/superadmin/commissions');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonFragment(['commission_amount' => '100.00']);
});

test('superadmin can view commission details', function () {
    $commission = Commission::create([
        'partner_id' => $this->partner->id,
        'business_id' => $this->business->id,
        'plan_id' => $this->plan->id,
        'amount_paid_by_tenant' => 1000,
        'commission_amount' => 100,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($this->superadmin)->getJson("/api/v1/superadmin/commissions/{$commission->id}");

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.commission_amount', '100.00');
});

test('superadmin can mark commission as paid', function () {
    $commission = Commission::create([
        'partner_id' => $this->partner->id,
        'business_id' => $this->business->id,
        'plan_id' => $this->plan->id,
        'amount_paid_by_tenant' => 1000,
        'commission_amount' => 100,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($this->superadmin)->patchJson("/api/v1/superadmin/commissions/{$commission->id}/mark-paid");

    $response->assertOk()
        ->assertJsonPath('success', true);

    $this->assertEquals('paid', $commission->fresh()->status);
    $this->assertNotNull($commission->fresh()->paid_at);
});
