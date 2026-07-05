<?php

namespace App\Http\Controllers\Api\Partner;

use App\Http\Controllers\Controller;
use App\Http\Controllers\BaseController;
use App\Models\PartnerResource;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

class ResourceController extends BaseController
{
    #[OA\Get(
        path: '/partner/resources',
        summary: 'List active marketing assets',
        description: 'Get a list of all active partner resources.',
        tags: ['Partner - Resources'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function index()
    {
        return $this->executeAction(function () {
            return PartnerResource::where('is_active', true)
                ->orderBy('created_at', 'desc')
                ->get();
        }, 'Active resources retrieved successfully.');
    }

    #[OA\Get(
        path: '/partner/resources/{id}/download',
        summary: 'Download a marketing asset',
        description: 'Download the file associated with a resource.',
        tags: ['Partner - Resources'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'File download'),
            new OA\Response(response: 404, description: 'File not found')
        ]
    )]
    public function download($id)
    {
        $resource = PartnerResource::where('is_active', true)->findOrFail($id);

        if (!Storage::disk('r2')->exists($resource->file_path)) {
            return $this->notFound('File not found in storage.');
        }

        return Storage::disk('r2')->download($resource->file_path, $resource->title . '.' . $resource->file_type);
    }
}
