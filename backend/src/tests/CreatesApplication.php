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
            // Generate a valid 32-byte base64 key for encryption
            $random = base64_encode(random_bytes(32));
            putenv('APP_KEY=base64:'.$random);
            $_ENV['APP_KEY'] = 'base64:'.$random;
        }

        // Ensure JWT secret is set for jwt-auth package
        if (empty(getenv('JWT_SECRET')) && empty($_ENV['JWT_SECRET'] ?? '')) {
            $jwtSecret = bin2hex(random_bytes(16));
            putenv('JWT_SECRET='.$jwtSecret);
            $_ENV['JWT_SECRET'] = $jwtSecret;
        }

        $app = require __DIR__ . '/../bootstrap/app.php';

        $app->make(Kernel::class)->bootstrap();

        return $app;
    }
}
