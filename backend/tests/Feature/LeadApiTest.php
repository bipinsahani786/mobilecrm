<?php

use App\Models\User;
use App\Models\Partner;
use App\Models\Lead;
use App\Models\LeadContact;
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
});

test('superadmin can list partner leads', function () {
    Lead::create([
        'partner_id' => $this->partner->id,
        'business_name' => 'Store Acme',
        'contact_person' => 'Acme Contact',
        'phone' => '1234567890',
        'status' => 'new',
    ]);

    $response = $this->actingAs($this->superadmin)->getJson('/api/v1/superadmin/leads');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonFragment(['business_name' => 'Store Acme']);
});

test('superadmin can view lead stats summary', function () {
    Lead::create([
        'partner_id' => $this->partner->id,
        'business_name' => 'Store Acme',
        'contact_person' => 'Acme Contact',
        'phone' => '1234567890',
        'status' => 'new',
    ]);

    $response = $this->actingAs($this->superadmin)->getJson('/api/v1/superadmin/leads/stats');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.total', 1)
        ->assertJsonPath('data.newCount', 1);
});

test('superadmin can create lead', function () {
    $response = $this->actingAs($this->superadmin)->postJson('/api/v1/superadmin/leads', [
        'partner_id' => $this->partner->id,
        'business_name' => 'Beta Shop',
        'contact_person' => 'Beta Contact',
        'phone' => '9876543210',
        'status' => 'new',
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true);

    $this->assertDatabaseHas('leads', [
        'business_name' => 'Beta Shop',
        'partner_id' => $this->partner->id,
    ]);
});

test('superadmin can update lead details', function () {
    $lead = Lead::create([
        'partner_id' => $this->partner->id,
        'business_name' => 'Store Acme',
        'contact_person' => 'Acme Contact',
        'status' => 'new',
    ]);

    $response = $this->actingAs($this->superadmin)->patchJson("/api/v1/superadmin/leads/{$lead->id}", [
        'business_name' => 'Updated Acme Store',
        'status' => 'contacted',
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true);

    $this->assertDatabaseHas('leads', [
        'id' => $lead->id,
        'business_name' => 'Updated Acme Store',
        'status' => 'contacted',
    ]);
});

test('superadmin can delete lead', function () {
    $lead = Lead::create([
        'partner_id' => $this->partner->id,
        'business_name' => 'Store Acme',
        'contact_person' => 'Acme Contact',
        'status' => 'new',
    ]);

    $response = $this->actingAs($this->superadmin)->deleteJson("/api/v1/superadmin/leads/{$lead->id}");

    $response->assertOk()
        ->assertJsonPath('success', true);

    // Assert soft deleted
    $this->assertNotNull($lead->fresh()->deleted_at);
});

test('superadmin can list lead contact logs', function () {
    $lead = Lead::create([
        'partner_id' => $this->partner->id,
        'business_name' => 'Store Acme',
        'contact_person' => 'Acme Contact',
        'status' => 'new',
    ]);

    LeadContact::create([
        'lead_id' => $lead->id,
        'contacted_by' => 'Superadmin',
        'contacted_at' => now(),
        'outcome' => 'called',
        'notes' => 'Called client',
    ]);

    $response = $this->actingAs($this->superadmin)->getJson("/api/v1/superadmin/leads/{$lead->id}/contacts");

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonFragment(['notes' => 'Called client']);
});

test('superadmin can log lead contact', function () {
    $lead = Lead::create([
        'partner_id' => $this->partner->id,
        'business_name' => 'Store Acme',
        'contact_person' => 'Acme Contact',
        'status' => 'new',
    ]);

    $response = $this->actingAs($this->superadmin)->postJson("/api/v1/superadmin/leads/{$lead->id}/contacts", [
        'outcome' => 'whatsapp',
        'notes' => 'Sent introductory catalog',
        'contacted_at' => now()->toIso8601String(),
        'next_contact_at' => now()->addDays(2)->toIso8601String(),
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true);

    $this->assertDatabaseHas('lead_contacts', [
        'lead_id' => $lead->id,
        'outcome' => 'whatsapp',
        'notes' => 'Sent introductory catalog',
    ]);
});

test('superadmin can delete lead contact log', function () {
    $lead = Lead::create([
        'partner_id' => $this->partner->id,
        'business_name' => 'Store Acme',
        'contact_person' => 'Acme Contact',
        'status' => 'new',
    ]);

    $contact = LeadContact::create([
        'lead_id' => $lead->id,
        'contacted_by' => 'Superadmin',
        'contacted_at' => now(),
        'outcome' => 'called',
    ]);

    $response = $this->actingAs($this->superadmin)->deleteJson("/api/v1/superadmin/leads/{$lead->id}/contacts/{$contact->id}");

    $response->assertOk()
        ->assertJsonPath('success', true);

    // Assert soft deleted
    $this->assertNotNull($contact->fresh()->deleted_at);
});
