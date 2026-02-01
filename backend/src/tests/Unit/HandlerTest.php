<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Exceptions\Handler;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\QueryException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class HandlerTest extends TestCase
{
    public function test_render_returns_json_for_validation_exception()
    {
        $request = Request::create('/api/test', 'GET');

        $ex = ValidationException::withMessages(['field' => ['Mensagem inválida']]);

        $handler = new Handler(app());
        $resp = $handler->render($request, $ex);

        $this->assertEquals(422, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals('Dados inválidos', $data['message']);
        $this->assertArrayHasKey('errors', $data);
    }

    public function test_render_translates_query_exception_to_conflict()
    {
        $request = Request::create('/api/test', 'GET');
            $qe = new QueryException('testing', 'sql', [], new \Exception('dup'));
        // ensure errorInfo indicates constraint violation
        $qe->errorInfo = ['23000', null, null];

        $handler = new Handler(app());
        $resp = $handler->render($request, $qe);

        $this->assertEquals(409, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertStringContainsString('Violação de restrição', $data['message']);
    }

    public function test_render_uses_http_exception_status()
    {
        $request = Request::create('/api/test', 'GET');
        $notFound = new NotFoundHttpException('rota não encontrada');

        $handler = new Handler(app());
        $resp = $handler->render($request, $notFound);

        $this->assertEquals(404, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals('rota não encontrada', $data['message']);
    }

    public function test_render_validation_exception_returns_json_with_errors()
    {
        $request = \Illuminate\Http\Request::create('/api/test', 'POST');

        try {
            \Illuminate\Support\Facades\Validator::make(['email' => 'not-an-email'], ['email' => 'email'])->validate();
            $this->fail('ValidationException expected');
        } catch (ValidationException $e) {
            $handler = $this->app->make(\App\Exceptions\Handler::class);
            $response = $handler->render($request, $e);

            $this->assertInstanceOf(\Illuminate\Http\JsonResponse::class, $response);
            $this->assertEquals(422, $response->getStatusCode());
            $data = $response->getData(true);
            $this->assertArrayHasKey('errors', $data);
        }
    }
}

