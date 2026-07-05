<?php

use App\Models\User;
use App\Models\Partner;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::create(['name' => 'Superadmin']);
    $this->superadmin = User::factory()->create();
    $this->superadmin->assignRole('Superadmin');
});

test('superadmin can list sales partners', function () {
    Partner::create([
        'name' => 'Affiliate 1',
        'email' => 'affiliate1@example.com',
        'referral_code' => 'AFF1',
        'commission_type' => 'percentage',
        'commission_value' => 10.00,
        'status' => true,
    ]);

    $response = $this->actingAs($this->superadmin)->getJson('/api/v1/superadmin/partners');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonFragment(['name' => 'Affiliate 1']);
});

test('superadmin can create sales partner', function () {
    $response = $this->actingAs($this->superadmin)->postJson('/api/v1/superadmin/partners', [
        'name' => 'New Partner Agent',
        'email' => 'agentnew@example.com',
        'phone' => '1234567890',
        'company_name' => 'Agent Corp',
        'commission_type' => 'fixed',
        'commission_value' => 500.00,
        'is_recurring_commission' => false,
        'status' => true,
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true);

    $this->assertDatabaseHas('partners', [
        'name' => 'New Partner Agent',
        'email' => 'agentnew@example.com',
    ]);
});

test('superadmin can view partner details', function () {
    $partner = Partner::create([
        'name' => 'Partner Agent X',
        'email' => 'agentx@example.com',
        'referral_code' => 'AGENTX',
        'commission_type' => 'percentage',
        'commission_value' => 15.00,
    ]);

    $response = $this->actingAs($this->superadmin)->getJson("/api/v1/superadmin/partners/{$partner->id}");

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.name', 'Partner Agent X');
});

test('superadmin can update partner details', function () {
    $partner = Partner::create([
        'name' => 'Partner Agent X',
        'email' => 'agentx@example.com',
        'referral_code' => 'AGENTX',
        'commission_type' => 'percentage',
        'commission_value' => 15.00,
    ]);

    $response = $this->actingAs($this->superadmin)->patchJson("/api/v1/superadmin/partners/{$partner->id}", [
        'name' => 'Updated Agent Name',
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true);

    $this->assertDatabaseHas('partners', [
        'id' => $partner->id,
        'name' => 'Updated Agent Name',
    ]);
});

test('superadmin can delete partner', function () {
    $partner = Partner::create([
        'name' => 'Partner Agent X',
        'email' => 'agentx@example.com',
        'referral_code' => 'AGENTX',
        'commission_type' => 'percentage',
        'commission_value' => 15.00,
    ]);

    $response = $this->actingAs($this->superadmin)->deleteJson("/api/v1/superadmin/partners/{$partner->id}");

    $response->assertOk()
        ->assertJsonPath('success', true);

    // Assert soft deleted
    $this->assertNotNull($partner->fresh()->deleted_at);
});
