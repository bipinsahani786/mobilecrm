<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo config('filesystems.disks.s3.url') . "\n";
echo Illuminate\Support\Facades\Storage::disk('s3')->url('test.png');
