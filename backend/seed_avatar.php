<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('email', 'superadmin@mobilecrm.com')->first();
if ($user) {
    $user->avatar = 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Superadmin&backgroundColor=1e293b';
    $user->save();
    echo "Avatar updated successfully!\n";
} else {
    echo "User not found.\n";
}
