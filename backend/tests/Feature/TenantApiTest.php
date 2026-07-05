<?php

use App\Models\User;
use App\Models\Business;
use App\Models\Plan;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::create(['name' => 'Superadmin']);
    $this->superadmin = User::factory()->create();
    $this->superadmin->assignRole('Superadmin');
});

test('superadmin can list tenant businesses', function () {
    $owner = User::factory()->create();
    Business::create([
        'name' => 'Acme Corp',
        'owner_id' => $owner->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($this->superadmin)->getJson('/api/v1/superadmin/businesses');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonFragment(['name' => 'Acme Corp']);
});

test('superadmin can onboard tenant', function () {
    $plan = Plan::create([
        'name' => 'Onboarding Plan',
        'price_monthly' => 100.00,
        'price_yearly' => 1000.00,
        'features' => [],
    ]);

    $response = $this->actingAs($this->superadmin)->postJson('/api/v1/superadmin/businesses/onboard', [
        'owner_name' => 'John Tenant',
        'owner_email' => 'john.t@example.com',
        'owner_password' => 'secret_password_123',
        'owner_phone' => '1234567890',
        'business_name' => 'Acme New Store',
        'plan_id' => $plan->id,
    ]);

    $response->assertCreated()
        ->assertJsonPath('success', true);

    $this->assertDatabaseHas('users', ['email' => 'john.t@example.com']);
    $this->assertDatabaseHas('businesses', ['name' => 'Acme New Store']);
});

test('superadmin can update tenant details', function () {
    $owner = User::factory()->create();
    $business = Business::create([
        'name' => 'Old Acme Corp',
        'owner_id' => $owner->id,
    ]);

    $response = $this->actingAs($this->superadmin)->patchJson("/api/v1/superadmin/businesses/{$business->id}", [
        'name' => 'Updated Acme Corp',
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true);

    $this->assertDatabaseHas('businesses', [
        'id' => $business->id,
        'name' => 'Updated Acme Corp',
    ]);
});

test('superadmin can update tenant status to suspended', function () {
    $owner = User::factory()->create();
    $business = Business::create([
        'name' => 'Acme Corp',
        'owner_id' => $owner->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($this->superadmin)->patchJson("/api/v1/superadmin/businesses/{$business->id}/status", [
        'status' => 'suspended',
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true);

    $this->assertEquals('suspended', $business->fresh()->status);
});

test('superadmin can reset owner password', function () {
    $owner = User::factory()->create([
        'password' => bcrypt('old_password'),
    ]);
    $business = Business::create([
        'name' => 'Acme Corp',
        'owner_id' => $owner->id,
    ]);

    $response = $this->actingAs($this->superadmin)->patchJson("/api/v1/superadmin/businesses/{$business->id}/password", [
        'new_password' => 'super_new_password_123',
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true);

    $this->assertTrue(\Illuminate\Support\Facades\Hash::check('super_new_password_123', $owner->fresh()->password));
});
