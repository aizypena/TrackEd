<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class XenditService
{
    protected $secretKey;
    protected $publicKey;
    protected $apiUrl;

    public function __construct()
    {
        $this->secretKey = config('xendit.secret_key');
        $this->publicKey = config('xendit.public_key');
        $this->apiUrl = config('xendit.api_url', 'https://api.xendit.co');
    }

    /**
     * Create an e-wallet charge (GCash, Maya/PayMaya, ShopeePay, GrabPay)
     * Uses the Xendit Payment Request API v3
     */
    public function createEWalletCharge($amount, $referenceId, $channelCode, $description, $successRedirectUrl, $failureRedirectUrl)
    {
        try {
            // Map payment method to Xendit channel code
            $xenditChannelCode = $this->mapChannelCode($channelCode);
            
            Log::info('Creating Xendit Payment Request', [
                'amount' => $amount,
                'reference_id' => $referenceId,
                'channel_code' => $xenditChannelCode,
                'description' => $description
            ]);

            // Build channel properties - some e-wallets require additional URLs
            $channelProperties = [
                'success_return_url' => $successRedirectUrl,
                'failure_return_url' => $failureRedirectUrl,
            ];
            
            // PayMaya requires cancel_return_url
            if (in_array($xenditChannelCode, ['PAYMAYA', 'PH_PAYMAYA'])) {
                $channelProperties['cancel_return_url'] = $failureRedirectUrl;
            }

            // Use the Payment Request API v3
            $payload = [
                'reference_id' => $referenceId,
                'amount' => (float) $amount,
                'currency' => 'PHP',
                'country' => 'PH',
                'payment_method' => [
                    'type' => 'EWALLET',
                    'ewallet' => [
                        'channel_code' => $xenditChannelCode,
                        'channel_properties' => $channelProperties
                    ],
                    'reusability' => 'ONE_TIME_USE'
                ],
                'description' => $description,
                'metadata' => [
                    'source' => 'TrackEd'
                ]
            ];

            $response = Http::withBasicAuth($this->secretKey, '')
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'api-version' => '2022-07-31',
                ])
                ->post("{$this->apiUrl}/payment_requests", $payload);

            Log::info('Xendit Payment Request Response', [
                'status' => $response->status(),
                'body' => $response->json()
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                // Get the redirect URL from actions
                $redirectUrl = null;
                if (isset($data['actions']) && is_array($data['actions'])) {
                    foreach ($data['actions'] as $action) {
                        if (isset($action['url'])) {
                            $redirectUrl = $action['url'];
                            break;
                        }
                    }
                }
                
                return [
                    'success' => true,
                    'data' => $data,
                    'charge_id' => $data['id'] ?? null,
                    'reference_id' => $data['reference_id'] ?? null,
                    'status' => $data['status'] ?? null,
                    'redirect_url' => $redirectUrl
                ];
            }

            Log::error('Xendit Payment Request creation failed', [
                'status' => $response->status(),
                'error' => $response->json()
            ]);

            return [
                'success' => false,
                'error' => $response->json()['message'] ?? 'Failed to create payment request'
            ];

        } catch (Exception $e) {
            Log::error('Xendit E-Wallet Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Create an invoice (supports multiple payment methods)
     */
    public function createInvoice($externalId, $amount, $payerEmail, $description, $successRedirectUrl, $failureRedirectUrl, $paymentMethods = [])
    {
        try {
            Log::info('Creating Xendit Invoice', [
                'external_id' => $externalId,
                'amount' => $amount,
                'payer_email' => $payerEmail,
                'description' => $description
            ]);

            $payload = [
                'external_id' => $externalId,
                'amount' => $amount,
                'payer_email' => $payerEmail,
                'description' => $description,
                'currency' => 'PHP',
                'success_redirect_url' => $successRedirectUrl,
                'failure_redirect_url' => $failureRedirectUrl,
            ];

            // Add specific payment methods if provided
            if (!empty($paymentMethods)) {
                $payload['payment_methods'] = $paymentMethods;
            }

            $response = Http::withBasicAuth($this->secretKey, '')
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->apiUrl}/v2/invoices", $payload);

            Log::info('Xendit Invoice Response', [
                'status' => $response->status(),
                'body' => $response->json()
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                return [
                    'success' => true,
                    'data' => $data,
                    'invoice_id' => $data['id'] ?? null,
                    'external_id' => $data['external_id'] ?? null,
                    'status' => $data['status'] ?? null,
                    'invoice_url' => $data['invoice_url'] ?? null
                ];
            }

            Log::error('Xendit Invoice creation failed', [
                'status' => $response->status(),
                'error' => $response->json()
            ]);

            return [
                'success' => false,
                'error' => $response->json()['message'] ?? 'Failed to create invoice'
            ];

        } catch (Exception $e) {
            Log::error('Xendit Invoice Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get payment request status (for e-wallet charges)
     */
    public function getEWalletChargeStatus($chargeId)
    {
        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->withHeaders([
                    'api-version' => '2022-07-31',
                ])
                ->get("{$this->apiUrl}/payment_requests/{$chargeId}");

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'data' => $data,
                    'status' => $data['status'] ?? null
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()['message'] ?? 'Failed to get payment status'
            ];

        } catch (Exception $e) {
            Log::error('Xendit Get Charge Status Exception', [
                'message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get invoice status
     */
    public function getInvoiceStatus($invoiceId)
    {
        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->get("{$this->apiUrl}/v2/invoices/{$invoiceId}");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()['message'] ?? 'Failed to get invoice status'
            ];

        } catch (Exception $e) {
            Log::error('Xendit Get Invoice Status Exception', [
                'message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Map internal payment method to Xendit channel code
     * For Payment Request API v3, Philippines e-wallet channel codes are without country prefix
     */
    protected function mapChannelCode($paymentMethod)
    {
        $mapping = [
            'gcash' => 'GCASH',
            'maya' => 'PAYMAYA',
            'paymaya' => 'PAYMAYA',
            'grabpay' => 'GRABPAY',
            'grab_pay' => 'GRABPAY',
            'shopeepay' => 'SHOPEEPAY',
        ];

        return $mapping[strtolower($paymentMethod)] ?? strtoupper($paymentMethod);
    }

    /**
     * Verify webhook callback signature
     */
    public function verifyWebhookSignature($payload, $signature)
    {
        $webhookVerificationToken = config('xendit.webhook_verification_token');
        
        if (!$webhookVerificationToken) {
            Log::warning('Xendit webhook verification token not configured');
            return true; // Skip verification if not configured
        }

        $computedSignature = hash('sha256', $webhookVerificationToken . $payload);
        
        return hash_equals($computedSignature, $signature);
    }
}
