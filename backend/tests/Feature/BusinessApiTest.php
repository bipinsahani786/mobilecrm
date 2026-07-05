<?php

use App\Models\User;
use App\Models\Business;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user can list their businesses', function () {
    $user = User::factory()->create();
    $business = Business::create([
        'name' => 'My First Store',
        'owner_id' => $user->id,
        'email' => 'store@example.com',
    ]);

    $response = $this->actingAs($user)->getJson('/api/v1/businesses');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonFragment(['name' => 'My First Store']);
});

test('user can create a business', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/v1/businesses', [
        'name' => 'New Business Store',
        'email' => 'newstore@example.com',
        'phone' => '1234567890',
        'address' => '123 Main Street',
    ]);

    $response->assertCreated()
        ->assertJsonPath('success', true);

    $this->assertDatabaseHas('businesses', [
        'name' => 'New Business Store',
        'owner_id' => $user->id,
    ]);
});

test('user can view their business details', function () {
    $user = User::factory()->create();
    $business = Business::create([
        'name' => 'My First Store',
        'owner_id' => $user->id,
        'email' => 'store@example.com',
    ]);

    $response = $this->actingAs($user)->getJson("/api/v1/businesses/{$business->id}");

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.name', 'My First Store');
});

test('user can update their business details', function () {
    $user = User::factory()->create();
    $business = Business::create([
        'name' => 'My First Store',
        'owner_id' => $user->id,
        'email' => 'store@example.com',
    ]);

    $response = $this->actingAs($user)->putJson("/api/v1/businesses/{$business->id}", [
        'name' => 'Updated Store Name',
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true);

    $this->assertDatabaseHas('businesses', [
        'id' => $business->id,
        'name' => 'Updated Store Name',
    ]);
});

test('user can delete their business', function () {
    $user = User::factory()->create();
    $business = Business::create([
        'name' => 'My First Store',
        'owner_id' => $user->id,
        'email' => 'store@example.com',
    ]);

    $response = $this->actingAs($user)->deleteJson("/api/v1/businesses/{$business->id}");

    $response->assertOk()
        ->assertJsonPath('success', true);

    // Assert soft deleted
    $this->assertNotNull($business->fresh()->deleted_at);
});
