<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Ajustado para incluir endpoints de propriedades que estão no root
    | (ex.: `/properties`) além do padrão `api/*`.
    |
    */

    'paths' => [
        'api/*',
        'properties',
        'properties/*',
        'properties/pricing',
        'sanctum/csrf-cookie',
    ],

    'allowed_methods' => ['*'],

    // Em desenvolvimento permita apenas o origin do Vite dev server.
    // Em produção prefira registrar os domínios reais da aplicação.
    'allowed_origins' => [env('CORS_ALLOWED_ORIGIN', 'http://localhost:5173')],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
