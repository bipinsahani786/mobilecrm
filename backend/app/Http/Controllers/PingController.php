<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class PingController extends Controller
{
    #[OA\Get(
        path: '/ping',
        summary: 'Check API Health',
        description: 'Returns a simple JSON response to check if the API is running.',
        tags: ['Health'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation'
            )
        ]
    )]
    public function ping(): JsonResponse
    {
        return response()->json(['status' => 'ok']);
    }
}
