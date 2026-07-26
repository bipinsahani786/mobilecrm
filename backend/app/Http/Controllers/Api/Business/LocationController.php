<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\BaseController;
use App\Models\BusinessLocation;
use Illuminate\Http\Request;

class LocationController extends BaseController
{
    public function index()
    {
        try {
            $locations = BusinessLocation::orderBy('name')->get();
            return $this->success($locations, 'Locations retrieved');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius_meters' => 'nullable|integer|min:10|max:5000',
            'address' => 'nullable|string',
            'is_default' => 'nullable|boolean',
        ]);

        try {
            $business = request()->attributes->get('business');
            if ($business) {
                $plan = $business->plan;
                $maxLocations = $plan->features['max_locations'] ?? 1;
                $currentLocationsCount = BusinessLocation::count();
                if ($currentLocationsCount >= $maxLocations) {
                    return response()->json([
                        'error' => 'plan_upgrade_required',
                        'feature' => 'max_locations',
                        'message' => "You have reached your plan's maximum limit of {$maxLocations} location(s)."
                    ], 403);
                }
            }

            $data = $request->only(['name', 'latitude', 'longitude', 'radius_meters', 'address', 'is_default']);

            // If setting as default, unset other defaults
            if (!empty($data['is_default'])) {
                BusinessLocation::where('is_default', true)->update(['is_default' => false]);
            }

            $location = BusinessLocation::create($data);
            return $this->success($location, 'Location created', 201);
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function update(Request $request, BusinessLocation $location)
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius_meters' => 'nullable|integer|min:10|max:5000',
            'address' => 'nullable|string',
            'is_default' => 'nullable|boolean',
        ]);

        try {
            if ($request->boolean('is_default')) {
                BusinessLocation::where('id', '!=', $location->id)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }

            $location->update($request->only(['name', 'latitude', 'longitude', 'radius_meters', 'address', 'is_default']));
            return $this->success($location->fresh(), 'Location updated');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function destroy(BusinessLocation $location)
    {
        try {
            $location->delete();
            return $this->success(null, 'Location deleted');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }
}
