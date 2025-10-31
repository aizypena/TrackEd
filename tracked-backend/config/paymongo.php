<?php

return [
    /*
    |--------------------------------------------------------------------------
    | PayMongo API Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the PayMongo API keys for payment processing.
    | Use TEST keys during development and LIVE keys in production.
    |
    */

    // Mode: 'test', 'live', or 'mock' (for development without actual API calls)
    'mode' => env('PAYMONGO_MODE', 'mock'),

    'test' => [
        'public_key' => env('PAYMONGO_TEST_PUBLIC_KEY', 'pk_test_8gnk9QyLRvu2VoWF7kyCwgK1'),
        'secret_key' => env('PAYMONGO_TEST_SECRET_KEY', 'sk_test_JZYAp8yTbg9oMyCRYvityErJ'),
    ],

    'live' => [
        'public_key' => env('PAYMONGO_LIVE_PUBLIC_KEY', 'pk_live_NiBWJ5kTw7fCi6NjVHVEuF9e'),
        'secret_key' => env('PAYMONGO_LIVE_SECRET_KEY', 'sk_live_Ze2ehgZPFRhokmpTakBLhhEF'),
    ],

    'api_url' => 'https://api.paymongo.com/v1',

    'webhook_secret' => env('PAYMONGO_WEBHOOK_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Payment Settings
    |--------------------------------------------------------------------------
    */

    'currency' => 'PHP',

    'payment_methods' => [
        'gcash',
        'paymaya',
        'card',
        'grab_pay',
    ],

    // Default enrollment fee when no voucher is available
    'enrollment_fee' => env('ENROLLMENT_FEE', 5000.00),
];
