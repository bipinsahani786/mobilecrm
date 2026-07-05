<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class OtpService
{
    /**
     * Generates an OTP, stores it in Cache, and returns it.
     */
    public function generateOtp(string $identifier): string
    {
        // In production, use rand(100000, 999999). 
        // For development/testing, we use a fixed OTP.
        $otp = app()->environment('production') ? (string) rand(100000, 999999) : '123456';
        
        // Store in cache for 10 minutes
        Cache::put('otp_' . $identifier, $otp, now()->addMinutes(10));
        
        // TODO: Integrate actual SMS/Email sending logic here depending on identifier type
        
        return $otp;
    }

    /**
     * Verifies the given OTP.
     * Returns a verification token if successful, false otherwise.
     */
    public function verifyOtp(string $identifier, string $otp): string|false
    {
        $cachedOtp = Cache::get('otp_' . $identifier);
        
        if ($cachedOtp && (string)$cachedOtp === $otp) {
            // Once verified, issue a temporary token (cache key) to allow password setting
            $verificationToken = bin2hex(random_bytes(16));
            
            // Store the identifier against this token for 15 minutes
            Cache::put('verified_token_' . $verificationToken, $identifier, now()->addMinutes(15));
            
            // Remove the used OTP
            Cache::forget('otp_' . $identifier);
            
            return $verificationToken;
        }
        
        return false;
    }
}
