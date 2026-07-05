<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\BaseController;
use App\Models\Template;
use App\Models\Lead;
use App\Jobs\SendBulkMessageJob;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class BulkMessageController extends BaseController
{
    #[OA\Post(
        path: '/superadmin/leads/bulk-message',
        summary: 'Send Bulk Message to Leads',
        description: 'Queue a bulk message (Email/WhatsApp) to selected leads using a template.',
        tags: ['Superadmin - Leads'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['lead_ids', 'template_id'],
                properties: [
                    new OA\Property(property: 'lead_ids', type: 'array', items: new OA\Items(type: 'integer')),
                    new OA\Property(property: 'template_id', type: 'integer')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Bulk message queued successfully'),
        ]
    )]
    public function send(Request $request)
    {
        $validated = $request->validate([
            'lead_ids' => 'required|array|min:1',
            'lead_ids.*' => 'integer|exists:leads,id',
            'template_id' => 'required|integer|exists:templates,id'
        ]);

        $template = Template::findOrFail($validated['template_id']);
        
        // Dispatch job to queue
        SendBulkMessageJob::dispatch($validated['lead_ids'], $template);

        return $this->success(null, 'Bulk message queued successfully. It will be sent in the background.');
    }
}
