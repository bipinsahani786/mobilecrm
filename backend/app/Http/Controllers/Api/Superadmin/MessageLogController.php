<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\BaseController;
use App\Models\MessageLog;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class MessageLogController extends BaseController
{
    #[OA\Get(
        path: '/superadmin/message-logs',
        summary: 'List Message Logs',
        description: 'Get paginated history of sent messages.',
        tags: ['Superadmin - Message Logs'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Message logs retrieved successfully'),
        ]
    )]
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 15);
        $type = $request->query('type');
        $status = $request->query('status');

        $query = MessageLog::with(['lead:id,business_name,contact_person,email,phone', 'template:id,name']);

        if ($type) {
            $query->where('type', $type);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return $this->success($logs, 'Message logs retrieved successfully.');
    }
}
