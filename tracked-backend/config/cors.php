<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:8000', 'https://smitracked.cloud', 'http://127.0.0.1:5173', 'https://www.smitracked.cloud', 'https://smitracked.cloud', 'https://smitracked.cloud'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];