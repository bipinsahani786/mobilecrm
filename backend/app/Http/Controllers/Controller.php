<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(version: "1.0.0", description: "MobileCRM API", title: "MobileCRM API Documentation")]
#[OA\Server(url: 'http://localhost:8000/api/v1', description: "Local API Server")]
#[OA\SecurityScheme(
    securityScheme: 'sanctum',
    type: 'http',
    scheme: 'bearer',
    description: 'Enter your Bearer Token to authenticate'
)]
/**
 * @OA\Info(
 *      version="1.0.0",
 *      title="Mobile & Electronics Shop CRM API",
 *      description="API Documentation for Mobile & Electronics Shop CRM",
 * )
 * @OA\Server(
 *      url=L5_SWAGGER_CONST_HOST,
 *      description="Main API Server"
 * )
 */
abstract class Controller
{
    //
}
