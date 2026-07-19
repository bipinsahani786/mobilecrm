<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class LeaveRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = LeaveRequest::with(['user', 'approvedBy'])->orderBy('created_at', 'desc');

        // If the user is just a regular staff member, only show their own leave requests
        $user = $request->user();
        $isManager = $user->hasRole(['admin', 'manager', 'Business Admin', 'Superadmin']);
        
        if (!$isManager) {
            $query->where('user_id', $user->id);
        } else if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'leave_type' => 'required|string',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'reason' => 'required|string',
        ]);

        $leave = LeaveRequest::create([
            'user_id' => $request->user()->id,
            'leave_type' => $validated['leave_type'],
            'from_date' => $validated['from_date'],
            'to_date' => $validated['to_date'],
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Leave request submitted successfully.',
            'data' => $leave->load('user')
        ]);
    }

    public function show(LeaveRequest $leaveRequest)
    {
        return response()->json([
            'success' => true,
            'data' => $leaveRequest->load(['user', 'approvedBy'])
        ]);
    }

    public function update(Request $request, LeaveRequest $leaveRequest)
    {
        // Only allow updating if status is pending
        if ($leaveRequest->status !== 'pending') {
            return response()->json(['message' => 'Cannot update a processed request.'], 403);
        }

        // Users can only update their own requests
        if ($request->user()->id !== $leaveRequest->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'leave_type' => 'sometimes|string',
            'from_date' => 'sometimes|date',
            'to_date' => 'sometimes|date|after_or_equal:from_date',
            'reason' => 'sometimes|string',
        ]);

        $leaveRequest->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Leave request updated.',
            'data' => $leaveRequest
        ]);
    }

    public function destroy(Request $request, LeaveRequest $leaveRequest)
    {
        // Only allow deleting if status is pending and belongs to user
        if ($leaveRequest->status !== 'pending' || $request->user()->id !== $leaveRequest->user_id) {
            return response()->json(['message' => 'Cannot delete this request.'], 403);
        }

        $leaveRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Leave request cancelled.'
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $user = $request->user();
        $isManager = $user->hasRole(['admin', 'manager', 'Business Admin', 'Superadmin']);

        if (!$isManager) {
            return response()->json(['message' => 'Unauthorized. Only managers can approve leaves.'], 403);
        }

        $leaveRequest = LeaveRequest::findOrFail($id);
        
        $leaveRequest->update([
            'status' => $validated['status'],
            'approved_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Leave status updated successfully.',
            'data' => $leaveRequest->load(['user', 'approvedBy'])
        ]);
    }
}
