<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('LandingPage', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/about', function () {
    return Inertia::render('Landing/About');
})->name('about');

Route::get('/blog', function () {
    return Inertia::render('Landing/Blog');
})->name('blog');

Route::get('/contact', function () {
    return Inertia::render('Landing/Contact');
})->name('contact');

Route::get('/features', function () {
    return Inertia::render('Landing/Features');
})->name('features');

Route::get('/integrations', function () {
    return Inertia::render('Landing/Integrations');
})->name('integrations');

Route::get('/pricing', function () {
    return Inertia::render('Landing/Pricing');
})->name('pricing');

Route::get('/changelog', function () {
    return Inertia::render('Landing/Changelog');
})->name('changelog');

Route::get('/docs', function () {
    return Inertia::render('Landing/Docs');
})->name('docs');

Route::get('/privacy-policy', function () {
    return Inertia::render('Landing/PrivacyPolicy');
})->name('privacy-policy');

Route::get('/terms-of-service', function () {
    return Inertia::render('Landing/TermsOfService');
})->name('terms-of-service');

Route::get('/cookie-policy', function () {
    return Inertia::render('Landing/CookiePolicy');
})->name('cookie-policy');

Route::get('/security', function () {
    return Inertia::render('Landing/Security');
})->name('security');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
