<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StorageService
{
    protected string $disk = 's3'; // Cloudflare R2 via S3-compatible driver

    /**
     * Generate a presigned URL for secure frontend upload to Cloudflare R2 / S3
     */
    public function generatePresignedUrl(string $extension, string $folder = 'uploads'): array
    {
        $filename = $folder . '/' . Str::uuid() . '.' . $extension;
        
        $disk = Storage::disk($this->disk);
        
        $client = $disk->getClient();
        $bucket = config('filesystems.disks.s3.bucket');

        $command = $client->getCommand('PutObject', [
            'Bucket' => $bucket,
            'Key' => $filename,
        ]);

        // URL expires in 15 minutes
        $request = $client->createPresignedRequest($command, '+15 minutes');

        return [
            'upload_url' => (string) $request->getUri(),
            'path' => $filename,
            'public_url' => $disk->url($filename)
        ];
    }

    /**
     * Upload a file directly to R2 from the server.
     *
     * @param UploadedFile $file     The uploaded file
     * @param string       $folder   Target folder (e.g. 'avatars', 'logos')
     * @param string|null  $oldPath  Previous file path to delete (optional)
     * @return array{ path: string, url: string }
     */
    public function uploadFile(UploadedFile $file, string $folder = 'uploads', ?string $oldPath = null): array
    {
        // Delete old file if provided
        if ($oldPath) {
            $this->deleteFile($oldPath);
        }

        $filename = $folder . '/' . Str::uuid() . '.' . $file->getClientOriginalExtension();

        Storage::disk($this->disk)->put($filename, file_get_contents($file), 'public');

        return [
            'path' => $filename,
            'url'  => Storage::disk($this->disk)->url($filename),
        ];
    }

    /**
     * Delete a file from R2.
     *
     * @param string $path  The file path in the bucket
     * @return bool
     */
    public function deleteFile(string $path): bool
    {
        if ($path && Storage::disk($this->disk)->exists($path)) {
            return Storage::disk($this->disk)->delete($path);
        }
        return false;
    }

    /**
     * Get the public URL for a stored file.
     */
    public function getUrl(?string $path): ?string
    {
        if (!$path) return null;
        return Storage::disk($this->disk)->url($path);
    }
}

