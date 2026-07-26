<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\BaseController;
use App\Models\Quotation;
use App\Services\Business\QuotationService;
use Illuminate\Http\Request;

class QuotationController extends BaseController
{
    public function __construct(private QuotationService $quotationService)
    {
    }

    public function index(Request $request)
    {
        try {
            $filters = $request->only(['search', 'status', 'start_date', 'end_date']);
            $perPage = $request->input('per_page', 15);
            $paginator = $this->quotationService->getQuotations($filters, $perPage);

            return response()->json([
                'success' => true,
                'data' => $paginator->items(),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_batch_id' => 'nullable|exists:product_batches,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'round_off' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'valid_until' => 'nullable|date',
            'date' => 'nullable|date',
        ]);

        return $this->executeAction(function () use ($validated) {
            return $this->quotationService->createQuotation($validated);
        }, 'Quotation created successfully', 201);
    }

    public function show(Quotation $quotation)
    {
        $quotation->load(['customer', 'user', 'items.product.brand', 'items.product.category', 'items.batch', 'convertedSale']);
        return $this->success($quotation);
    }

    public function update(Request $request, Quotation $quotation)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'items' => 'nullable|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_batch_id' => 'nullable|exists:product_batches,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'round_off' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'valid_until' => 'nullable|date',
            'status' => 'nullable|string|in:draft,sent,accepted,rejected',
            'date' => 'nullable|date',
        ]);

        return $this->executeAction(function () use ($quotation, $validated) {
            return $this->quotationService->updateQuotation($quotation, $validated);
        }, 'Quotation updated successfully');
    }

    public function destroy(Quotation $quotation)
    {
        return $this->executeAction(function () use ($quotation) {
            $this->quotationService->deleteQuotation($quotation);
            return null;
        }, 'Quotation deleted successfully');
    }

    public function convertToBill(Quotation $quotation)
    {
        return $this->executeAction(function () use ($quotation) {
            return $this->quotationService->convertToBill($quotation);
        }, 'Quotation converted to bill successfully');
    }

    public function generatePdf(Request $request, Quotation $quotation)
    {
        $quotation->load(['customer', 'user', 'items.product', 'business']);

        $business = $quotation->business;
        $settings = $business->settings ?? [];

        $showHeader = $request->has('header') ? $request->query('header') === 'true' : true;
        $showFooter = $request->has('footer') ? $request->query('footer') === 'true' : true;

        $headerImage = $showHeader && !empty($settings['invoice_header_image']) ? $settings['invoice_header_image'] : null;
        $footerImage = $showFooter && !empty($settings['invoice_footer_image']) ? $settings['invoice_footer_image'] : null;

        \Illuminate\Support\Facades\Log::info("Header Image URL: " . ($headerImage ?: 'none'));

        $headerBase64 = null;
        if ($headerImage) {
            try {
                $response = \Illuminate\Support\Facades\Http::withoutVerifying()->timeout(10)->get($headerImage);
                if ($response->successful()) {
                    $type = $response->header('Content-Type') ?: 'image/jpeg';
                    $headerBase64 = 'data:' . $type . ';base64,' . base64_encode($response->body());
                } else {
                    \Illuminate\Support\Facades\Log::error("Header Image Fetch Failed: " . $response->status());
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Header Image Exception: " . $e->getMessage());
            }
        }

        $footerBase64 = null;
        if ($footerImage) {
            try {
                $response = \Illuminate\Support\Facades\Http::withoutVerifying()->timeout(10)->get($footerImage);
                if ($response->successful()) {
                    $type = $response->header('Content-Type') ?: 'image/jpeg';
                    $footerBase64 = 'data:' . $type . ';base64,' . base64_encode($response->body());
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Footer Image Exception: " . $e->getMessage());
            }
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('invoices.quotation-pdf', [
            'quotation' => $quotation,
            'business' => $business,
            'headerImage' => $headerBase64 ?? $headerImage,
            'footerImage' => $footerBase64 ?? $footerImage,
        ])->setOptions([
                    'isRemoteEnabled' => true,
                    'isHtml5ParserEnabled' => true,
                ]);

        return $pdf->download("quotation-{$quotation->quotation_number}.pdf");
    }
}
