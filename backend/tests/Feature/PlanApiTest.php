<?php

use App\Models\User;
use App\Models\Plan;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::create(['name' => 'Superadmin']);
    $this->superadmin = User::factory()->create();
    $this->superadmin->assignRole('Superadmin');
});

test('superadmin can list subscription plans', function () {
    Plan::create([
        'name' => 'Starter Plan',
        'price_monthly' => 199.00,
        'price_yearly' => 1999.00,
        'features' => ['invoicing'],
    ]);

    $response = $this->actingAs($this->superadmin)->getJson('/api/v1/superadmin/plans');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonFragment(['name' => 'Starter Plan']);
});

test('superadmin can create subscription plan', function () {
    $response = $this->actingAs($this->superadmin)->postJson('/api/v1/superadmin/plans', [
        'name' => 'Enterprise Plan',
        'description' => 'Unlimited features',
        'price_monthly' => 999.00,
        'price_yearly' => 9999.00,
        'features' => ['all'],
        'is_active' => true,
    ]);

    $response->assertCreated()
        ->assertJsonPath('success', true);

    $this->assertDatabaseHas('plans', [
        'name' => 'Enterprise Plan',
    ]);
});

test('superadmin can update subscription plan', function () {
    $plan = Plan::create([
        'name' => 'Standard Plan',
        'price_monthly' => 499.00,
        'price_yearly' => 4999.00,
        'features' => ['invoicing'],
    ]);

    $response = $this->actingAs($this->superadmin)->patchJson("/api/v1/superadmin/plans/{$plan->id}", [
        'name' => 'Advanced Plan',
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true);

    $this->assertDatabaseHas('plans', [
        'id' => $plan->id,
        'name' => 'Advanced Plan',
    ]);
});

test('superadmin can delete plan', function () {
    $plan = Plan::create([
        'name' => 'Standard Plan',
        'price_monthly' => 499.00,
        'price_yearly' => 4999.00,
        'features' => ['invoicing'],
    ]);

    $response = $this->actingAs($this->superadmin)->deleteJson("/api/v1/superadmin/plans/{$plan->id}");

    $response->assertOk()
        ->assertJsonPath('success', true);

    // Assert soft deleted
    $this->assertNotNull($plan->fresh()->deleted_at);
});
