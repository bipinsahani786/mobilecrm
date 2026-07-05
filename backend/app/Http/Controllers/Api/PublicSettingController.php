<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\BaseController;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;

class PublicSettingController extends BaseController
{
    public function __construct(
        protected SettingService $settingService
    ) {}

    /**
     * Get all public settings.
     */
    public function index(): JsonResponse
    {
        $settings = $this->settingService->getAll();
        return $this->success($settings, 'Settings retrieved successfully.');
    }
}
