<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\BaseController;
use App\Models\PartnerResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class PartnerResourceController extends BaseController
{
    #[OA\Get(
        path: '/superadmin/partner-resources',
        summary: 'List Partner Resources',
        description: 'Get a list of all partner resources.',
        tags: ['Superadmin - Partner Resources'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function index()
    {
        return $this->executeAction(function () {
            return PartnerResource::orderBy('created_at', 'desc')->get();
        }, 'Resources retrieved successfully.');
    }

    #[OA\Post(
        path: '/superadmin/partner-resources',
        summary: 'Create Partner Resource',
        description: 'Create a new marketing asset record after uploading the file via presigned URL.',
        tags: ['Superadmin - Partner Resources'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['title', 'file_path', 'file_type', 'file_size'],
                properties: [
                    new OA\Property(property: 'title', type: 'string'),
                    new OA\Property(property: 'description', type: 'string'),
                    new OA\Property(property: 'is_active', type: 'boolean'),
                    new OA\Property(property: 'file_path', type: 'string'),
                    new OA\Property(property: 'file_type', type: 'string'),
                    new OA\Property(property: 'file_size', type: 'integer')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Resource uploaded successfully')
        ]
    )]
    public function store(Request $request)
    {
        return $this->executeAction(function () use ($request) {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'file_path' => 'required|string',
                'file_type' => 'required|string',
                'file_size' => 'required|integer',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                throw new \Illuminate\Validation\ValidationException($validator);
            }

            $resource = PartnerResource::create([
                'title' => $request->title,
                'description' => $request->description,
                'file_path' => $request->file_path,
                'file_type' => $request->file_type,
                'file_size' => $request->file_size,
                'is_active' => $request->is_active ?? true,
            ]);

            return $resource;
        }, 'Resource uploaded successfully.');
    }

    #[OA\Get(
        path: '/superadmin/partner-resources/{id}',
        summary: 'Get Partner Resource',
        description: 'Get details of a specific partner resource.',
        tags: ['Superadmin - Partner Resources'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function show($id)
    {
        return $this->executeAction(function () use ($id) {
            $resource = PartnerResource::findOrFail($id);
            return $resource;
        }, 'Resource retrieved successfully.');
    }

    #[OA\Put(
        path: '/superadmin/partner-resources/{id}',
        summary: 'Update Partner Resource',
        description: 'Update an existing marketing asset after uploading the file via presigned URL.',
        tags: ['Superadmin - Partner Resources'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['title'],
                properties: [
                    new OA\Property(property: 'title', type: 'string'),
                    new OA\Property(property: 'description', type: 'string'),
                    new OA\Property(property: 'is_active', type: 'boolean'),
                    new OA\Property(property: 'file_path', type: 'string'),
                    new OA\Property(property: 'file_type', type: 'string'),
                    new OA\Property(property: 'file_size', type: 'integer')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Resource updated successfully')
        ]
    )]
    public function update(Request $request, $id)
    {
        return $this->executeAction(function () use ($request, $id) {
            $resource = PartnerResource::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'file_path' => 'nullable|string',
                'file_type' => 'nullable|string',
                'file_size' => 'nullable|integer',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                throw new \Illuminate\Validation\ValidationException($validator);
            }

            if ($request->has('file_path') && $request->file_path !== $resource->file_path) {
                // Delete old file from R2
                Storage::disk('s3')->delete($resource->file_path);

                $resource->file_path = $request->file_path;
                $resource->file_type = $request->file_type;
                $resource->file_size = $request->file_size;
            }

            $resource->title = $request->title;
            $resource->description = $request->description;
            if ($request->has('is_active')) {
                $resource->is_active = $request->is_active;
            }

            $resource->save();

            return $resource;
        }, 'Resource updated successfully.');
    }

    #[OA\Delete(
        path: '/superadmin/partner-resources/{id}',
        summary: 'Delete Partner Resource',
        description: 'Delete a marketing asset.',
        tags: ['Superadmin - Partner Resources'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Resource deleted successfully')
        ]
    )]
    public function destroy($id)
    {
        return $this->executeAction(function () use ($id) {
            $resource = PartnerResource::findOrFail($id);

            // Delete file from R2
            Storage::disk('s3')->delete($resource->file_path);

            $resource->delete();

            return null;
        }, 'Resource deleted successfully.');
    }
}
