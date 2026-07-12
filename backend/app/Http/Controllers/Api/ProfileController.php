<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\BaseController;
use App\Services\ProfileService;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ProfileController extends BaseController
{
    public function __construct(
        protected ProfileService $profileService
    ) {}

    #[OA\Get(
        path: '/profile',
        summary: 'Get Current User Profile',
        description: 'Returns the authenticated user\'s profile data.',
        tags: ['Profile'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Profile retrieved'),
        ]
    )]
    public function show(Request $request)
    {
        if ($tenantId = $request->header('X-Tenant-ID')) {
            setPermissionsTeamId($tenantId);
        }
        $profile = $this->profileService->getProfile($request->user());
        return $this->success($profile, 'Profile retrieved successfully');
    }

    #[OA\Patch(
        path: '/profile',
        summary: 'Update Profile',
        description: 'Update the authenticated user\'s name, email, or phone.',
        tags: ['Profile'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'email', type: 'string'),
                    new OA\Property(property: 'phone', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Profile updated'),
        ]
    )]
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'sometimes|nullable|string|max:20|unique:users,phone,' . $user->id,
        ]);

        $updatedUser = $this->profileService->updateProfile($user, $validated);

        return $this->success($updatedUser, 'Profile updated successfully.');
    }

    #[OA\Post(
        path: '/profile/avatar',
        summary: 'Upload Avatar',
        description: 'Upload or replace the user\'s profile photo to Cloudflare R2.',
        tags: ['Profile'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: 'avatar', type: 'string', format: 'binary'),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Avatar uploaded'),
        ]
    )]
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $avatarUrl = $this->profileService->uploadAvatar(
            $request->user(),
            $request->file('avatar')
        );

        return $this->success(['avatar' => $avatarUrl], 'Avatar uploaded successfully.');
    }

    #[OA\Delete(
        path: '/profile/avatar',
        summary: 'Remove Avatar',
        description: 'Remove the user\'s profile photo from R2.',
        tags: ['Profile'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Avatar removed'),
        ]
    )]
    public function removeAvatar(Request $request)
    {
        $this->profileService->removeAvatar($request->user());
        return $this->success(null, 'Avatar removed successfully.');
    }

    #[OA\Post(
        path: '/profile/password',
        summary: 'Change Password',
        description: 'Change the authenticated user\'s password.',
        tags: ['Profile'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                required: ['current_password', 'new_password', 'new_password_confirmation'],
                properties: [
                    new OA\Property(property: 'current_password', type: 'string'),
                    new OA\Property(property: 'new_password', type: 'string'),
                    new OA\Property(property: 'new_password_confirmation', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Password changed'),
            new OA\Response(response: 422, description: 'Validation failed'),
        ]
    )]
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:8|confirmed',
        ]);

        $changed = $this->profileService->changePassword(
            $request->user(),
            $request->current_password,
            $request->new_password
        );

        if (!$changed) {
            return $this->validationError(
                ['current_password' => ['The current password is incorrect.']],
                'Validation failed'
            );
        }

        return $this->success(null, 'Password changed successfully.');
    }
}
