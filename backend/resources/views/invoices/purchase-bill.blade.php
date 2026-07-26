<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Purchase Bill - {{ $purchase->purchase_number }}</title>

    @php
        // ── Margins from Settings ──
        $headerHeightPx = 150; // Always reserve space for letterhead
        $footerHeightPx = 120; // Always reserve space for footer
        $supplierBoxHeight = 82;
        $marginTop = ($headerHeightPx + $supplierBoxHeight + 20) . 'px';
        $marginBottom = ($footerHeightPx + 20) . 'px';

        $fontSize = '12.5px';
        $fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";
    @endphp

    <style>
        /* ── RESET ── */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

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
            height: {{ $headerHeightPx + $supplierBoxHeight + 10 }}px;
            overflow: visible;
            width: 100%;
        }

        .header-banner {
            width: 100% !important;
            height: {{ $headerHeightPx }}px;
            object-fit: contain;
            display: block;
        }

        /* ── supplier INFO BOX (Fixed in Header) ── */
        .supplier-box {
            border: 1.5px solid #222 !important;
            margin: 4px 25px 0;
            padding: 8px 12px;
            font-size: 10.5px;
            display: block;
            border-radius: 4px;
            background: #fafafa;
        }

        .supplier-table {
            width: 100%;
            border-collapse: collapse;
        }

        .supplier-table td {
            padding: 2px;
            vertical-align: top;
            line-height: 1.2;
        }

        .supplier-table .lbl {
            font-weight: 700;
            color: #1a1a1a;
            width: 15%;
            white-space: nowrap;
        }

        .supplier-table .val {
            color: #1a1a1a;
            width: 32%;
        }

        .supplier-table .qr-cell {
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

        .item-name {
            font-weight: 700;
            color: #1a1a1a;
        }

        .item-sub {
            font-size: 9px;
            color: #555;
        }

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

        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }

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

        {{-- supplier Info Box (Fixed in Header - Stays at top of every page) --}}
        <div class="supplier-box">
            <table class="supplier-table">
                <tr>
                    <td class="lbl">Billed To</td>
                    <td class="val">: {{ strtoupper($purchase->supplier->name ?? 'Walk-in supplier') }}</td>
                    <td class="lbl">Invoice No</td>
                    <td class="val">: {{ $purchase->purchase_number }}</td>
                    <td rowspan="3" class="qr-cell">
                        @if(isset($qrCodeUri))
                            <img src="{{ $qrCodeUri }}" class="qr-code">
                        @endif
                    </td>
                </tr>
                <tr>
                    <td class="lbl">Phone No</td>
                    <td class="val">: {{ $purchase->supplier->phone ?? 'N/A' }}</td>
                    <td class="lbl">Date</td>
                    <td class="val">: {{ \Carbon\Carbon::parse($purchase->date)->format('d/m/Y') }}
                        {{ $purchase->created_at->format('h:i A') }}</td>
                </tr>
                <tr>
                    <td class="lbl">Address</td>
                    <td class="val">:
                        @php
                            $supplierAddress = 'N/A';
                            if ($purchase->supplier) {
                                if (!empty($purchase->supplier->village) || !empty($purchase->supplier->city) || !empty($purchase->supplier->district) || !empty($purchase->supplier->state)) {
                                    $parts = array_filter([$purchase->supplier->village, $purchase->supplier->city, $purchase->supplier->district, $purchase->supplier->state]);
                                    $supplierAddress = implode(', ', $parts);
                                    if (!empty($purchase->supplier->pin)) {
                                        $supplierAddress .= ' - ' . $purchase->supplier->pin;
                                    }
                                } elseif (!empty($purchase->supplier->address)) {
                                    $supplierAddress = $purchase->supplier->address;
                                }
                            }
                        @endphp
                        {{ $supplierAddress }}
                    </td>
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
                Purchase Bill
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
            @foreach($purchase->items as $idx => $item)
                <tr>
                    <td style="color:#666;">{{ str_pad($idx + 1, 2, '0', STR_PAD_LEFT) }}</td>
                    <td>
                        <div class="item-name">{{ strtoupper($item->product->model_name ?? 'UNKNOWN ITEM') }}</div>
                        @if($item->imei_1 || $item->imei_2 || $item->serial_no)
                            <div class="item-sub">IMEI/Serial:
                                {{ implode(', ', array_filter([$item->imei_1, $item->imei_2, $item->serial_no])) }}</div>
                        @endif
                    </td>
                    <td style="text-align:right;">{{ $item->quantity }}</td>
                    <td style="text-align:right;">{{ number_format($item->purchase_price, 2) }}</td>
                    <td style="text-align:right; font-weight:700;">{{ number_format($item->total_price, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary-wrapper clearfix">
        <div style="float:left; width:50%;">
            <div class="status-box">
                @php
                    $isUdhar = false;
                    if ($purchase->payments) {
                        $isUdhar = $purchase->payments->contains(function ($p) {
                            $mode = strtolower(trim($p->payment_mode));
                            return $mode === 'udhar' || $mode === 'credit';
                        });
                    }
                @endphp
                @if($isUdhar && ($purchase->bill_amount - $purchase->paid_amount) > 0)
                    <div class="status-badge" style="border-color:#dc2626; color:#dc2626;">CREDIT / OUTSTANDING</div>
                @elseif(($purchase->bill_amount - $purchase->paid_amount) <= 0)
                    <div class="status-badge">FULLY PAID</div>
                @else
                    <div class="status-badge" style="border-color:#d97706; color:#d97706;">PARTIAL / UNPAID</div>
                @endif
            </div>

            @if($purchase->notes)
                <div style="clear:both;"></div>
                <div class="notes-section">
                    <strong>Terms & Notes:</strong><br>
                    {!! nl2br(e($purchase->notes)) !!}
                </div>
            @endif

            <div style="clear:both;"></div>
            @if($purchase->payments && $purchase->payments->count() > 0)
                <div
                    style="margin-top:20px; padding:10px; border:1px solid #ddd; background:#f9f9f9; border-radius:4px; font-size:11px; width: 90%;">
                    <strong>PAYMENT RECEIVED:</strong>
                    <table style="width:100%; margin-top:5px; border-collapse:collapse;">
                        @foreach($purchase->payments as $payment)
                            @php
                                $cleanNotes = $payment->notes ? preg_replace('/Udhar linked to supplier:[^|]*\|?\s*/i', '', $payment->notes) : '';
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
                                <td
                                    style="padding:4px 0; text-align:right; font-weight:bold; border-bottom:1px solid #eee; {{ $isRowUdhar ? 'color:#dc2626;' : '' }}">
                                    Rs.{{ number_format($payment->amount, 2) }}</td>
                            </tr>
                        @endforeach
                    </table>
                </div>
            @endif
        </div>



        @php
            $itemsTotal = $purchase->items->sum('total_price');
            $hasReturns = $itemsTotal > $purchase->bill_amount;
            $returnAmount = $itemsTotal - $purchase->bill_amount;
        @endphp

        <table class="totals-table">
            <tr>
                <td class="total-lbl">Sub-Total</td>
                <td class="total-val" style="text-align:right;">Rs.{{ number_format($itemsTotal, 2) }}</td>
            </tr>
            @if($hasReturns)
            <tr>
                <td class="total-lbl" style="color:#dc2626;">Purchase Returns</td>
                <td class="total-val" style="color:#dc2626; text-align:right;">- Rs.{{ number_format($returnAmount, 2) }}</td>
            </tr>
            @endif
            <tr class="grand-total">
                <td>NET PAYABLE</td>
                <td class="total-val" style="text-align:right;">Rs.{{ number_format($purchase->bill_amount, 2) }}</td>
            </tr>
            <tr>
                <td class="total-lbl" style="padding-top:8px;">Paid Amount</td>
                <td class="total-val" style="color:#16a34a; text-align:right; padding-top:8px;">
                    Rs.{{ number_format($purchase->paid_amount, 2) }}</td>
            </tr>
            @if(($purchase->bill_amount - $purchase->paid_amount) > 0)
                <tr style="color:#dc2626; font-weight:700;">
                    <td>Balance Due</td>
                    <td class="total-val" style="text-align:right;">
                        Rs.{{ number_format($purchase->bill_amount - $purchase->paid_amount, 2) }}</td>
                </tr>
            @endif
        </table>
    </div>

    <div class="clearfix"></div>

    <div style="margin-top: 30px; font-size: 9.5px; border-top: 1px solid #ccc; padding-top: 10px; color: #333;">
        <strong style="font-size: 11px;">Terms & Conditions:</strong>
        <ol style="margin-top: 5px; padding-left: 15px; line-height: 1.4;">
            <li>Goods once sold will not be taken back or exchanged.</li>
            <li>Warranty on products is provided by the respective OEM/brand authorized service centers. We hold no
                liability for warranty claims.</li>
            <li>Our responsibility ceases once the goods leave our premises.</li>
            <li>All disputes are subject to the local jurisdiction of the business address.</li>
            <li>E. & O. E. (Errors and Omissions Excepted).</li>
        </ol>
    </div>

    <div style="margin-top: 70px; margin-bottom: 20px; width: 100%; text-align: center; clear: both;">
        <table style="width: 100%; font-size: 10px; font-weight: bold; color: #444;">
            <tr>
                <td style="width: 33%; text-align: center;">
                    <div style="border-top: 1px dashed #999; margin: 0 auto 5px; width: 120px;"></div>
                    SUPPLIER SIGN
                </td>
                <td style="width: 33%; text-align: center;">
                    <div style="border-top: 1px dashed #999; margin: 0 auto 5px; width: 120px;"></div>
                    CASHIER SIGN
                </td>
                <td style="width: 33%; text-align: center;">
                    <div style="border-top: 1px dashed #999; margin: 0 auto 5px; width: 120px;"></div>
                    STORE STAMP
                </td>
            </tr>
        </table>
    </div>

    <div class="end-note" style="margin-top: 10px;">
        This is a computer-generated receipt and does not require a physical signature.
        <br>Thank you for choosing {{ $business->name ?? 'our store' }}!
    </div>

</body>

</html>