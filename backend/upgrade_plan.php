<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('email', 'owner@multifirm.com')->first();
$plan = \App\Models\Plan::where('name', 'Enterprise Plan')->first();

if ($user && $plan) {
    foreach($user->businesses as $b) {
        $b->plan_id = $plan->id;
        $b->save();
    }
    echo "Successfully upgraded owner@multifirm.com to Enterprise Plan.\n";
} else {
    echo "User or plan not found.\n";
}
