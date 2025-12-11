<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Xendit API Keys
    |--------------------------------------------------------------------------
    |
    | Your Xendit API keys for payment processing.
    |
    */

    'secret_key' => env('XENDIT_SECRET_KEY', ''),
    'public_key' => env('XENDIT_PUBLIC_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | Xendit API URL
    |--------------------------------------------------------------------------
    |
    | The base URL for Xendit API calls.
    |
    */

    'api_url' => env('XENDIT_API_URL', 'https://api.xendit.co'),

    /*
    |--------------------------------------------------------------------------
    | Webhook Verification Token
    |--------------------------------------------------------------------------
    |
    | Token used to verify webhook callbacks from Xendit.
    | You can get this from your Xendit dashboard.
    |
    */

    'webhook_verification_token' => env('XENDIT_WEBHOOK_VERIFICATION_TOKEN', ''),

    /*
    |--------------------------------------------------------------------------
    | Default Enrollment Fee
    |--------------------------------------------------------------------------
    |
    | Default enrollment fee if not specified by program.
    |
    */

    'enrollment_fee' => env('XENDIT_DEFAULT_ENROLLMENT_FEE', 5000.00),

    /*
    |--------------------------------------------------------------------------
    | Callback URLs
    |--------------------------------------------------------------------------
    |
    | URLs for payment callbacks.
    |
    */

    'success_redirect_url' => env('XENDIT_SUCCESS_REDIRECT_URL', 'https://smitracked.cloud/staff/payment-callback'),
    'failure_redirect_url' => env('XENDIT_FAILURE_REDIRECT_URL', 'https://smitracked.cloud/staff/payment-failed'),
];
