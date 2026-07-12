<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $businessId = app('current_business_id');
        $perPage = $request->query('per_page', 20);

        $query = ActivityLog::with('user:id,name,email')
            ->where('tenant_id', $businessId)
            ->orderBy('created_at', 'desc');

        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('model_type')) {
            $query->where('model_type', 'like', '%' . $request->model_type . '%');
        }

        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }
}
