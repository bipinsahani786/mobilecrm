<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

class SystemController extends BaseController
{
    /**
     * Get system logs
     */
    public function getLogs(): JsonResponse
    {
        $logPath = storage_path('logs/laravel.log');
        $logs = '';

        if (File::exists($logPath)) {
            // Get the last 1000 lines to prevent massive payloads
            $file = new \SplFileObject($logPath, 'r');
            $file->seek(PHP_INT_MAX);
            $totalLines = $file->key();
            
            $startLine = max(0, $totalLines - 1000);
            
            $file = new \SplFileObject($logPath, 'r');
            $file->seek($startLine);
            
            while (!$file->eof()) {
                $logs .= $file->current();
                $file->next();
            }
        } else {
            $logs = "No log file found at: " . $logPath;
        }

        return $this->success(
            ['logs' => $logs],
            'Logs retrieved successfully'
        );
    }

    /**
     * Clear system logs
     */
    public function clearLogs(): JsonResponse
    {
        $logPath = storage_path('logs/laravel.log');
        
        if (File::exists($logPath)) {
            File::put($logPath, '');
            return $this->success(null, 'Logs cleared successfully');
        }

        return $this->success(null, 'No log file found to clear');
    }

    /**
     * Clear application cache, views, and routes
     */
    public function clearCache(): JsonResponse
    {
        Artisan::call('optimize:clear');
        $output = Artisan::output();
        
        // Let's log this action
        \Log::info('Superadmin triggered cache clear.');

        return $this->success(
            ['output' => $output],
            'Application cache cleared successfully'
        );
    }

    /**
     * Optimize application for production
     */
    public function optimizeApp(): JsonResponse
    {
        Artisan::call('optimize');
        $output = Artisan::output();

        // Let's log this action
        \Log::info('Superadmin triggered application optimization.');

        return $this->success(
            ['output' => $output],
            'Application optimized successfully'
        );
    }
}
