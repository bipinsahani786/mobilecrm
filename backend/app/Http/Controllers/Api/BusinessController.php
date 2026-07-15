<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Services\BusinessService;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

use App\Http\Controllers\BaseController;

class BusinessController extends BaseController
{
    public function __construct(protected BusinessService $businessService) {}

    #[OA\Get(
        path: '/businesses',
        summary: 'Get all businesses for user',
        tags: ['Businesses'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'List of businesses')
        ]
    )]
    public function index(Request $request)
    {
        return $this->success($this->businessService->getBusinessesForUser($request->user()));
    }

    #[OA\Post(
        path: '/businesses',
        summary: 'Create a new business',
        tags: ['Businesses'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'email', type: 'string'),
                    new OA\Property(property: 'phone', type: 'string'),
                    new OA\Property(property: 'address', type: 'string'),
                    new OA\Property(property: 'logo_path', type: 'string'),
                    new OA\Property(property: 'signature_path', type: 'string'),
                    new OA\Property(property: 'card_preferences', type: 'object')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Business created')
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|regex:/^\+?[0-9\s\-]{10,15}$/',
            'phone_2' => 'nullable|string|regex:/^\+?[0-9\s\-]{10,15}$/',
            'gst_number' => 'nullable|string|regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/',
            'address' => 'nullable|string',
            'pincode' => 'nullable|string|regex:/^[0-9]{6}$/',
            'state' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'business_type' => 'nullable|string|max:100',
            'business_category' => 'nullable|string|max:100',
            'books_opening_date' => 'nullable|date',
            'card_preferences' => 'nullable|array',
            'logo_path' => 'nullable|string',
            'signature_path' => 'nullable|string',
        ]);

        $business = $this->businessService->createBusiness($request->user(), $validated);

        return $this->created([
            'business' => $business
        ], 'Business created successfully');
    }

    #[OA\Get(
        path: '/businesses/{business}',
        summary: 'Get a specific business',
        tags: ['Businesses'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'business', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Business details')
        ]
    )]
    public function show(Request $request, Business $business)
    {
        if ($business->owner_id !== $request->user()->id && !$business->users()->where('user_id', $request->user()->id)->exists()) {
            return $this->forbidden('Unauthorized');
        }

        return $this->success($business);
    }

    #[OA\Put(
        path: '/businesses/{business}',
        summary: 'Update a business',
        tags: ['Businesses'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'business', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'card_preferences', type: 'object')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Business updated')
        ]
    )]
    public function update(Request $request, Business $business)
    {
        if ($business->owner_id !== $request->user()->id) {
            return $this->forbidden('Unauthorized. Only owner can update business details.');
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|regex:/^\+?[0-9\s\-]{10,15}$/',
            'phone_2' => 'nullable|string|regex:/^\+?[0-9\s\-]{10,15}$/',
            'gst_number' => 'nullable|string|regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/',
            'address' => 'nullable|string',
            'pincode' => 'nullable|string|regex:/^[0-9]{6}$/',
            'state' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'business_type' => 'nullable|string|max:100',
            'business_category' => 'nullable|string|max:100',
            'books_opening_date' => 'nullable|date',
            'card_preferences' => 'nullable|array',
            'logo_path' => 'nullable|string',
            'signature_path' => 'nullable|string',
            'settings' => 'nullable|array',
        ]);

        $business = $this->businessService->updateBusiness($business, $validated);

        return $this->success([
            'business' => $business
        ], 'Business updated successfully');
    }

    #[OA\Delete(
        path: '/businesses/{business}',
        summary: 'Delete a business',
        tags: ['Businesses'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'business', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Business deleted')
        ]
    )]
    public function destroy(Request $request, Business $business)
    {
        if ($business->owner_id !== $request->user()->id) {
            return $this->forbidden('Unauthorized');
        }

        $this->businessService->deleteBusiness($business);

        return $this->success(null, 'Business deleted successfully');
    }
}
