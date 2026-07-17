<?php

namespace App\Services\Business;

use App\Models\Attendance;
use App\Models\BusinessLocation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AttendanceService
{
    /**
     * Check in an employee.
     */
    public function checkIn(array $data): Attendance
    {
        $businessId = app('current_business_id');
        $userId = auth()->id();
        $today = now()->toDateString();

        // Check if already checked in today
        $existing = Attendance::where('user_id', $userId)
            ->where('date', $today)
            ->first();

        if ($existing && $existing->check_in_time) {
            throw new \Exception('You have already checked in today.');
        }

        // Validate geo-fence
        $isWithinFence = false;
        $locationId = null;

        if (isset($data['latitude']) && isset($data['longitude'])) {
            $location = BusinessLocation::where('is_default', true)->first();
            if ($location) {
                $isWithinFence = $location->isWithinFence($data['latitude'], $data['longitude']);
                $locationId = $location->id;
            } else {
                throw new \Exception('Business location is not configured. Please ask the administrator to configure shop location first.');
            }
        }

        if (!$isWithinFence) {
            throw new \Exception('You are outside the shop\'s allowed geofence radius. Please mark attendance from the shop.');
        }

        $photoPath = $data['photo'] ?? null;

        $ownerId = \Illuminate\Support\Facades\DB::table('businesses')->where('id', $businessId)->value('owner_id');

        if ($existing) {
            // Update existing record (maybe manually created by owner)
            $existing->update([
                'status' => 'present',
                'check_in_time' => now()->toTimeString(),
                'check_in_photo' => $photoPath,
                'check_in_latitude' => $data['latitude'] ?? null,
                'check_in_longitude' => $data['longitude'] ?? null,
                'is_within_geofence' => $isWithinFence,
                'location_id' => $locationId,
                'approved_by' => $isWithinFence ? $ownerId : null,
            ]);
            return $existing->fresh();
        }

        return Attendance::create([
            'business_id' => $businessId,
            'user_id' => $userId,
            'date' => $today,
            'status' => 'present',
            'check_in_time' => now()->toTimeString(),
            'check_in_photo' => $photoPath,
            'check_in_latitude' => $data['latitude'] ?? null,
            'check_in_longitude' => $data['longitude'] ?? null,
            'is_within_geofence' => $isWithinFence,
            'location_id' => $locationId,
            'approved_by' => $isWithinFence ? $ownerId : null,
        ]);
    }

    /**
     * Check out an employee.
     */
    public function checkOut(array $data): Attendance
    {
        $userId = auth()->id();
        $today = now()->toDateString();

        $attendance = Attendance::where('user_id', $userId)
            ->where('date', $today)
            ->first();

        if (!$attendance || !$attendance->check_in_time) {
            throw new \Exception('You need to check in first.');
        }

        if ($attendance->check_out_time) {
            throw new \Exception('You have already checked out today.');
        }

        // Validate geo-fence
        $isWithinFence = false;
        if (isset($data['latitude']) && isset($data['longitude'])) {
            $location = BusinessLocation::where('is_default', true)->first();
            if ($location) {
                $isWithinFence = $location->isWithinFence($data['latitude'], $data['longitude']);
            } else {
                throw new \Exception('Business location is not configured. Please ask the administrator to configure shop location first.');
            }
        }

        if (!$isWithinFence) {
            throw new \Exception('You are outside the shop\'s allowed geofence radius. Please mark attendance from the shop.');
        }

        $photoPath = $data['photo'] ?? null;

        $attendance->update([
            'check_out_time' => now()->toTimeString(),
            'check_out_photo' => $photoPath,
            'check_out_latitude' => $data['latitude'] ?? null,
            'check_out_longitude' => $data['longitude'] ?? null,
        ]);

        return $attendance->fresh();
    }

    /**
     * Manually mark attendance (by owner).
     */
    public function markAttendance(array $data): Attendance
    {
        $businessId = app('current_business_id');

        return Attendance::updateOrCreate(
            [
                'business_id' => $businessId,
                'user_id' => $data['user_id'],
                'date' => $data['date'],
            ],
            [
                'status' => $data['status'],
                'notes' => $data['notes'] ?? null,
                'approved_by' => auth()->id(),
            ]
        );
    }

    /**
     * Import attendance records in bulk.
     */
    public function importAttendance(array $records): void
    {
        $businessId = app('current_business_id');
        $approvedBy = auth()->id();

        foreach ($records as $record) {
            if ($record['status'] === 'clear') {
                Attendance::where([
                    'business_id' => $businessId,
                    'user_id' => $record['user_id'],
                    'date' => $record['date'],
                ])->delete();
            } else {
                Attendance::updateOrCreate(
                    [
                        'business_id' => $businessId,
                        'user_id' => $record['user_id'],
                        'date' => $record['date'],
                    ],
                    [
                        'status' => $record['status'],
                        'check_in_time' => $record['check_in_time'] ?? null,
                        'check_out_time' => $record['check_out_time'] ?? null,
                        'notes' => $record['notes'] ?? null,
                        'approved_by' => $approvedBy,
                    ]
                );
            }
        }
    }

    /**
     * Get attendance list with filters.
     */
    public function getAttendance(array $filters = [])
    {
        $query = Attendance::with(['user', 'location'])
            ->orderByDesc('date');

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['date'])) {
            $query->where('date', $filters['date']);
        }

        if (!empty($filters['from_date']) && !empty($filters['to_date'])) {
            $query->whereBetween('date', [$filters['from_date'], $filters['to_date']]);
        }

        if (!empty($filters['month'])) {
            // "2026-07" format
            $parts = explode('-', $filters['month']);
            if (count($parts) === 2) {
                $query->whereYear('date', $parts[0])
                      ->whereMonth('date', $parts[1]);
            }
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $perPage = $filters['per_page'] ?? 31;
        return $query->paginate($perPage);
    }

    /**
     * Get monthly attendance summary for staff.
     */
    public function getMonthlyReport(string $month, ?int $userId = null): array
    {
        $businessId = app('current_business_id');

        $staffQuery = DB::table('business_user')
            ->join('users', 'business_user.user_id', '=', 'users.id')
            ->where('business_user.business_id', $businessId)
            ->where('business_user.status', 'active')
            ->whereNull('users.deleted_at')
            ->select('users.id', 'users.name');

        if ($userId !== null) {
            $staffQuery->where('users.id', $userId);
        }

        $staff = $staffQuery->get();

        $report = [];

        foreach ($staff as $member) {
            $parts = explode('-', $month);
            $attendanceQuery = Attendance::where('user_id', $member->id);
            if (count($parts) === 2) {
                $attendanceQuery->whereYear('date', $parts[0])
                                 ->whereMonth('date', $parts[1]);
            }
            $attendances = $attendanceQuery->get();

            $report[] = [
                'user_id' => $member->id,
                'name' => $member->name,
                'present' => $attendances->where('status', 'present')->count(),
                'absent' => $attendances->where('status', 'absent')->count(),
                'half_day' => $attendances->where('status', 'half_day')->count(),
                'leave' => $attendances->where('status', 'leave')->count(),
                'week_off' => $attendances->where('status', 'week_off')->count(),
                'holiday' => $attendances->where('status', 'holiday')->count(),
                'total_records' => $attendances->count(),
            ];
        }

        return $report;
    }

    /**
     * Get today's attendance status for the logged-in user.
     */
    public function getTodayStatus(): ?Attendance
    {
        return Attendance::where('user_id', auth()->id())
            ->where('date', now()->toDateString())
            ->first();
    }

    /**
     * Approve an attendance record.
     */
    public function approveAttendance(int $id): Attendance
    {
        $attendance = Attendance::findOrFail($id);
        
        $attendance->update([
            'approved_by' => auth()->id(),
        ]);

        return $attendance->fresh();
    }

    /**
     * Unapprove an attendance record.
     */
    public function unapproveAttendance(int $id): Attendance
    {
        $attendance = Attendance::findOrFail($id);
        
        $attendance->update([
            'approved_by' => null,
        ]);

        return $attendance->fresh();
    }
}
