<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\BaseController;
use App\Models\Template;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class TemplateController extends BaseController
{
    #[OA\Get(
        path: '/superadmin/templates',
        summary: 'List Templates',
        description: 'Get all message templates (email, whatsapp).',
        tags: ['Superadmin - Templates'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Templates retrieved successfully'),
        ]
    )]
    public function index(Request $request)
    {
        $type = $request->query('type');
        $query = Template::query();
        
        if ($type) {
            $query->where('type', $type);
        }

        $templates = $query->orderBy('created_at', 'desc')->get();
        return $this->success($templates, 'Templates retrieved successfully.');
    }

    #[OA\Post(
        path: '/superadmin/templates',
        summary: 'Create Template',
        description: 'Create a new message template.',
        tags: ['Superadmin - Templates'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'type', 'body'],
                properties: [
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'type', type: 'string', enum: ['email', 'whatsapp']),
                    new OA\Property(property: 'subject', type: 'string'),
                    new OA\Property(property: 'body', type: 'string'),
                    new OA\Property(property: 'variables', type: 'array', items: new OA\Items(type: 'string')),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Template created successfully'),
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:email,whatsapp',
            'subject' => 'nullable|string|max:255',
            'body' => 'required|string',
            'variables' => 'nullable|array',
            'variables.*' => 'string'
        ]);

        $template = Template::create($validated);
        return $this->success($template, 'Template created successfully.', 201);
    }

    #[OA\Patch(
        path: '/superadmin/templates/{id}',
        summary: 'Update Template',
        description: 'Update an existing template.',
        tags: ['Superadmin - Templates'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Template updated successfully'),
        ]
    )]
    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'subject' => 'nullable|string|max:255',
            'body' => 'sometimes|string',
            'variables' => 'nullable|array',
            'variables.*' => 'string'
        ]);

        try {
            $template = Template::findOrFail($id);
            $template->update($validated);
            return $this->success($template, 'Template updated successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Template not found.');
        }
    }

    #[OA\Delete(
        path: '/superadmin/templates/{id}',
        summary: 'Delete Template',
        description: 'Delete an existing template.',
        tags: ['Superadmin - Templates'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Template deleted successfully'),
        ]
    )]
    public function destroy(int $id)
    {
        try {
            $template = Template::findOrFail($id);
            $template->delete();
            return $this->success(null, 'Template deleted successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Template not found.');
        }
    }
}
