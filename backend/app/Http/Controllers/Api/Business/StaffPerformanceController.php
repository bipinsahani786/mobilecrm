<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\Controller;
use App\Services\Business\StaffService;
use Illuminate\Http\Request;

class StaffPerformanceController extends Controller
{
    public function __construct(private StaffService $staffService) {}

    public function index(Request $request)
    {
        $fromDate = $request->query('from_date', now()->startOfMonth()->toDateString());
        $toDate = $request->query('to_date', now()->endOfMonth()->toDateString());

        try {
            $performance = $this->staffService->getPerformanceReport($fromDate, $toDate);
            return response()->json(['data' => $performance]);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
