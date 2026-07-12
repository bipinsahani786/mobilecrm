<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\BaseController;
use App\Models\PayrollComponent;
use Illuminate\Http\Request;

class PayrollComponentController extends BaseController
{
    public function index()
    {
        $businessId = app('current_business_id');
        $components = PayrollComponent::where('business_id', $businessId)->get();
        return $this->success($components, 'Payroll components retrieved successfully');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:earning,deduction',
        ]);

        $businessId = app('current_business_id');

        // Check for duplicates
        if (PayrollComponent::where('business_id', $businessId)->where('name', $request->name)->exists()) {
            return $this->error('A component with this name already exists.', 422);
        }

        $component = PayrollComponent::create([
            'business_id' => $businessId,
            'name' => $request->name,
            'type' => $request->type,
            'is_default' => false,
        ]);

        return $this->success($component, 'Component created successfully', 201);
    }

    public function show($id)
    {
        $businessId = app('current_business_id');
        $component = PayrollComponent::where('business_id', $businessId)->findOrFail($id);
        return $this->success($component, 'Component retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:earning,deduction',
        ]);

        $businessId = app('current_business_id');
        $component = PayrollComponent::where('business_id', $businessId)->findOrFail($id);

        if ($component->is_default) {
            return $this->error('Cannot update a default component.', 403);
        }

        // Check for duplicates
        if (PayrollComponent::where('business_id', $businessId)
            ->where('name', $request->name)
            ->where('id', '!=', $id)
            ->exists()) {
            return $this->error('A component with this name already exists.', 422);
        }

        $component->update([
            'name' => $request->name,
            'type' => $request->type,
        ]);

        return $this->success($component, 'Component updated successfully');
    }

    public function destroy($id)
    {
        $businessId = app('current_business_id');
        $component = PayrollComponent::where('business_id', $businessId)->findOrFail($id);

        if ($component->is_default) {
            return $this->error('Cannot delete a default component.', 403);
        }

        $component->delete();
        return $this->success(null, 'Component deleted successfully');
    }
}
