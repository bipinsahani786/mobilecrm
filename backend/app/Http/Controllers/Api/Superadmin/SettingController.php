<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\BaseController;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends BaseController
{
    public function __construct(
        protected SettingService $settingService
    ) {
    }

    /**
     * Update settings.
     */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'settings' => 'required|array',
            'settings.*' => 'nullable|string',
        ]);

        $this->settingService->updateMany($data['settings']);

        return $this->success(
            $this->settingService->getAll(),
            'Settings updated successfully.'
        );
    }

    /**
     * Upload a setting file (e.g. logo).
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,svg,webp|max:2048',
        ]);

        $url = $this->settingService->uploadFile('app_logo', $request->file('logo'));

        return $this->success(
            ['url' => $url],
            'Logo uploaded successfully.'
        );
    }
}
