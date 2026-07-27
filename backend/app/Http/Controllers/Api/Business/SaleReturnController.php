<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\BaseController;
use App\Services\Business\SaleReturnService;
use Illuminate\Http\Request;

class SaleReturnController extends BaseController
{
    public function __construct(protected SaleReturnService $saleReturnService) {}

    /**
     * List sale returns
     */
    public function index(Request $request)
    {
        $businessId = app('current_business_id');
        $returns = $this->saleReturnService->listReturns($businessId, $request->all());
        return $this->success($returns);
    }

    /**
     * Create a sale return (auto-approved)
     */
    public function store(Request $request)
    {
        $businessId = app('current_business_id');

        $validated = $request->validate([
            'sale_id' => 'required|exists:sales,id',
            'items' => 'required|array|min:1',
            'items.*.sale_item_id' => 'required|exists:sale_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'refund_type' => 'required|in:refund,credit_note',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
            'return_date' => 'nullable|date',
        ]);

        try {
            $saleReturn = $this->saleReturnService->createReturn($businessId, $validated);
            return $this->created(['sale_return' => $saleReturn], 'Sale return processed successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    /**
     * Show a single sale return
     */
    public function show(Request $request, $id)
    {
        $businessId = app('current_business_id');
        $saleReturn = $this->saleReturnService->getReturn($businessId, $id);
        return $this->success($saleReturn);
    }

    /**
     * Get returnable items for a sale
     */
    public function returnableItems(Request $request, $saleId)
    {
        $businessId = app('current_business_id');
        $data = $this->saleReturnService->getReturnableItems($businessId, $saleId);
        return $this->success($data);
    }
}
