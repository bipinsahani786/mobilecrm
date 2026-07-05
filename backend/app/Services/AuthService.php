<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Handle the user login using Email OR Phone, and token generation.
     */
    public function login(array $credentials): array
    {
        $identifier = $credentials['identifier'];
        $field = filter_var($identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $user = User::where($field, $identifier)->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'identifier' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Load roles
        $user->load('roles');
        
        $userData = $user->toArray();
        $userData['permissions'] = $user->getAllPermissions()->pluck('name');

        // Create a Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $userData,
            'token' => $token
        ];
    }

    /**
     * Set password and register the user using a valid verification token.
     */
    public function registerUser(string $verificationToken, array $data): array
    {
        $identifier = Cache::get('verified_token_' . $verificationToken);
        
        if (!$identifier) {
            throw ValidationException::withMessages([
                'token' => ['Invalid or expired verification token.'],
            ]);
        }
        
        $field = filter_var($identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
        
        // Ensure user doesn't already exist
        if (User::where($field, $identifier)->exists()) {
            throw ValidationException::withMessages([
                'identifier' => ['An account with this mobile/email already exists.'],
            ]);
        }

        // Create the user
        $user = User::create([
            'name' => $data['name'],
            $field => $identifier,
            'password' => Hash::make($data['password']),
        ]);
        
        // Load roles (though empty on initial register, it ensures consistency)
        $user->load('roles');
        
        // Remove token from cache
        Cache::forget('verified_token_' . $verificationToken);
        
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token
        ];
    }
}
