<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Quotation - {{ $quotation->quotation_number }}</title>

    @php
        $headerHeightPx = 150;
        $footerHeightPx = 120;
        $customerBoxHeight = 82;
        $marginTop    = ($headerHeightPx + $customerBoxHeight + 20) . 'px';
        $marginBottom = ($footerHeightPx + 20) . 'px';
        $fontSize     = '12.5px';
        $fontFamily   = "'Helvetica Neue', Helvetica, Arial, sans-serif";
    @endphp

    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: {{ $fontFamily }};
            font-size: {{ $fontSize }};
            color: #1a1a1a;
            background: #fff;
            line-height: 1.45;
            margin: {{ $marginTop }} 25px {{ $marginBottom }} 25px;
            padding-top: 10px;
        }

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

        .summary-wrapper {
            margin-top: 20px;
        }

        .status-badge {
            float: left;
            border: 2px solid #2563eb;
            color: #2563eb;
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

        .notes-section {
            margin-top: 20px;
            font-size: 11px;
            color: #444;
            float: left;
            width: 50%;
        }

        .validity-notice {
            text-align: center;
            font-size: 10px;
            margin-top: 40px;
            color: #666;
            font-style: italic;
            border-top: 1px dashed #ccc;
            padding-top: 8px;
        }
    </style>
</head>

<body>

    <header>
        <div style="height: {{ $headerHeightPx }}px; width: 100%; overflow: hidden; margin-bottom: 10px; padding: 0;">
            @if($headerImage)
                <img class="header-banner" src="{{ $headerImage }}" alt="Header">
            @endif
        </div>

        <div class="customer-box">
            <table class="customer-table">
                <tr>
                    <td class="lbl">To</td>
                    <td class="val">: {{ strtoupper($quotation->customer->name ?? 'Walk-in Customer') }}</td>
                    <td class="lbl">Quotation No</td>
                    <td class="val">: {{ $quotation->quotation_number }}</td>
                </tr>
                <tr>
                    <td class="lbl">Phone No</td>
                    <td class="val">: {{ $quotation->customer->phone ?? 'N/A' }}</td>
                    <td class="lbl">Date</td>
                    <td class="val">: {{ \Carbon\Carbon::parse($quotation->date)->format('d/m/Y') }}</td>
                </tr>
                <tr>
                    <td class="lbl">Address</td>
                    <td class="val">: 
                        @php
                            $customerAddress = 'N/A';
                            if ($quotation->customer) {
                                if (!empty($quotation->customer->village) || !empty($quotation->customer->city) || !empty($quotation->customer->district) || !empty($quotation->customer->state)) {
                                    $parts = array_filter([$quotation->customer->village, $quotation->customer->city, $quotation->customer->district, $quotation->customer->state]);
                                    $customerAddress = implode(', ', $parts);
                                    if (!empty($quotation->customer->pin)) {
                                        $customerAddress .= ' - ' . $quotation->customer->pin;
                                    }
                                } elseif (!empty($quotation->customer->address)) {
                                    $customerAddress = $quotation->customer->address;
                                }
                            }
                        @endphp
                        {{ $customerAddress }}
                    </td>
                    <td class="lbl">Valid Until</td>
                    <td class="val">: {{ $quotation->valid_until ? \Carbon\Carbon::parse($quotation->valid_until)->format('d/m/Y') : 'N/A' }}</td>
                </tr>
            </table>
        </div>
    </header>

    <footer>
        <div style="height: {{ $footerHeightPx }}px; width: 100%; overflow: hidden; padding: 0;">
            @if($footerImage)
                <img class="footer-banner" src="{{ $footerImage }}" alt="Footer">
            @endif
        </div>
    </footer>

    <div class="bill-title-container">
        <h2 class="bill-title">QUOTATION</h2>
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
            @foreach($quotation->items as $idx => $item)
                <tr>
                    <td style="color:#666;">{{ str_pad($idx + 1, 2, '0', STR_PAD_LEFT) }}</td>
                    <td>
                        <div class="item-name">{{ strtoupper($item->product->model_name ?? 'UNKNOWN ITEM') }}</div>
                        @if($item->product && $item->product->brand)
                            <div class="item-sub">Brand: {{ $item->product->brand->name ?? '' }}</div>
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
            <div class="status-badge">QUOTATION</div>
        </div>

        @if($quotation->notes)
            <div class="notes-section">
                <strong>Notes:</strong><br>
                {{ $quotation->notes }}
            </div>
        @endif

        <table class="totals-table">
            <tr>
                <td style="font-weight:600;">Sub Total</td>
                <td style="text-align:right;">Rs.{{ number_format($quotation->total_amount, 2) }}</td>
            </tr>
            @if($quotation->discount > 0)
                <tr>
                    <td style="font-weight:600; color:#dc2626;">Discount</td>
                    <td style="text-align:right; color:#dc2626;">- Rs.{{ number_format($quotation->discount, 2) }}</td>
                </tr>
            @endif
            @if($quotation->round_off != 0)
                <tr>
                    <td style="font-weight:600;">Round Off</td>
                    <td style="text-align:right;">Rs.{{ number_format($quotation->round_off, 2) }}</td>
                </tr>
            @endif
            <tr class="grand-total">
                <td>TOTAL</td>
                <td style="text-align:right;">Rs.{{ number_format($quotation->final_amount, 2) }}</td>
            </tr>
        </table>
    </div>

    <div style="clear:both;"></div>

    <div style="margin-top: 30px; font-size: 9.5px; border-top: 1px solid #ccc; padding-top: 10px; color: #333;">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="width: 50%; vertical-align: top; padding-right: 15px;">
                    <strong style="font-size: 11px;">Terms & Conditions:</strong>
                    <div style="margin-top: 5px; line-height: 1.4;">
                        @if(!empty($business->settings['quotation_terms']))
                            {!! nl2br(e($business->settings['quotation_terms'])) !!}
                        @else
                            <ol style="margin: 0; padding-left: 15px;">
                                <li>Prices are subject to change without notice.</li>
                                <li>Subject to local jurisdiction.</li>
                            </ol>
                        @endif
                    </div>
                </td>
                <td style="width: 50%; vertical-align: top; padding-left: 15px; border-left: 1px solid #eee;">
                    <strong style="font-size: 11px;">Bank Details:</strong>
                    <div style="margin-top: 5px; line-height: 1.4;">
                        @if(!empty($business->settings['bank_details']))
                            {!! nl2br(e($business->settings['bank_details'])) !!}
                        @else
                            <p style="margin:0; color:#777;">No bank details provided.</p>
                        @endif
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <div style="margin-top: 60px; margin-bottom: 20px; width: 100%; text-align: center; clear: both;">
        <table style="width: 100%; font-size: 10px; font-weight: bold; color: #444;">
            <tr>
                <td style="width: 50%; text-align: center;">
                    <div style="border-top: 1px dashed #999; margin: 0 auto 5px; width: 120px;"></div>
                    CUSTOMER SIGN
                </td>
                <td style="width: 50%; text-align: center;">
                    <div style="border-top: 1px dashed #999; margin: 0 auto 5px; width: 150px;"></div>
                    CASHIER SIGN
                </td>
            </tr>
        </table>
    </div>

    <div class="validity-notice">
        @if($quotation->valid_until)
            This quotation is valid until {{ \Carbon\Carbon::parse($quotation->valid_until)->format('d M Y') }}. Prices may change after this date.
        @else
            This is a computer generated quotation and does not require a signature.
        @endif
    </div>

</body>
</html>
