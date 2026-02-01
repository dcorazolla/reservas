<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller as BaseController;
use Illuminate\Http\JsonResponse;

abstract class BaseApiController extends BaseController
{
    protected function ok($data, int $status = 200, array $headers = []): JsonResponse
    {
        return response()->json($data, $status, $headers);
    }

    protected function created($data, array $headers = []): JsonResponse
    {
        return response()->json($data, 201, $headers);
    }

    protected function noContent(array $headers = []): JsonResponse
    {
        return response()->json(null, 204, $headers);
    }
}
