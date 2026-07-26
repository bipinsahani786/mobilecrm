<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\BaseController;
use App\Models\Supplier;
use App\Services\Business\SupplierService;
use Illuminate\Http\Request;

use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Business - Suppliers', description: 'API Endpoints for Managing Suppliers and Purchases')]
class SupplierController extends BaseController
{
    public function __construct(private SupplierService $supplierService)
    {
    }

    #[OA\Get(
        path: '/business/suppliers',
        summary: 'List Suppliers',
        description: 'Get a paginated list of suppliers.',
        tags: ['Business - Suppliers'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 15))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 15);
            $paginator = $this->supplierService->getSuppliers($perPage);
            return $this->paginated($paginator, 'Suppliers retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    #[OA\Get(
        path: '/business/suppliers/{id}',
        summary: 'Get Supplier',
        description: 'Get details of a specific supplier including purchases and payments.',
        tags: ['Business - Suppliers'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function show(Supplier $supplier)
    {
        return $this->executeAction(function () use ($supplier) {
            $supplier->load(['purchases.items.product', 'payments']);
            return $supplier;
        }, 'Supplier retrieved successfully');
    }

    #[OA\Post(
        path: '/business/suppliers',
        summary: 'Create Supplier',
        description: 'Creates a new supplier.',
        tags: ['Business - Suppliers'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'phone', type: 'string', nullable: true),
                    new OA\Property(property: 'address', type: 'string', nullable: true),
                    new OA\Property(property: 'items_supplied', type: 'string', nullable: true)
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Supplier created successfully')
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'items_supplied' => 'nullable|string',
        ]);

        return $this->executeAction(function () use ($validated) {
            return $this->supplierService->createSupplier($validated);
        }, 'Supplier created successfully', 201);
    }

    #[OA\Put(
        path: '/business/suppliers/{id}',
        summary: 'Update Supplier',
        description: 'Updates a specific supplier.',
        tags: ['Business - Suppliers'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'phone', type: 'string', nullable: true),
                    new OA\Property(property: 'address', type: 'string', nullable: true),
                    new OA\Property(property: 'items_supplied', type: 'string', nullable: true)
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Supplier updated successfully')
        ]
    )]
    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'items_supplied' => 'nullable|string',
        ]);

        return $this->executeAction(function () use ($supplier, $validated) {
            return $this->supplierService->updateSupplier($supplier, $validated);
        }, 'Supplier updated successfully');
    }

    #[OA\Delete(
        path: '/business/suppliers/{id}',
        summary: 'Delete Supplier',
        description: 'Deletes a supplier.',
        tags: ['Business - Suppliers'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Supplier deleted successfully')
        ]
    )]
    public function destroy(Supplier $supplier)
    {
        return $this->executeAction(function () use ($supplier) {
            $this->supplierService->deleteSupplier($supplier);
            return null;
        }, 'Supplier deleted successfully');
    }

    #[OA\Post(
        path: '/business/suppliers/{id}/purchases',
        summary: 'Record Purchase',
        description: 'Record a new purchase from the supplier.',
        tags: ['Business - Suppliers'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    required: ['bill_amount', 'purchase_date', 'items'],
                    properties: [
                        new OA\Property(property: 'bill_amount', type: 'number'),
                        new OA\Property(property: 'paid_amount', type: 'number', nullable: true),
                        new OA\Property(property: 'purchase_date', type: 'string', format: 'date'),
                        new OA\Property(property: 'due_date', type: 'string', format: 'date', nullable: true),
                        new OA\Property(property: 'invoice_file', type: 'string', nullable: true),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Purchase recorded successfully')
        ]
    )]
    public function storePurchase(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'bill_amount' => 'required|numeric|min:0',
            'paid_amount' => 'nullable|numeric|min:0',
            'purchase_date' => 'required|date',
            'due_date' => 'nullable|date',
            'invoice_file' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.purchase_price' => 'required|numeric|min:0',
            'items.*.mrp' => 'nullable|numeric|min:0',
            'items.*.batch_number' => 'nullable|string',
        ]);

        return $this->executeAction(function () use ($supplier, $validated, $request) {
            $invoicePath = $validated['invoice_file'] ?? null;
            return $this->supplierService->recordPurchase($supplier, $validated, $invoicePath);
        }, 'Purchase recorded successfully', 201);
    }

    #[OA\Post(
        path: '/business/suppliers/{id}/payments',
        summary: 'Record Payment',
        description: 'Record a payment made to the supplier.',
        tags: ['Business - Suppliers'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['amount', 'payment_mode', 'date'],
                properties: [
                    new OA\Property(property: 'supplier_purchase_id', type: 'integer', nullable: true),
                    new OA\Property(property: 'amount', type: 'number'),
                    new OA\Property(property: 'payment_mode', type: 'string'),
                    new OA\Property(property: 'date', type: 'string', format: 'date'),
                    new OA\Property(property: 'notes', type: 'string', nullable: true)
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Payment recorded successfully')
        ]
    )]
    public function storePayment(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'supplier_purchase_id' => 'nullable|exists:supplier_purchases,id',
            'amount' => 'nullable|numeric|min:0.01',
            'payment_mode' => 'nullable|string',
            'date' => 'required|date',
            'notes' => 'nullable|string',
            'payments' => 'nullable|array|min:1',
            'payments.*.amount' => 'required|numeric|min:0.01',
            'payments.*.payment_mode' => 'required|string',
        ]);

        if (empty($validated['payments']) && (empty($validated['amount']) || empty($validated['payment_mode']))) {
            return response()->json(['message' => 'Payment details are required.'], 422);
        }

        return $this->executeAction(function () use ($supplier, $validated) {
            return $this->supplierService->recordPayment($supplier, $validated);
        }, 'Payment recorded successfully', 201);
    }

    #[OA\Post(
        path: '/business/suppliers/{id}/purchase-returns',
        summary: 'Record Purchase Return',
        description: 'Record items being returned to supplier. Reduces stock and adjusts supplier ledger.',
        tags: ['Business - Suppliers'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['return_date', 'items'],
                properties: [
                    new OA\Property(property: 'supplier_purchase_id', type: 'integer', nullable: true),
                    new OA\Property(property: 'return_date', type: 'string', format: 'date'),
                    new OA\Property(property: 'reason', type: 'string', nullable: true),
                    new OA\Property(property: 'notes', type: 'string', nullable: true),
                    new OA\Property(property: 'items', type: 'array', items: new OA\Items(
                        properties: [
                            new OA\Property(property: 'product_id', type: 'integer'),
                            new OA\Property(property: 'product_batch_id', type: 'integer', nullable: true),
                            new OA\Property(property: 'quantity', type: 'integer'),
                            new OA\Property(property: 'unit_price', type: 'number'),
                        ]
                    )),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Purchase return recorded successfully')
        ]
    )]
    public function storePurchaseReturn(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'supplier_purchase_id' => 'nullable|exists:supplier_purchases,id',
            'return_date' => 'required|date',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_batch_id' => 'nullable|exists:product_batches,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        return $this->executeAction(function () use ($supplier, $validated) {
            return $this->supplierService->recordPurchaseReturn($supplier, $validated);
        }, 'Purchase return recorded successfully', 201);
    }

    #[OA\Get(
        path: '/business/suppliers/{id}/ledger',
        summary: 'Get Supplier Ledger',
        description: 'Get chronological ledger of all purchases, payments, and returns for a supplier.',
        tags: ['Business - Suppliers'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'start_date', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'end_date', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Supplier ledger retrieved successfully')
        ]
    )]
    public function ledger(Request $request, Supplier $supplier)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        return $this->executeAction(function () use ($supplier, $startDate, $endDate) {
            $supplier->load(['purchases', 'payments', 'purchaseReturns']);
            return $this->supplierService->getSupplierLedger($supplier, $startDate, $endDate);
        }, 'Supplier ledger retrieved successfully');
    }

    #[OA\Get(
        path: '/business/suppliers/purchases/{purchaseId}/bill-pdf',
        summary: 'Download Purchase Bill PDF',
        description: 'Generate and download a purchase bill PDF with header and footer.',
        tags: ['Business - Suppliers'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'purchaseId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'PDF downloaded')
        ]
    )]
    public function purchaseBillPdf(Request $request, $purchaseId)
    {
        $purchase = \App\Models\SupplierPurchase::with(['supplier', 'items.product'])->findOrFail($purchaseId);

        $business = \App\Models\Business::find(app('current_business_id'));
        $settings = $business->settings ?? [];

        $showHeader = $request->has('header') ? $request->query('header') === 'true' : true;
        $showFooter = $request->has('footer') ? $request->query('footer') === 'true' : true;

        $headerImage = $showHeader && !empty($settings['invoice_header_image']) ? $settings['invoice_header_image'] : null;
        $footerImage = $showFooter && !empty($settings['invoice_footer_image']) ? $settings['invoice_footer_image'] : null;

        $headerBase64 = null;
        if ($headerImage) {
            try {
                $response = \Illuminate\Support\Facades\Http::withoutVerifying()->get($headerImage);
                if ($response->successful()) {
                    $type = $response->header('Content-Type') ?: 'image/jpeg';
                    $headerBase64 = 'data:' . $type . ';base64,' . base64_encode($response->body());
                }
            } catch (\Exception $e) {}
        }

        $footerBase64 = null;
        if ($footerImage) {
            try {
                $response = \Illuminate\Support\Facades\Http::withoutVerifying()->get($footerImage);
                if ($response->successful()) {
                    $type = $response->header('Content-Type') ?: 'image/jpeg';
                    $footerBase64 = 'data:' . $type . ';base64,' . base64_encode($response->body());
                }
            } catch (\Exception $e) {}
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('invoices.purchase-bill', [
            'purchase' => $purchase,
            'business' => $business,
            'headerImage' => $headerBase64 ?? $headerImage,
            'footerImage' => $footerBase64 ?? $footerImage,
        ])->setOptions([
            'isRemoteEnabled' => true,
            'isHtml5ParserEnabled' => true,
        ]);

        return $pdf->download("purchase-bill-{$purchase->purchase_number}.pdf");
    }
}
