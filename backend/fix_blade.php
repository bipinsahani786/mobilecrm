<?php
 = file_get_contents('resources/views/invoices/quotation-pdf.blade.php');
 = str_replace('Quotation', 'Booking Receipt', );
 = str_replace('QUOTATION', 'BOOKING RECEIPT', );
 = str_replace('', '', );
 = str_replace('quotation_number', 'booking_number', );
 = str_replace('quotation_date', 'booking_date', );
file_put_contents('resources/views/invoices/booking-pdf.blade.php', );
echo 'Done';

