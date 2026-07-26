<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CleanupAttendancePhotos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:cleanup-photos';

    protected $description = 'Clean up old attendance photos based on business plan retention policies.';

    public function handle()
    {
        $this->info('Starting attendance photo cleanup...');
        
        $businesses = \App\Models\Business::with('plan')->get();
        $totalPhotosDeleted = 0;

        foreach ($businesses as $business) {
            $plan = $business->plan;
            if (!$plan) continue;

            $features = $plan->features ?? [];
            $retentionDays = isset($features['attendance_photo_retention_days']) ? (int)$features['attendance_photo_retention_days'] : 0;

            if ($retentionDays > 0) {
                $cutoffDate = \Carbon\Carbon::now()->subDays($retentionDays)->format('Y-m-d');

                $attendances = \App\Models\Attendance::where('business_id', $business->id)
                    ->where('date', '<', $cutoffDate)
                    ->where(function($q) {
                        $q->whereNotNull('check_in_photo')->orWhereNotNull('check_out_photo');
                    })->get();

                foreach ($attendances as $attendance) {
                    if ($attendance->check_in_photo) {
                        \Illuminate\Support\Facades\Storage::disk('public')->delete($attendance->check_in_photo);
                        $attendance->check_in_photo = null;
                        $totalPhotosDeleted++;
                    }
                    
                    if ($attendance->check_out_photo) {
                        \Illuminate\Support\Facades\Storage::disk('public')->delete($attendance->check_out_photo);
                        $attendance->check_out_photo = null;
                        $totalPhotosDeleted++;
                    }

                    $attendance->save();
                }
            }
        }

        $this->info("Cleanup completed. Deleted {$totalPhotosDeleted} old photos.");
    }
}
