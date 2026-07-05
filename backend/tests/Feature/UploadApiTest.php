<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can generate upload presigned url', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/v1/upload/presigned-url', [
        'extension' => 'png',
        'folder' => 'logos',
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonStructure([
            'success',
            'data' => [
                'upload_url',
                'path',
                'public_url',
            ]
        ]);
});
