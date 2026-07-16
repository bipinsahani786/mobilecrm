<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\BaseController;
use App\Services\Business\AttendanceService;
use Illuminate\Http\Request;

class AttendanceController extends BaseController
{
    public function __construct(private AttendanceService $attendanceService) {}

    public function index(Request $request)
    {
        try {
            $attendances = $this->attendanceService->getAttendance($request->all());
            return $this->success($attendances, 'Attendance retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function import(Request $request)
    {
        $user = $request->user();
        if (!$user->hasRole(['Business Admin', 'admin', 'manager'])) {
            return $this->error('Unauthorized to import attendance', 403);
        }

        $request->validate([
            'records' => 'required|array',
            'records.*.user_id' => 'required|integer|exists:users,id',
            'records.*.date' => 'required|date',
            'records.*.status' => 'required|in:present,absent,half_day,leave,week_off,holiday',
            'records.*.check_in_time' => 'nullable|date_format:H:i:s,H:i',
            'records.*.check_out_time' => 'nullable|date_format:H:i:s,H:i',
            'records.*.notes' => 'nullable|string',
        ]);

        try {
            $this->attendanceService->importAttendance($request->input('records'));
            return $this->success(null, 'Attendance imported successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function checkIn(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'photo' => 'required|string',
        ]);

        try {
            $attendance = $this->attendanceService->checkIn($request->all());
            return $this->success($attendance, 'Checked in successfully', 201);
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function checkOut(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'photo' => 'required|string',
        ]);

        try {
            $attendance = $this->attendanceService->checkOut($request->all());
            return $this->success($attendance, 'Checked out successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function markManual(Request $request)
    {
        $user = $request->user();
        if (!$user->hasRole(['Business Admin', 'admin', 'manager'])) {
            return $this->error('Unauthorized to manually mark attendance', 403);
        }

        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent,half_day,leave,week_off,holiday',
            'notes' => 'nullable|string',
        ]);

        try {
            $attendance = $this->attendanceService->markAttendance($request->all());
            return $this->success($attendance, 'Attendance marked successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function monthlyReport(Request $request)
    {
        $request->validate([
            'month' => 'required|date_format:Y-m',
        ]);

        try {
            $report = $this->attendanceService->getMonthlyReport($request->input('month'));
            return $this->success($report, 'Monthly report retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function todayStatus()
    {
        try {
            $status = $this->attendanceService->getTodayStatus();
            return $this->success($status, 'Today status retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function approve(int $id)
    {
        try {
            $attendance = $this->attendanceService->approveAttendance($id);
            return $this->success($attendance, 'Attendance approved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function unapprove(int $id)
    {
        try {
            $attendance = $this->attendanceService->unapproveAttendance($id);
            return $this->success($attendance, 'Attendance unapproved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }
}
