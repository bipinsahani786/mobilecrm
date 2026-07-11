<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$defaults = ['Rent', 'Salary', 'Electricity', 'Internet', 'Water', 'Maintenance', 'Marketing', 'Office Supplies', 'Travel', 'Food & Beverages', 'Other'];
$businesses = \App\Models\Business::all();
foreach ($businesses as $b) {
    foreach ($defaults as $cat) {
        \App\Models\ExpenseCategory::firstOrCreate(['business_id' => $b->id, 'name' => $cat]);
    }
}
$existing = \Illuminate\Support\Facades\DB::table('expenses')->select('business_id', 'category')->distinct()->get();
foreach ($existing as $e) {
    if (!empty(trim($e->category))) {
        \App\Models\ExpenseCategory::firstOrCreate(['business_id' => $e->business_id, 'name' => trim($e->category)]);
    }
}
echo 'Categories seeded successfully.';
