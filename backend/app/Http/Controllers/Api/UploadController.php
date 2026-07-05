<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StorageService;
use Illuminate\Http\Request;

use OpenApi\Attributes as OA;

use App\Http\Controllers\BaseController;

class UploadController extends BaseController
{
    public function __construct(protected StorageService $storageService)
    {
    }

    #[OA\Post(
        path: '/upload/presigned-url',
        summary: 'Generate a presigned URL for direct S3/R2 uploads',
        tags: ['Uploads'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'extension', type: 'string', example: 'png', description: 'File extension without dot'),
                    new OA\Property(property: 'folder', type: 'string', example: 'businesses/logos', description: 'Target folder in bucket')
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Presigned URL generated successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'upload_url', type: 'string', description: 'URL to PUT the file to'),
                        new OA\Property(property: 'path', type: 'string', description: 'Path to save in the database'),
                        new OA\Property(property: 'public_url', type: 'string', description: 'Publicly accessible URL')
                    ]
                )
            )
        ]
    )]
    public function getPresignedUrl(Request $request)
    {
        $validated = $request->validate([
            'extension' => 'required|string|max:10',
            'folder' => 'nullable|string|max:100',
        ]);

        $folder = $validated['folder'] ?? 'uploads';

        // Prevent directory traversal attacks
        $folder = str_replace(['..', '.', '\\'], '', $folder);

        $result = $this->storageService->generatePresignedUrl($validated['extension'], $folder);

        return $this->success($result);
    }
}
