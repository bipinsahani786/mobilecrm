<?php

namespace App\Actions\Auth;

use App\Models\User;

class CheckUserExistsAction
{
    /**
     * Check if a user exists by their email or phone.
     */
    public function execute(string $identifier): bool
    {
        $field = filter_var($identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
        return User::where($field, $identifier)->exists();
    }
}
