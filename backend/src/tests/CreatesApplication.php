<?php

namespace Tests;

use Illuminate\Contracts\Console\Kernel;

trait CreatesApplication
{
    /**
     * Creates the application.
     *
     * @return \Illuminate\Foundation\Application
     */
    public function createApplication()
    {
        // Ensure APP_KEY is set for testing environment to avoid MissingAppKeyException
        if (empty(getenv('APP_KEY')) && empty($_ENV['APP_KEY'] ?? '')) {
            putenv('APP_KEY=testing');
            $_ENV['APP_KEY'] = 'testing';
        }

        $app = require __DIR__ . '/../bootstrap/app.php';

        $app->make(Kernel::class)->bootstrap();

        return $app;
    }
}
