<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\BaseController;
use App\Services\Business\BookingService;
use Illuminate\Http\Request;

class BookingController extends BaseController
{
    public function __construct(protected BookingService $bookingService) {}

    /**
     * List bookings
     */
    public function index(Request $request)
    {
        $businessId = app('current_business_id');
        $bookings = $this->bookingService->listBookings($businessId, $request->all());
        return $this->success($bookings);
    }

    /**
     * Create a new booking
     */
    public function store(Request $request)
    {
        $businessId = app('current_business_id');

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_batch_id' => 'nullable|exists:product_batches,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'advance_amount' => 'required|numeric|min:0',
            'payment_mode' => 'nullable|string',
            'payments' => 'nullable|array',
            'payments.*.payment_mode' => 'required|string',
            'payments.*.amount' => 'required|numeric|min:0.01',
            'payments.*.notes' => 'nullable|string',
            'notes' => 'nullable|string',
            'booking_date' => 'nullable|date',
            'expected_delivery_date' => 'nullable|date',
        ]);

        try {
            $booking = $this->bookingService->createBooking($businessId, $validated);
            return $this->created(['booking' => $booking], 'Booking created successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    /**
     * Show a single booking
     */
    public function show(Request $request, $id)
    {
        $businessId = app('current_business_id');
        $booking = $this->bookingService->getBooking($businessId, $id);
        return $this->success($booking);
    }

    /**
     * Generate PDF for a single booking
     */
    public function generatePdf(Request $request, $id)
    {
        $businessId = app('current_business_id');
        $booking = $this->bookingService->getBooking($businessId, $id);

        $booking->load(['business', 'customer', 'items.product', 'payments']);
        $business = $booking->business;
        $settings = $business->settings ?? [];

        $showHeader = $request->has('header') ? $request->query('header') === 'true' : true;
        $showFooter = $request->has('footer') ? $request->query('footer') === 'true' : true;

        $headerImage = $showHeader && !empty($settings['invoice_header_image']) ? $settings['invoice_header_image'] : null;
        $footerImage = $showFooter && !empty($settings['invoice_footer_image']) ? $settings['invoice_footer_image'] : null;

        $headerBase64 = null;
        if ($headerImage) {
            try {
                $response = \Illuminate\Support\Facades\Http::withoutVerifying()->timeout(10)->get($headerImage);
                if ($response->successful()) {
                    $type = $response->header('Content-Type') ?: 'image/jpeg';
                    $headerBase64 = 'data:' . $type . ';base64,' . base64_encode($response->body());
                }
            } catch (\Exception $e) {
                // Ignore failure
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
                // Ignore failure
            }
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('invoices.booking-pdf', [
            'booking' => $booking,
            'business' => $business,
            'customer' => $booking->customer,
            'headerImage' => $headerBase64 ?? $headerImage,
            'footerImage' => $footerBase64 ?? $footerImage,
        ]);

        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
            'defaultFont' => 'sans-serif'
        ]);

        return $pdf->download("booking-{$booking->booking_number}.pdf");
    }

    /**
     * Cancel a booking
     */
    public function cancel(Request $request, $id)
    {
        $businessId = app('current_business_id');
        $booking = $this->bookingService->getBooking($businessId, $id);

        $validated = $request->validate([
            'refund_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        try {
            $booking = $this->bookingService->cancelBooking($booking, $validated);
            return $this->success(['booking' => $booking], 'Booking cancelled successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    /**
     * Get conversion data for POS
     */
    public function conversionData(Request $request, $id)
    {
        $businessId = app('current_business_id');
        $booking = $this->bookingService->getBooking($businessId, $id);

        try {
            $data = $this->bookingService->getConversionData($booking);
            return $this->success($data);
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    /**
     * Mark booking as converted (called after sale creation)
     */
    public function markConverted(Request $request, $id)
    {
        $businessId = app('current_business_id');
        $booking = $this->bookingService->getBooking($businessId, $id);

        $validated = $request->validate([
            'sale_id' => 'required|exists:sales,id',
        ]);

        try {
            $booking = $this->bookingService->markAsConverted($booking, $validated['sale_id']);
            return $this->success(['booking' => $booking], 'Booking converted successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }
}
