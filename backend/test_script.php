<?php
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
app()->instance("current_business_id", 1);
$p = \App\Models\Product::first();
echo "Product: " . $p->id . " Qty: " . $p->quantity . PHP_EOL;
$p->quantity = max(0, $p->quantity - 1);
$p->save();
$p->refresh();
echo "New Qty: " . $p->quantity . PHP_EOL;

