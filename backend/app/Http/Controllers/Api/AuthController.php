<?php

namespace App\Http\Controllers\Api;

use App\Services\AuthService;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

use App\Http\Controllers\BaseController;

class AuthController extends BaseController
{
    /**
     * Strict validation rule for the identifier (email or 10-digit mobile)
     */
    private function getIdentifierRule(): array
    {
        return [
            'required',
            'string',
            function ($attribute, $value, $fail) {
                $isEmail = filter_var($value, FILTER_VALIDATE_EMAIL);
                $isPhone = preg_match('/^[0-9]{10}$/', $value);
                if (!$isEmail && !$isPhone) {
                    $fail('Please enter a valid Email address or a 10-digit Mobile Number.');
                }
            },
        ];
    }

    #[OA\Post(
        path: '/check-user',
        summary: 'Check if user exists',
        description: 'Checks if an email or phone number is already registered in the system.',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['identifier'],
                properties: [
                    new OA\Property(property: 'identifier', type: 'string', example: '9999999999')
                ]
            )
        ),
        tags: ['Authentication'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful check',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'exists', type: 'boolean', example: true)
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation error')
        ]
    )]
    public function checkUser(Request $request, \App\Actions\Auth\CheckUserExistsAction $action): JsonResponse
    {
        $request->validate([
            'identifier' => $this->getIdentifierRule(),
        ]);

        $exists = $action->execute($request->input('identifier'));

        return $this->success([
            'exists' => $exists
        ]);
    }

    #[OA\Post(
        path: '/send-otp',
        summary: 'Send OTP',
        description: 'Sends a 6-digit OTP to the provided Email or Mobile Number.',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['identifier'],
                properties: [
                    new OA\Property(property: 'identifier', type: 'string', description: 'Email or Mobile Number', example: '9999999999')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'OTP Sent successfully')
        ]
    )]
    public function sendOtp(Request $request, OtpService $otpService): JsonResponse
    {
        return $this->executeAction(function () use ($request, $otpService) {
            $data = $request->validate([
                'identifier' => $this->getIdentifierRule()
            ]);
            
            // For dev purposes, we return the OTP in the API response. Remove in production!
            $otp = $otpService->generateOtp($request->identifier);
            return ['otp' => $otp, 'message' => 'OTP sent to ' . $request->identifier];
        }, 'OTP Sent');
    }

    #[OA\Post(
        path: '/verify-otp',
        summary: 'Verify OTP',
        description: 'Verifies the OTP and returns a verification token to set the password.',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['identifier', 'otp'],
                properties: [
                    new OA\Property(property: 'identifier', type: 'string', example: '9999999999'),
                    new OA\Property(property: 'otp', type: 'string', example: '123456')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'OTP Verified'),
            new OA\Response(response: 400, description: 'Invalid OTP')
        ]
    )]
    public function verifyOtp(Request $request, OtpService $otpService): JsonResponse
    {
        $request->validate([
            'identifier' => $this->getIdentifierRule(),
            'otp' => 'required|string|size:6'
        ]);

        $token = $otpService->verifyOtp($request->identifier, $request->otp);

        if (!$token) {
            return $this->error('Invalid or expired OTP', 400);
        }

        return $this->success(['verification_token' => $token], 'OTP Verified Successfully');
    }

    #[OA\Post(
        path: '/set-password',
        summary: 'Set Password & Register',
        description: 'Creates the user account after OTP verification.',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['verification_token', 'name', 'password'],
                properties: [
                    new OA\Property(property: 'verification_token', type: 'string'),
                    new OA\Property(property: 'name', type: 'string', example: 'Business Owner'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', example: 'password123')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Registration successful')
        ]
    )]
    public function setPassword(Request $request, AuthService $authService): JsonResponse
    {
        return $this->executeAction(function () use ($request, $authService) {
            $data = $request->validate([
                'verification_token' => 'required|string',
                'name' => 'required|string|min:2|max:100',
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'regex:/[A-Z]/', // Must contain at least one uppercase letter
                    'regex:/[0-9]/', // Must contain at least one number
                ]
            ], [
                'password.regex' => 'The password must contain at least one uppercase letter and one number.'
            ]);

            return $authService->registerUser($data['verification_token'], $data);
        }, 'Registration successful');
    }

    #[OA\Post(
        path: '/login',
        summary: 'Login User',
        description: 'Logs in a user using Email/Mobile and Password.',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['identifier', 'password'],
                properties: [
                    new OA\Property(property: 'identifier', type: 'string', description: 'Email or Mobile', example: 'superadmin@mobilecrm.com'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', example: 'password123')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Successful login')
        ]
    )]
    public function login(Request $request, AuthService $authService): JsonResponse
    {
        return $this->executeAction(function () use ($request, $authService) {
            $credentials = $request->validate([
                'identifier' => $this->getIdentifierRule(),
                'password' => 'required',
            ]);

            return $authService->login($credentials);
        }, 'Login successful');
    }

    #[OA\Post(
        path: '/logout',
        summary: 'Logout User',
        description: 'Revokes the current user access token.',
        tags: ['Authentication'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Successful logout')
        ]
    )]
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return $this->success(null, 'Logged out successfully');
    }
}
