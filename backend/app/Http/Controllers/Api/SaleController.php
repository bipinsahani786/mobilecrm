<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\BaseController;
use App\Models\Sale;
use App\Services\Business\SaleService;
use Illuminate\Http\Request;

use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Business - Sales', description: 'API Endpoints for Managing Sales and Invoices')]
class SaleController extends BaseController
{
    public function __construct(private SaleService $saleService)
    {
    }

    #[OA\Get(
        path: '/business/sales',
        summary: 'List Sales',
        description: 'Get a paginated list of sales/invoices.',
        tags: ['Business - Sales'],
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
            $search = $request->input('search');
            $paymentMode = $request->input('payment_mode');
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');
            $hasUdhar = $request->input('has_udhar');

            $result = $this->saleService->getSales($perPage, $search, $paymentMode, $startDate, $endDate, $hasUdhar);
            $paginator = $result['paginator'];
            $aggregates = $result['aggregates'];

            return response()->json([
                'success' => true,
                'message' => 'Sales retrieved successfully',
                'data' => $paginator->items(),
                'meta' => array_merge([
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ], $aggregates),
                'links' => [
                    'first' => $paginator->url(1),
                    'last' => $paginator->url($paginator->lastPage()),
                    'prev' => $paginator->previousPageUrl(),
                    'next' => $paginator->nextPageUrl(),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    #[OA\Get(
        path: '/business/sales/{id}',
        summary: 'Get Sale',
        description: 'Get details of a specific sale including items and payments.',
        tags: ['Business - Sales'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function show(Sale $sale)
    {
        return $this->executeAction(function () use ($sale) {
            $sale->load(['customer', 'user', 'items.product', 'items.batch', 'payments', 'emiDetail']);
            return $sale;
        }, 'Sale retrieved successfully');
    }

    #[OA\Post(
        path: '/business/sales',
        summary: 'Create Sale',
        description: 'Record a new sale.',
        tags: ['Business - Sales'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['items'],
                properties: [
                    new OA\Property(property: 'customer_id', type: 'integer', nullable: true),
                    new OA\Property(property: 'discount', type: 'number', nullable: true),
                    new OA\Property(property: 'round_off', type: 'number', nullable: true),
                    new OA\Property(property: 'payment_mode', type: 'string', nullable: true),
                    new OA\Property(property: 'date', type: 'string', format: 'date', nullable: true),
                    new OA\Property(property: 'notes', type: 'string', nullable: true),
                    new OA\Property(
                        property: 'items',
                        type: 'array',
                        items: new OA\Items(
                            properties: [
                                new OA\Property(property: 'product_id', type: 'integer'),
                                new OA\Property(property: 'product_batch_id', type: 'integer', nullable: true),
                                new OA\Property(property: 'quantity', type: 'integer'),
                                new OA\Property(property: 'unit_price', type: 'number'),
                            ]
                        )
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Sale created successfully')
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'discount' => 'nullable|numeric|min:0',
            'round_off' => 'nullable|numeric',
            'payment_mode' => 'nullable|string',
            'date' => 'nullable|date',
            'notes' => 'nullable|string',
            'status' => 'nullable|string|in:completed,Draft',
            
            // Items
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_batch_id' => 'nullable|exists:product_batches,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.imei_1' => 'nullable|string',
            'items.*.imei_2' => 'nullable|string',
            'items.*.serial_no' => 'nullable|string',

            // Payments (Split Payments)
            'payments' => 'nullable|array',
            'payments.*.payment_mode' => 'required|string',
            'payments.*.amount' => 'required|numeric|min:0',
            'payments.*.notes' => 'nullable|string',
            'payments.*.link_customer_id' => 'nullable|integer|exists:customers,id',

            // EMI Detail
            'emi_detail' => 'nullable|array',
            'emi_detail.financier_name' => 'required_with:emi_detail|string',
            'emi_detail.down_payment' => 'nullable|numeric|min:0',
            'emi_detail.loan_amount' => 'required_with:emi_detail|numeric|min:0',
            'emi_detail.processing_fee' => 'nullable|numeric|min:0',
            'emi_detail.tenure_months' => 'nullable|integer|min:1',
            'emi_detail.monthly_installment_amount' => 'nullable|numeric|min:0',
            'emi_detail.first_emi_date' => 'nullable|date',
        ]);

        return $this->executeAction(function () use ($validated) {
            return $this->saleService->createSale($validated);
        }, 'Sale created successfully', 201);
    }

    #[OA\Put(
        path: '/business/sales/{id}',
        summary: 'Update Sale',
        description: 'Update an existing sale (items, payments, etc.)',
        tags: ['Business - Sales'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['items'],
                properties: [
                    new OA\Property(property: 'customer_id', type: 'integer', nullable: true),
                    new OA\Property(property: 'discount', type: 'number', nullable: true),
                    new OA\Property(property: 'round_off', type: 'number', nullable: true),
                    new OA\Property(property: 'payment_mode', type: 'string', nullable: true),
                    new OA\Property(property: 'date', type: 'string', format: 'date', nullable: true),
                    new OA\Property(property: 'notes', type: 'string', nullable: true),
                    new OA\Property(
                        property: 'items',
                        type: 'array',
                        items: new OA\Items(
                            properties: [
                                new OA\Property(property: 'product_id', type: 'integer'),
                                new OA\Property(property: 'product_batch_id', type: 'integer', nullable: true),
                                new OA\Property(property: 'quantity', type: 'integer'),
                                new OA\Property(property: 'unit_price', type: 'number'),
                            ]
                        )
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Sale updated successfully')
        ]
    )]
    public function update(Request $request, Sale $sale)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'discount' => 'nullable|numeric|min:0',
            'round_off' => 'nullable|numeric',
            'payment_mode' => 'nullable|string',
            'date' => 'nullable|date',
            'notes' => 'nullable|string',
            'status' => 'nullable|string|in:completed,Draft',
            
            // Items
            'items' => 'nullable|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_batch_id' => 'nullable|exists:product_batches,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.imei_1' => 'nullable|string',
            'items.*.imei_2' => 'nullable|string',
            'items.*.serial_no' => 'nullable|string',

            // Payments (Split Payments)
            'payments' => 'nullable|array',
            'payments.*.payment_mode' => 'required|string',
            'payments.*.amount' => 'required|numeric|min:0',
            'payments.*.notes' => 'nullable|string',
            'payments.*.link_customer_id' => 'nullable|integer|exists:customers,id',

            // EMI Detail
            'emi_detail' => 'nullable|array',
            'emi_detail.financier_name' => 'required_with:emi_detail|string',
            'emi_detail.down_payment' => 'nullable|numeric|min:0',
            'emi_detail.loan_amount' => 'required_with:emi_detail|numeric|min:0',
            'emi_detail.processing_fee' => 'nullable|numeric|min:0',
            'emi_detail.tenure_months' => 'nullable|integer|min:1',
            'emi_detail.monthly_installment_amount' => 'nullable|numeric|min:0',
            'emi_detail.first_emi_date' => 'nullable|date',
        ]);

        return $this->executeAction(function () use ($sale, $validated) {
            return $this->saleService->updateSale($sale, $validated);
        }, 'Sale updated successfully', 200);
    }

    public function generatePdf(Request $request, Sale $sale)
    {
        $sale->load(['customer', 'user', 'items.product', 'payments', 'emiDetail']);
        
        $business = $sale->business;
        $settings = $business->settings ?? [];

        $showHeader = $request->query('header') === 'true';
        $showFooter = $request->query('footer') === 'true';

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
            } catch (\Exception $e) {
                // Silently fallback if fetch fails
            }
        }

        $footerBase64 = null;
        if ($footerImage) {
            try {
                $response = \Illuminate\Support\Facades\Http::withoutVerifying()->get($footerImage);
                if ($response->successful()) {
                    $type = $response->header('Content-Type') ?: 'image/jpeg';
                    $footerBase64 = 'data:' . $type . ';base64,' . base64_encode($response->body());
                }
            } catch (\Exception $e) {
                // Silently fallback if fetch fails
            }
        }

        $qrUrl = \Illuminate\Support\Facades\URL::signedRoute('invoice.verify', ['sale' => $sale->id]);
        $qrCodeBase64 = 'data:image/svg+xml;base64,' . base64_encode(\SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')->size(100)->generate($qrUrl));

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('invoices.pdf', [
            'sale' => $sale,
            'business' => $business,
            'headerImage' => $headerBase64 ?? $headerImage,
            'footerImage' => $footerBase64 ?? $footerImage,
            'qrCodeUri' => $qrCodeBase64,
        ])->setOptions([
            'isRemoteEnabled' => true, 
            'isHtml5ParserEnabled' => true,
        ]);

        return $pdf->download("invoice-{$sale->invoice_number}.pdf");
    }
}
