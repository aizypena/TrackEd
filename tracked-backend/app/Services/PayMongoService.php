<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayMongoService
{
    protected $secretKey;
    protected $publicKey;
    protected $apiUrl;

    public function __construct()
    {
        $mode = config('paymongo.mode', 'test');
        $this->secretKey = config("paymongo.{$mode}.secret_key");
        $this->publicKey = config("paymongo.{$mode}.public_key");
        $this->apiUrl = config('paymongo.api_url');
    }

    /**
     * Create a PaymentIntent for e-wallet payments (GCash, PayMaya, GrabPay)
     */
    public function createPaymentIntent($amount, $description, $paymentMethod = 'gcash')
    {
        try {
            // Normalize payment method names for PayMongo API
            $normalizedMethod = $paymentMethod;
            if ($paymentMethod === 'maya') {
                $normalizedMethod = 'paymaya';
            }
            
            Log::info('Creating PaymentIntent', [
                'amount' => $amount,
                'method' => $normalizedMethod,
                'original_method' => $paymentMethod,
                'description' => $description
            ]);
            
            $response = Http::withBasicAuth($this->secretKey, '')
                ->post("{$this->apiUrl}/payment_intents", [
                    'data' => [
                        'attributes' => [
                            'amount' => $amount * 100, // Convert to centavos
                            'payment_method_allowed' => [$normalizedMethod], // Array of allowed methods
                            'currency' => 'PHP',
                            'description' => $description,
                            'capture_type' => 'automatic',
                        ]
                    ]
                ]);

            Log::info('PaymentIntent Response', [
                'status' => $response->status(),
                'body' => $response->json()
            ]);

            if ($response->successful()) {
                $responseData = $response->json();
                $data = $responseData['data'];
                
                // For e-wallets like GCash, PayMaya, GrabPay, we need to attach payment method
                if (in_array($normalizedMethod, ['gcash', 'paymaya', 'grab_pay'])) {
                    $paymentIntentId = $data['id'];
                    $clientKey = $data['attributes']['client_key'];
                    
                    Log::info('Creating payment method for e-wallet', [
                        'payment_intent_id' => $paymentIntentId,
                        'method' => $normalizedMethod
                    ]);
                    
                    // Create payment method
                    $pmResponse = Http::withBasicAuth($this->publicKey, '')
                        ->post("{$this->apiUrl}/payment_methods", [
                            'data' => [
                                'attributes' => [
                                    'type' => $normalizedMethod,
                                ]
                            ]
                        ]);
                    
                    Log::info('Payment Method Response', [
                        'status' => $pmResponse->status(),
                        'body' => $pmResponse->json()
                    ]);
                    
                    if ($pmResponse->successful()) {
                        $paymentMethodData = $pmResponse->json();
                        $paymentMethodId = $paymentMethodData['data']['id'];
                        
                        Log::info('Attaching payment method to intent', [
                            'payment_intent_id' => $paymentIntentId,
                            'payment_method_id' => $paymentMethodId
                        ]);
                        
                        // Attach payment method to payment intent
                        $attachResponse = Http::withBasicAuth($this->secretKey, '')
                            ->post("{$this->apiUrl}/payment_intents/{$paymentIntentId}/attach", [
                                'data' => [
                                    'attributes' => [
                                        'payment_method' => $paymentMethodId,
                                        'client_key' => $clientKey,
                                        'return_url' => 'https://smitracked.cloud/staff/payment-callback',
                                    ]
                                ]
                            ]);
                        
                        Log::info('Attach Response', [
                            'status' => $attachResponse->status(),
                            'body' => $attachResponse->json()
                        ]);
                        
                        if ($attachResponse->successful()) {
                            $attachData = $attachResponse->json();
                            
                            // Extract checkout URL
                            $checkoutUrl = $attachData['data']['attributes']['next_action']['redirect']['url'] ?? null;
                            
                            Log::info('Checkout URL generated', ['url' => $checkoutUrl]);
                            
                            return [
                                'success' => true,
                                'data' => $attachData,
                                'redirect_url' => $checkoutUrl
                            ];
                        } else {
                            Log::error('Failed to attach payment method', [
                                'status' => $attachResponse->status(),
                                'error' => $attachResponse->json()
                            ]);
                        }
                    } else {
                        Log::error('Failed to create payment method', [
                            'status' => $pmResponse->status(),
                            'error' => $pmResponse->json()
                        ]);
                    }
                }
                
                return [
                    'success' => true,
                    'data' => $responseData
                ];
            }

            Log::error('PaymentIntent creation failed', [
                'status' => $response->status(),
                'error' => $response->json()
            ]);

            return [
                'success' => false,
                'error' => $response->json()
            ];
        } catch (Exception $e) {
            Log::error('PayMongo createPaymentIntent exception: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Create a PaymentMethod for card payments
     */
    public function createPaymentMethod($cardDetails)
    {
        try {
            $response = Http::withBasicAuth($this->publicKey, '')
                ->post("{$this->apiUrl}/payment_methods", [
                    'data' => [
                        'attributes' => [
                            'type' => 'card',
                            'details' => $cardDetails,
                            'billing' => $cardDetails['billing'] ?? null
                        ]
                    ]
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()
            ];
        } catch (Exception $e) {
            Log::error('PayMongo createPaymentMethod error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Attach PaymentIntent to PaymentMethod (for e-wallet)
     */
    public function attachPaymentIntent($paymentIntentId, $paymentMethodId)
    {
        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->post("{$this->apiUrl}/payment_intents/{$paymentIntentId}/attach", [
                    'data' => [
                        'attributes' => [
                            'payment_method' => $paymentMethodId,
                            'return_url' => config('app.url') . '/payment/callback'
                        ]
                    ]
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()
            ];
        } catch (Exception $e) {
            Log::error('PayMongo attachPaymentIntent error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Retrieve PaymentIntent status
     */
    public function getPaymentIntent($paymentIntentId)
    {
        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->get("{$this->apiUrl}/payment_intents/{$paymentIntentId}");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()
            ];
        } catch (Exception $e) {
            Log::error('PayMongo getPaymentIntent error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get a Checkout Session by ID
     */
    public function getCheckoutSession($checkoutSessionId)
    {
        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->get("{$this->apiUrl}/checkout_sessions/{$checkoutSessionId}");

            Log::info('Checkout Session Retrieval', [
                'session_id' => $checkoutSessionId,
                'status' => $response->status(),
                'body' => $response->json()
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()
            ];
        } catch (Exception $e) {
            Log::error('Failed to get checkout session', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Create a Source (for e-wallet payments - alternative method)
     */
    public function createSource($amount, $type = 'gcash', $redirectUrls = [])
    {
        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->post("{$this->apiUrl}/sources", [
                    'data' => [
                        'attributes' => [
                            'amount' => $amount * 100, // Convert to centavos
                            'redirect' => [
                                'success' => $redirectUrls['success'] ?? config('app.url') . '/payment/success',
                                'failed' => $redirectUrls['failed'] ?? config('app.url') . '/payment/failed',
                            ],
                            'type' => $type,
                            'currency' => 'PHP',
                        ]
                    ]
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()
            ];
        } catch (Exception $e) {
            Log::error('PayMongo createSource error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Create a Payment using a Source
     */
    public function createPayment($sourceId, $amount, $description)
    {
        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->post("{$this->apiUrl}/payments", [
                    'data' => [
                        'attributes' => [
                            'amount' => $amount * 100, // Convert to centavos
                            'source' => [
                                'id' => $sourceId,
                                'type' => 'source'
                            ],
                            'currency' => 'PHP',
                            'description' => $description,
                        ]
                    ]
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()
            ];
        } catch (Exception $e) {
            Log::error('PayMongo createPayment error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Retrieve a Payment
     */
    public function getPayment($paymentId)
    {
        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->get("{$this->apiUrl}/payments/{$paymentId}");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()
            ];
        } catch (Exception $e) {
            Log::error('PayMongo getPayment error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Create a refund
     */
    public function createRefund($paymentId, $amount, $reason)
    {
        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->post("{$this->apiUrl}/refunds", [
                    'data' => [
                        'attributes' => [
                            'amount' => $amount * 100, // Convert to centavos
                            'payment_id' => $paymentId,
                            'reason' => $reason,
                        ]
                    ]
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()
            ];
        } catch (Exception $e) {
            Log::error('PayMongo createRefund error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Verify webhook signature
     */
    public function verifyWebhookSignature($payload, $signature)
    {
        $webhookSecret = config('paymongo.webhook_secret');
        
        if (!$webhookSecret) {
            return false;
        }

        $computedSignature = hash_hmac('sha256', $payload, $webhookSecret);
        
        return hash_equals($computedSignature, $signature);
    }
}
