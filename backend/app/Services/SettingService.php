<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;

class SettingService
{
    public function __construct(
        protected StorageService $storageService
    ) {}

    /**
     * Get all public settings.
     */
    public function getAll(): array
    {
        return Cache::rememberForever('global_settings', function () {
            $settings = Setting::all();
            $result = [];
            foreach ($settings as $setting) {
                $result[$setting->key] = $setting->value;
            }
            return $result;
        });
    }

    /**
     * Update a batch of settings.
     */
    public function updateMany(array $data): void
    {
        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'type' => 'string']
            );
        }
        
        Cache::forget('global_settings');
    }

    /**
     * Upload a setting file (like a logo).
     */
    public function uploadFile(string $key, UploadedFile $file): string
    {
        $setting = Setting::firstWhere('key', $key);
        $oldPath = $setting ? $setting->getRawOriginal('value') : null;

        $result = $this->storageService->uploadFile(
            $file,
            'settings',
            $oldPath
        );

        Setting::updateOrCreate(
            ['key' => $key],
            ['value' => $result['path'], 'type' => 'file']
        );

        Cache::forget('global_settings');

        return $result['url'];
    }
}
