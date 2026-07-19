<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Tax Invoice - {{ $sale->invoice_number }}</title>

    @php
        // ── Margins from Settings ──
        $headerHeightPx = 150; // Always reserve space for letterhead
        $footerHeightPx = 120; // Always reserve space for footer
        $customerBoxHeight = 82;
        $marginTop    = ($headerHeightPx + $customerBoxHeight + 20) . 'px';
        $marginBottom = ($footerHeightPx + 20) . 'px';
        
        $fontSize     = '12.5px';
        $fontFamily   = "'Helvetica Neue', Helvetica, Arial, sans-serif";
    @endphp

    <style>
        /* ── RESET ── */
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: {{ $fontFamily }};
            font-size: {{ $fontSize }};
            color: #1a1a1a;
            background: #fff;
            line-height: 1.45;
            margin: {{ $marginTop }} 25px {{ $marginBottom }} 25px;
            padding-top: 10px; /* Extra safety gap */
        }

        /* ══════════════════════════════════════════════
           FIXED HEADER
           ══════════════════════════════════════════════ */
        header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: {{ $headerHeightPx + $customerBoxHeight + 10 }}px;
            overflow: visible;
            width: 100%;
        }

        .header-banner {
            width: 100% !important;
            height: {{ $headerHeightPx }}px;
            object-fit: contain;
            display: block;
        }

        /* ── CUSTOMER INFO BOX (Fixed in Header) ── */
        .customer-box {
            border: 1.5px solid #222 !important;
            margin: 4px 25px 0;
            padding: 8px 12px;
            font-size: 10.5px;
            display: block;
            border-radius: 4px;
            background: #fafafa;
        }

        .customer-table {
            width: 100%;
            border-collapse: collapse;
        }

        .customer-table td {
            padding: 2px;
            vertical-align: top;
            line-height: 1.2;
        }

        .customer-table .lbl {
            font-weight: 700;
            color: #1a1a1a;
            width: 15%;
            white-space: nowrap;
        }

        .customer-table .val {
            color: #1a1a1a;
            width: 32%;
        }

        .customer-table .qr-cell {
            text-align: center;
            vertical-align: middle;
            width: 12%;
        }

        .qr-code {
            width: 55px;
            height: 55px;
            display: block;
            margin: 0 auto;
        }

        /* ══════════════════════════════════════════════
           FIXED FOOTER
           ══════════════════════════════════════════════ */
        footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: {{ $footerHeightPx }}px;
            width: 100%;
        }

        .footer-banner {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100% !important;
            height: 100%;
            object-fit: contain;
            display: block;
        }

        /* ── MAIN CONTENT ── */
        .bill-title-container {
            text-align: center;
            width: 100%;
            margin: 20px 0 15px; 
        }

        .bill-title {
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: #1a1a1a;
            border-bottom: 2px solid #1a1a1a;
            display: inline-block;
            padding: 0 10px 3px;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .items-table th {
            text-align: left;
            padding: 10px 8px; 
            border-top: 1.5px solid #222;
            border-bottom: 1.5px solid #222;
            font-weight: 800;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: #f8f8f8;
        }

        .items-table td {
            padding: 12px 8px;
            border-bottom: 1px solid #eee;
            font-size: 11px;
            vertical-align: middle;
        }

        .item-name { font-weight: 700; color: #1a1a1a; }
        .item-sub { font-size: 9px; color: #555; }

        /* ── Totals ── */
        .summary-wrapper {
            margin-top: 20px;
        }

        .status-badge {
            float: left;
            border: 2px solid #16a34a;
            color: #16a34a;
            padding: 5px 15px;
            font-size: 18px;
            font-weight: 900;
            text-transform: uppercase;
            opacity: 0.3;
            transform: rotate(-4deg);
            margin-top: 20px;
        }

        .totals-table {
            float: right;
            width: 280px;
            border-collapse: collapse;
            border: 1.5px solid #222;
            background: #fff;
        }

        .totals-table td {
            padding: 8px 12px;
            font-size: 12px;
        }

        .grand-total {
            border-top: 1.5px solid #222;
            font-weight: 900;
            font-size: 15px !important;
            color: #000;
            background: #f8f8f8;
        }

        .clearfix::after { content: ""; display: table; clear: both; }

        .end-note {
            text-align: center;
            font-size: 10px;
            margin-top: 40px;
            color: #666;
            font-style: italic;
        }
        
        .notes-section {
            margin-top: 20px;
            font-size: 11px;
            color: #444;
            float: left;
            width: 50%;
        }
    </style>
</head>

<body>

    {{-- ══════════════════ FIXED HEADER ══════════════════ --}}
    <header>
        <div style="height: {{ $headerHeightPx }}px; width: 100%; overflow: hidden; margin-bottom: 10px; padding: 0;">
            @if($headerImage)
                <img class="header-banner" src="{{ $headerImage }}" alt="Header">
            @endif
        </div>

        {{-- Customer Info Box (Fixed in Header - Stays at top of every page) --}}
        <div class="customer-box">
            <table class="customer-table">
                <tr>
                    <td class="lbl">Billed To</td>
                    <td class="val">: {{ strtoupper($sale->customer->name ?? 'Walk-in Customer') }}</td>
                    <td class="lbl">Invoice No</td>
                    <td class="val">: {{ $sale->invoice_number }}</td>
                    <td rowspan="3" class="qr-cell">
                        @if(isset($qrCodeUri))
                             <img src="{{ $qrCodeUri }}" class="qr-code">
                        @endif
                    </td>
                </tr>
                <tr>
                    <td class="lbl">Phone No</td>
                    <td class="val">: {{ $sale->customer->phone ?? 'N/A' }}</td>
                    <td class="lbl">Date</td>
                    <td class="val">: {{ \Carbon\Carbon::parse($sale->date)->format('d/m/Y') }} {{ $sale->created_at->format('h:i A') }}</td>
                </tr>
                <tr>
                    <td class="lbl">Address</td>
                    <td class="val">: {{ $sale->customer->address ?? 'N/A' }}</td>
                    <td class="lbl">GSTIN</td>
                    <td class="val">: {{ strtoupper($business->gst_number ?? 'N/A') }}</td>
                </tr>
            </table>
        </div>
    </header>

    {{-- ══════════════════ FIXED FOOTER ══════════════════ --}}
    <footer>
        <div style="height: {{ $footerHeightPx }}px; width: 100%; overflow: hidden; padding: 0;">
            @if($footerImage)
                <img class="footer-banner" src="{{ $footerImage }}" alt="Footer">
            @endif
        </div>
    </footer>

    {{-- ══════════════════ MAIN CONTENT ══════════════════ --}}
    <div class="bill-title-container">
        <h2 class="bill-title">
            @if(!empty($business->gst_number))
                TAX INVOICE
            @else
                RETAIL INVOICE
            @endif
        </h2>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th width="8%">#</th>
                <th width="52%">Item Description</th>
                <th width="10%" style="text-align:right;">Qty</th>
                <th width="15%" style="text-align:right;">Rate (Rs.)</th>
                <th width="15%" style="text-align:right;">Total (Rs.)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sale->items as $idx => $item)
                <tr>
                    <td style="color:#666;">{{ str_pad($idx + 1, 2, '0', STR_PAD_LEFT) }}</td>
                    <td>
                        <div class="item-name">{{ strtoupper($item->product->model_name ?? 'UNKNOWN ITEM') }}</div>
                        @if($item->imei_1 || $item->imei_2 || $item->serial_no)
                            <div class="item-sub">IMEI/Serial: {{ implode(', ', array_filter([$item->imei_1, $item->imei_2, $item->serial_no])) }}</div>
                        @endif
                    </td>
                    <td style="text-align:right;">{{ $item->quantity }}</td>
                    <td style="text-align:right;">{{ number_format($item->unit_price, 2) }}</td>
                    <td style="text-align:right; font-weight:700;">{{ number_format($item->subtotal, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary-wrapper clearfix">
        <div style="float:left; width:50%;">
            <div class="status-box">
                @php
                    $isUdhar = false;
                    if($sale->payments) {
                        $isUdhar = $sale->payments->contains(function($p) {
                            $mode = strtolower(trim($p->payment_mode));
                            return $mode === 'udhar' || $mode === 'credit';
                        });
                    }
                @endphp
                @if($isUdhar)
                    <div class="status-badge" style="border-color:#dc2626; color:#dc2626;">CREDIT</div>
                @elseif($sale->status === 'completed')
                    <div class="status-badge">FULLY PAID</div>
                @elseif($sale->status === 'partial')
                    <div class="status-badge" style="border-color:#d97706; color:#d97706;">PARTIAL</div>
                @else
                    <div class="status-badge" style="border-color:#dc2626; color:#dc2626;">UNPAID</div>
                @endif
            </div>
            
            @if($sale->notes)
            <div style="clear:both;"></div>
            <div class="notes-section">
                <strong>Terms & Notes:</strong><br>
                {!! nl2br(e($sale->notes)) !!}
            </div>
            @endif

            <div style="clear:both;"></div>
            @if($sale->payments && $sale->payments->count() > 0)
            <div style="margin-top:20px; padding:10px; border:1px solid #ddd; background:#f9f9f9; border-radius:4px; font-size:11px; width: 90%;">
                <strong>PAYMENT RECEIVED:</strong>
                <table style="width:100%; margin-top:5px; border-collapse:collapse;">
                    @foreach($sale->payments as $payment)
                    @php
                        $cleanNotes = $payment->notes ? preg_replace('/Udhar linked to Customer:[^|]*\|?\s*/i', '', $payment->notes) : '';
                    @endphp
                    @php
                        $isRowUdhar = strtolower(trim($payment->payment_mode)) === 'udhar' || strtolower(trim($payment->payment_mode)) === 'credit';
                    @endphp
                    <tr>
                        <td style="padding:4px 0; color:#444; border-bottom:1px solid #eee;">
                            {{ strtoupper($payment->payment_mode) }}
                            @if($cleanNotes)
                                <span style="font-size:9.5px; color:#777; margin-left:4px;">( {{ $cleanNotes }} )</span>
                            @endif
                        </td>
                        <td style="padding:4px 0; text-align:right; font-weight:bold; border-bottom:1px solid #eee; {{ $isRowUdhar ? 'color:#dc2626;' : '' }}">Rs.{{ number_format($payment->amount, 2) }}</td>
                    </tr>
                    @endforeach
                </table>
            </div>
            @endif

            @if($sale->emiDetail)
            <div style="margin-top:10px; padding:10px; border:1px solid #c7d2fe; background:#eef2ff; border-radius:4px; font-size:11px; width: 90%;">
                <strong style="color:#3730a3;">EMI FINANCE DETAILS:</strong>
                <table style="width:100%; margin-top:5px; border-collapse:collapse;">
                    <tr>
                        <td style="padding:2px 0; color:#4f46e5;">Financier:</td>
                        <td style="padding:2px 0; text-align:right; font-weight:bold;">{{ strtoupper($sale->emiDetail->financier_name) }}</td>
                    </tr>
                    <tr>
                        <td style="padding:2px 0; color:#4f46e5;">Loan Amount:</td>
                        <td style="padding:2px 0; text-align:right; font-weight:bold;">Rs.{{ number_format($sale->emiDetail->loan_amount, 2) }}</td>
                    </tr>
                    <tr>
                        <td style="padding:2px 0; color:#4f46e5;">Tenure:</td>
                        <td style="padding:2px 0; text-align:right;">{{ $sale->emiDetail->tenure_months }} Months</td>
                    </tr>
                </table>
            </div>
            @endif
        </div>

        <table class="totals-table">
            <tr>
                <td class="total-lbl">Sub-Total</td>
                <td class="total-val" style="text-align:right;">Rs.{{ number_format($sale->total_amount, 2) }}</td>
            </tr>
            @if($sale->discount > 0)
                <tr>
                    <td class="total-lbl">Discount (-)</td>
                    <td class="total-val" style="color:#16a34a; text-align:right;">- Rs.{{ number_format($sale->discount, 2) }}</td>
                </tr>
            @endif
            <tr class="grand-total">
                <td>NET PAYABLE</td>
                <td class="total-val" style="text-align:right;">Rs.{{ number_format($sale->final_amount, 2) }}</td>
            </tr>
            <tr>
                <td class="total-lbl">Paid Amount</td>
                <td class="total-val" style="color:#16a34a; text-align:right;">Rs.{{ number_format($sale->paid_amount, 2) }}</td>
            </tr>
            @if(($sale->final_amount - $sale->paid_amount) > 0)
                @if($sale->emiDetail)
                    <tr style="color:#16a34a; font-weight:700;">
                        <td>Paid by Finance</td>
                        <td class="total-val" style="text-align:right;">Rs.{{ number_format($sale->final_amount - $sale->paid_amount, 2) }}</td>
                    </tr>
                @else
                    <tr style="color:#dc2626; font-weight:700;">
                        <td>Balance Due</td>
                        <td class="total-val" style="text-align:right;">Rs.{{ number_format($sale->final_amount - $sale->paid_amount, 2) }}</td>
                    </tr>
                @endif
            @endif
        </table>
    </div>

    <div class="clearfix"></div>

    <div style="margin-top: 30px; font-size: 9.5px; border-top: 1px solid #ccc; padding-top: 10px; color: #333;">
        <strong style="font-size: 11px;">Terms & Conditions:</strong>
        <ol style="margin-top: 5px; padding-left: 15px; line-height: 1.4;">
            <li>Goods once sold will not be taken back or exchanged.</li>
            <li>Warranty on products is provided by the respective OEM/brand authorized service centers. We hold no liability for warranty claims.</li>
            <li>Our responsibility ceases once the goods leave our premises.</li>
            <li>All disputes are subject to the local jurisdiction of the business address.</li>
            <li>E. & O. E. (Errors and Omissions Excepted).</li>
        </ol>
    </div>

    <div class="end-note">
        This is a computer-generated receipt and does not require a physical signature.
        <br>Thank you for choosing {{ $business->name ?? 'our store' }}!
    </div>

</body>
</html>
