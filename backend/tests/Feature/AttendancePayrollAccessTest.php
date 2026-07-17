<?php

use App\Models\User;
use App\Models\Business;
use App\Models\Attendance;
use App\Models\Payroll;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create the business
    $this->owner = User::factory()->create();
    $this->business = Business::create([
        'name' => 'Test Business',
        'owner_id' => $this->owner->id,
        'email' => 'biz@test.com',
        'status' => 'active',
    ]);

    // Set Spatie Team ID context
    setPermissionsTeamId($this->business->id);

    // Create roles
    $this->staffRole = Role::create(['name' => 'Staff', 'guard_name' => 'web']);
    $this->adminRole = Role::create(['name' => 'Business Admin', 'guard_name' => 'web']);

    // Create staff members
    $this->staffA = User::factory()->create();
    $this->staffB = User::factory()->create();

    // Attach staff to business
    $this->staffA->businesses()->attach($this->business->id);
    $this->staffB->businesses()->attach($this->business->id);

    // Assign roles
    $this->staffA->assignRole($this->staffRole);
    $this->staffB->assignRole($this->staffRole);
    
    // Also associate pivot status active
    \DB::table('business_user')->where('user_id', $this->staffA->id)->update(['status' => 'active']);
    \DB::table('business_user')->where('user_id', $this->staffB->id)->update(['status' => 'active']);
});

test('staff member can only list their own attendance', function () {
    // Create attendance records
    Attendance::create([
        'business_id' => $this->business->id,
        'user_id' => $this->staffA->id,
        'date' => '2026-07-01',
        'status' => 'present',
    ]);
    Attendance::create([
        'business_id' => $this->business->id,
        'user_id' => $this->staffB->id,
        'date' => '2026-07-01',
        'status' => 'present',
    ]);

    $response = $this->actingAs($this->staffA)
        ->withHeader('X-Tenant-ID', $this->business->id)
        ->getJson('/api/v1/business/attendance');

    $response->assertOk();
    $data = $response->json('data.data');

    // Should only contain 1 record
    expect($data)->toHaveCount(1);
    expect($data[0]['user_id'])->toBe($this->staffA->id);
});

test('staff member cannot approve attendance', function () {
    $att = Attendance::create([
        'business_id' => $this->business->id,
        'user_id' => $this->staffA->id,
        'date' => '2026-07-01',
        'status' => 'present',
    ]);

    $response = $this->actingAs($this->staffA)
        ->withHeader('X-Tenant-ID', $this->business->id)
        ->putJson("/api/v1/business/attendance/{$att->id}/approve");

    $response->assertStatus(403);
});

test('staff member can only view their own payroll records', function () {
    $payrollA = Payroll::create([
        'business_id' => $this->business->id,
        'user_id' => $this->staffA->id,
        'month' => '2026-07',
        'total_days' => 31,
        'present_days' => 20,
        'absent_days' => 0,
        'half_days' => 0,
        'paid_leaves' => 0,
        'unpaid_leaves' => 0,
        'week_offs' => 0,
        'holidays' => 0,
        'base_salary' => 10000,
        'per_day_salary' => 322.58,
        'deduction' => 0,
        'total_commission' => 0,
        'bonus' => 0,
        'advance_deduction' => 0,
        'final_salary' => 10000,
        'status' => 'draft',
    ]);

    $payrollB = Payroll::create([
        'business_id' => $this->business->id,
        'user_id' => $this->staffB->id,
        'month' => '2026-07',
        'total_days' => 31,
        'present_days' => 20,
        'absent_days' => 0,
        'half_days' => 0,
        'paid_leaves' => 0,
        'unpaid_leaves' => 0,
        'week_offs' => 0,
        'holidays' => 0,
        'base_salary' => 12000,
        'per_day_salary' => 387.10,
        'deduction' => 0,
        'total_commission' => 0,
        'bonus' => 0,
        'advance_deduction' => 0,
        'final_salary' => 12000,
        'status' => 'draft',
    ]);

    // Test list endpoint
    $responseList = $this->actingAs($this->staffA)
        ->withHeader('X-Tenant-ID', $this->business->id)
        ->getJson('/api/v1/business/payroll');

    $responseList->assertOk();
    $listData = $responseList->json('data.data');
    expect($listData)->toHaveCount(1);
    expect($listData[0]['user_id'])->toBe($this->staffA->id);

    // Test detail endpoint - own record
    $responseDetailOwn = $this->actingAs($this->staffA)
        ->withHeader('X-Tenant-ID', $this->business->id)
        ->getJson("/api/v1/business/payroll/{$payrollA->id}");
    $responseDetailOwn->assertOk();

    // Test detail endpoint - another record
    $responseDetailOther = $this->actingAs($this->staffA)
        ->withHeader('X-Tenant-ID', $this->business->id)
        ->getJson("/api/v1/business/payroll/{$payrollB->id}");
    $responseDetailOther->assertStatus(403);
});
