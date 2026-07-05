<?php

use App\Models\User;
use App\Models\Partner;
use App\Models\Lead;
use App\Models\Business;
use App\Models\Plan;
use App\Models\Commission;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('superadmin can retrieve partner analytics', function () {
    // Seed Spatie roles
    Role::create(['name' => 'Superadmin']);

    $superadmin = User::create([
        'name' => 'Super Admin',
        'email' => 'superadmin@example.com',
        'password' => bcrypt('password123'),
    ]);
    $superadmin->assignRole('Superadmin');

    // Create a plan
    $plan = Plan::create([
        'name' => 'Gold Plan',
        'price_monthly' => 1000.00,
        'price_yearly' => 10000.00,
        'features' => ['billing' => true],
    ]);

    // Create a partner
    $partner = Partner::create([
        'name' => 'Test Sales Agent',
        'email' => 'agent@example.com',
        'referral_code' => 'TESTCODE',
        'commission_type' => 'percentage',
        'commission_value' => 10,
        'status' => true,
    ]);

    // Create leads
    Lead::create([
        'partner_id' => $partner->id,
        'business_name' => 'Lead Store 1',
        'contact_person' => 'Lead Contact 1',
        'status' => 'new',
    ]);
    Lead::create([
        'partner_id' => $partner->id,
        'business_name' => 'Lead Store 2',
        'contact_person' => 'Lead Contact 2',
        'status' => 'converted',
    ]);

    // Create a referred business
    $owner = User::create([
        'name' => 'Store Owner',
        'email' => 'owner@example.com',
        'password' => bcrypt('password123'),
    ]);
    $business = Business::create([
        'name' => 'Referred Store',
        'email' => 'store@example.com',
        'phone' => '1234567890',
        'owner_id' => $owner->id,
        'status' => true,
        'partner_id' => $partner->id,
        'plan_id' => $plan->id,
    ]);

    // Create commissions
    Commission::create([
        'partner_id' => $partner->id,
        'business_id' => $business->id,
        'plan_id' => $plan->id,
        'amount_paid_by_tenant' => 10000.00,
        'commission_amount' => 1000.00,
        'status' => 'pending',
    ]);

    Commission::create([
        'partner_id' => $partner->id,
        'business_id' => $business->id,
        'plan_id' => $plan->id,
        'amount_paid_by_tenant' => 5000.00,
        'commission_amount' => 500.00,
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $response = $this
        ->actingAs($superadmin)
        ->getJson("/api/v1/superadmin/partners/{$partner->id}/analytics");

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.metrics.total_leads', 2)
        ->assertJsonPath('data.metrics.converted_leads', 1)
        ->assertJsonPath('data.metrics.conversion_rate', 50)
        ->assertJsonPath('data.metrics.total_businesses', 1)
        ->assertJsonPath('data.metrics.total_referred_revenue', 15000)
        ->assertJsonPath('data.metrics.total_commission_earned', 1500)
        ->assertJsonPath('data.metrics.paid_commission', 500)
        ->assertJsonPath('data.metrics.pending_commission', 1000);
});
