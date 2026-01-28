<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class Handler extends ExceptionHandler
{
    protected $levels = [
        //
    ];

    protected $dontReport = [
        //
    ];

    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        //
    }

    public function render($request, Throwable $e): Response
    {
        // Force JSON for API routes or when client requests JSON
        if ($request instanceof Request && ($request->is('api/*') || $request->wantsJson())) {
            $status = 500;
            $payload = [
                'message' => 'Erro inesperado',
            ];

            if ($e instanceof ValidationException) {
                $status = 422;
                $payload['message'] = 'Dados inválidos';
                $payload['errors'] = $e->errors();
            } elseif ($e instanceof QueryException) {
                // Handle DB constraint violations
                $sqlState = $e->errorInfo[0] ?? null;
                if ($sqlState === '23000') {
                    $status = 409;
                    $payload['message'] = 'Violação de restrição de integridade (duplicado ou conflito).';
                }
            } elseif ($e instanceof HttpExceptionInterface) {
                $status = $e->getStatusCode();
                $payload['message'] = $e->getMessage() ?: Response::$statusTexts[$status] ?? 'Erro';
            } else {
                $payload['message'] = $e->getMessage() ?: $payload['message'];
            }

            return new JsonResponse($payload, $status);
        }

        return parent::render($request, $e);
    }
}
