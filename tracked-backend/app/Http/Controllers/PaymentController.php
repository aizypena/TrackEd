<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\User;
use App\Models\Batch;
use App\Models\Voucher;
use App\Services\PayMongoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    protected $payMongoService;

    public function __construct(PayMongoService $payMongoService)
    {
        $this->payMongoService = $payMongoService;
    }

    /**
     * Check if payment is required for a specific batch
     */
    public function checkPaymentRequired(Request $request)
    {
        $request->validate([
            'batch_id' => 'required|exists:batches,batch_id',
            'user_id' => 'required|exists:users,id'
        ]);

        // Get the batch and its program
        $batch = Batch::where('batch_id', $request->batch_id)->with('program')->first();
        
        // Get enrollment fee from the program's pricing
        $enrollmentFee = 5000.00; // Default fallback
        if ($batch && $batch->program && $batch->program->pricing) {
            $enrollmentFee = floatval($batch->program->pricing);
        }

        $voucher = Voucher::where('batch_id', $request->batch_id)
            ->whereRaw('used_count < quantity')
            ->whereIn('status', ['pending', 'issued', 'active'])
            ->first();

        Log::info('Payment check:', [
            'batch_id' => $request->batch_id,
            'program_id' => $batch ? $batch->program_id : null,
            'program_pricing' => $batch && $batch->program ? $batch->program->pricing : null,
            'enrollment_fee' => $enrollmentFee,
            'voucher_found' => $voucher !== null,
            'voucher_details' => $voucher ? [
                'id' => $voucher->id,
                'quantity' => $voucher->quantity,
                'used_count' => $voucher->used_count,
                'status' => $voucher->status,
                'remaining' => $voucher->quantity - $voucher->used_count
            ] : null
        ]);

        $voucherAvailable = $voucher !== null;

        return response()->json([
            'success' => true,
            'payment_required' => !$voucherAvailable,
            'voucher_available' => $voucherAvailable,
            'enrollment_fee' => $enrollmentFee,
            'vouchers_remaining' => $voucherAvailable ? ($voucher->quantity - $voucher->used_count) : 0
        ]);
    }

    /**
     * Create a payment intent for enrollment
     */
    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'batch_id' => 'required|exists:batches,batch_id',
            'payment_method' => 'required|in:gcash,paymaya,card,grab_pay',
            'amount' => 'nullable|numeric|min:1'
        ]);

        $user = User::findOrFail($request->user_id);
        $batch = Batch::where('batch_id', $request->batch_id)->with('program')->first();
        
        // Get amount from request or from program pricing
        $amount = $request->amount;
        if (!$amount && $batch && $batch->program && $batch->program->pricing) {
            $amount = floatval($batch->program->pricing);
        }
        if (!$amount) {
            $amount = config('paymongo.enrollment_fee', 5000.00);
        }

        // Create payment record
        $payment = Payment::create([
            'user_id' => $user->id,
            'batch_id' => $request->batch_id,
            'amount' => $amount,
            'currency' => 'PHP',
            'payment_method' => $request->payment_method,
            'payment_status' => 'pending',
            'payment_description' => "Enrollment fee for {$batch->program->name} - {$batch->batch_id}",
            'reference_code' => 'ENR-' . strtoupper(Str::random(10))
        ]);

        // MOCK MODE: Skip PayMongo API and create mock payment
        if (config('paymongo.mode') === 'mock') {
            $mockPaymentId = 'pay_mock_' . Str::random(20);
            
            $payment->update([
                'paymongo_payment_id' => $mockPaymentId,
                'paymongo_response' => [
                    'mock' => true,
                    'mode' => 'development',
                    'created_at' => now()->toISOString()
                ],
                'payment_status' => 'pending'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Mock payment created for development',
                'payment' => $payment,
                'mock' => true,
                'mock_payment_url' => url("/api/payments/{$payment->id}/mock-payment")
            ]);
        }

        // REAL PAYMONGO MODE
        // Create PayMongo PaymentIntent
        $result = $this->payMongoService->createPaymentIntent(
            $amount,
            $payment->payment_description,
            $request->payment_method
        );

        if ($result['success']) {
            $paymentIntentData = $result['data']['data'];
            
            // Build payment response data
            $paymentResponse = $paymentIntentData;
            
            // For checkout sessions (card payments), include session ID
            if (isset($result['checkout_session_id'])) {
                $paymentResponse['checkout_session_id'] = $result['checkout_session_id'];
            }
            
            // Update payment with PayMongo details
            $payment->update([
                'paymongo_payment_intent_id' => $paymentIntentData['id'],
                'paymongo_response' => $paymentResponse,
                'payment_status' => 'processing'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment intent created successfully',
                'payment' => $payment,
                'payment_intent' => $paymentIntentData,
                'client_key' => $paymentIntentData['attributes']['client_key'] ?? null,
                'redirect_url' => $result['redirect_url'] ?? ($paymentIntentData['attributes']['next_action']['redirect']['url'] ?? null)
            ]);
        }

        $payment->markAsFailed('Failed to create payment intent');

        return response()->json([
            'success' => false,
            'message' => 'Failed to create payment intent',
            'error' => $result['error']
        ], 422);
    }

    /**
     * Create a payment source (alternative method for e-wallets)
     */
    public function createPaymentSource(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'batch_id' => 'required|exists:batches,batch_id',
            'payment_method' => 'required|in:gcash,paymaya,grab_pay',
            'amount' => 'nullable|numeric|min:1'
        ]);

        $user = User::findOrFail($request->user_id);
        $batch = Batch::where('batch_id', $request->batch_id)->with('program')->first();
        
        // Get amount from request or from program pricing
        $amount = $request->amount;
        if (!$amount && $batch && $batch->program && $batch->program->pricing) {
            $amount = floatval($batch->program->pricing);
        }
        if (!$amount) {
            $amount = config('paymongo.enrollment_fee', 5000.00);
        }

        // Create payment record
        $payment = Payment::create([
            'user_id' => $user->id,
            'batch_id' => $request->batch_id,
            'amount' => $amount,
            'currency' => 'PHP',
            'payment_method' => $request->payment_method,
            'payment_status' => 'pending',
            'payment_description' => "Enrollment fee for {$batch->program->name} - {$batch->batch_id}",
            'reference_code' => 'ENR-' . strtoupper(Str::random(10))
        ]);

        // Create PayMongo Source
        $result = $this->payMongoService->createSource(
            $amount,
            $request->payment_method,
            [
                'success' => route('payment.success', ['payment' => $payment->id]),
                'failed' => route('payment.failed', ['payment' => $payment->id])
            ]
        );

        if ($result['success']) {
            $sourceData = $result['data']['data'];
            
            // Update payment with PayMongo details
            $payment->update([
                'paymongo_source_id' => $sourceData['id'],
                'paymongo_response' => $sourceData,
                'payment_status' => 'processing'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment source created successfully',
                'payment' => $payment,
                'source' => $sourceData,
                'redirect_url' => $sourceData['attributes']['redirect']['checkout_url']
            ]);
        }

        $payment->markAsFailed('Failed to create payment source');

        return response()->json([
            'success' => false,
            'message' => 'Failed to create payment source',
            'error' => $result['error']
        ], 422);
    }

    /**
     * Verify payment status
     */
    public function verifyPayment(Request $request, $paymentId)
    {
        $payment = Payment::findOrFail($paymentId);

        // If already paid, return success
        if ($payment->isPaid()) {
            return response()->json([
                'success' => true,
                'payment_status' => 'paid',
                'payment' => $payment
            ]);
        }

        // Check for checkout session ID (for card payments)
        $checkoutSessionId = $payment->paymongo_response['checkout_session_id'] ?? null;
        
        if ($checkoutSessionId) {
            // Verify checkout session status
            $result = $this->payMongoService->getCheckoutSession($checkoutSessionId);
            
            if ($result['success']) {
                $sessionData = $result['data']['data'];
                $sessionStatus = $sessionData['attributes']['status'] ?? null;
                $paymentIntent = $sessionData['attributes']['payment_intent'] ?? null;
                
                if ($sessionStatus === 'active' && $paymentIntent) {
                    // Check if payment intent has payments
                    $payments = $paymentIntent['attributes']['payments'] ?? [];
                    
                    if (count($payments) > 0) {
                        // Payment was made
                        $latestPayment = end($payments);
                        if ($latestPayment['attributes']['status'] === 'paid') {
                            $payment->markAsPaid();
                            $payment->update([
                                'paymongo_payment_id' => $latestPayment['id'],
                                'paymongo_response' => $sessionData
                            ]);
                        }
                    }
                }
            }
        }
        
        // Check PayMongo for payment status via payment intent
        if ($payment->paymongo_payment_intent_id && !$checkoutSessionId) {
            $result = $this->payMongoService->getPaymentIntent($payment->paymongo_payment_intent_id);
            
            if ($result['success']) {
                $intentData = $result['data']['data'];
                $status = $intentData['attributes']['status'];
                
                if ($status === 'succeeded') {
                    $payment->markAsPaid();
                    $payment->update([
                        'paymongo_response' => $intentData
                    ]);
                } elseif (in_array($status, ['processing', 'awaiting_payment_method', 'awaiting_next_action'])) {
                    $payment->markAsProcessing();
                } elseif ($status === 'failed') {
                    $payment->markAsFailed('Payment failed in PayMongo');
                }
            }
        } elseif ($payment->paymongo_source_id) {
            // For source-based payments, we need to check via webhook or Payment endpoint
            // This is a simplified check
            $payment->refresh();
        }

        return response()->json([
            'success' => true,
            'payment_status' => $payment->payment_status,
            'payment' => $payment
        ]);
    }

    /**
     * Handle PayMongo webhook
     */
    public function handleWebhook(Request $request)
    {
        try {
            // Verify webhook signature
            $signature = $request->header('PayMongo-Signature');
            $payload = $request->getContent();
            
            if (!$this->payMongoService->verifyWebhookSignature($payload, $signature)) {
                return response()->json(['error' => 'Invalid signature'], 401);
            }

            $event = $request->input('data');
            $eventType = $event['attributes']['type'];

            Log::info('PayMongo Webhook:', ['type' => $eventType, 'data' => $event]);

            switch ($eventType) {
                case 'payment.paid':
                    $this->handlePaymentPaid($event);
                    break;
                
                case 'payment.failed':
                    $this->handlePaymentFailed($event);
                    break;
                
                case 'source.chargeable':
                    $this->handleSourceChargeable($event);
                    break;
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('PayMongo Webhook Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Handle payment.paid webhook event
     */
    protected function handlePaymentPaid($event)
    {
        $paymentData = $event['attributes']['data'];
        $paymentIntentId = $paymentData['attributes']['payment_intent_id'] ?? null;
        $sourceId = $paymentData['attributes']['source']['id'] ?? null;

        $payment = Payment::where('paymongo_payment_intent_id', $paymentIntentId)
            ->orWhere('paymongo_source_id', $sourceId)
            ->first();

        if ($payment) {
            $payment->update([
                'payment_status' => 'paid',
                'paid_at' => now(),
                'paymongo_payment_id' => $paymentData['id'],
                'paymongo_response' => $paymentData
            ]);

            Log::info("Payment marked as paid: {$payment->id}");
        }
    }

    /**
     * Handle payment.failed webhook event
     */
    protected function handlePaymentFailed($event)
    {
        $paymentData = $event['attributes']['data'];
        $paymentIntentId = $paymentData['attributes']['payment_intent_id'] ?? null;

        $payment = Payment::where('paymongo_payment_intent_id', $paymentIntentId)->first();

        if ($payment) {
            $payment->markAsFailed('Payment failed via webhook');
            Log::info("Payment marked as failed: {$payment->id}");
        }
    }

    /**
     * Handle source.chargeable webhook event
     */
    protected function handleSourceChargeable($event)
    {
        $sourceData = $event['attributes']['data'];
        $sourceId = $sourceData['id'];

        $payment = Payment::where('paymongo_source_id', $sourceId)->first();

        if ($payment) {
            // Create a Payment using the Source
            $result = $this->payMongoService->createPayment(
                $sourceId,
                $payment->amount,
                $payment->payment_description
            );

            if ($result['success']) {
                $paymentData = $result['data']['data'];
                
                $payment->update([
                    'paymongo_payment_id' => $paymentData['id'],
                    'payment_status' => 'paid',
                    'paid_at' => now(),
                    'paymongo_response' => $paymentData
                ]);

                Log::info("Source charged successfully: {$payment->id}");
            } else {
                $payment->markAsFailed('Failed to charge source');
                Log::error("Failed to charge source: {$payment->id}");
            }
        }
    }

    /**
     * Get all payments for a user
     */
    public function getUserPayments(Request $request, $userId)
    {
        $payments = Payment::where('user_id', $userId)
            ->with('batch.program')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    /**
     * Get payment by ID
     */
    public function getPayment($id)
    {
        $payment = Payment::with(['user', 'batch.program'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $payment
        ]);
    }

    /**
     * Manual payment (cash/bank transfer)
     */
    public function manualPayment(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'batch_id' => 'required|exists:batches,batch_id',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|in:cash,bank_transfer,other',
            'reference_number' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        $user = User::findOrFail($request->user_id);
        $batch = Batch::where('batch_id', $request->batch_id)->first();

        $payment = Payment::create([
            'user_id' => $user->id,
            'batch_id' => $request->batch_id,
            'amount' => $request->amount,
            'currency' => 'PHP',
            'payment_method' => $request->payment_method,
            'payment_status' => 'paid',
            'payment_description' => "Manual enrollment payment for {$batch->program->name} - {$batch->batch_id}",
            'reference_code' => 'MAN-' . strtoupper(Str::random(10)),
            'reference_number' => $request->reference_number,
            'notes' => $request->notes,
            'paid_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Manual payment recorded successfully',
            'payment' => $payment
        ]);
    }

    /**
     * Mock payment completion (Development only)
     */
    public function mockCompletePayment($id)
    {
        if (config('paymongo.mode') !== 'mock') {
            return response()->json([
                'success' => false,
                'error' => 'Mock payments are only available in mock mode'
            ], 403);
        }

        $payment = Payment::findOrFail($id);
        
        $payment->update([
            'payment_status' => 'paid',
            'paid_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mock payment completed successfully',
            'payment' => $payment
        ]);
    }
    
    /**
     * Mock payment failure (Development only)
     */
    public function mockFailPayment($id)
    {
        if (config('paymongo.mode') !== 'mock') {
            return response()->json([
                'success' => false,
                'error' => 'Mock payments are only available in mock mode'
            ], 403);
        }

        $payment = Payment::findOrFail($id);
        
        $payment->update([
            'payment_status' => 'failed',
            'failed_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mock payment marked as failed',
            'payment' => $payment
        ]);
    }
    
    /**
     * Show mock payment page (Development only)
     */
    public function showMockPayment($id)
    {
        if (config('paymongo.mode') !== 'mock') {
            return response()->json([
                'success' => false,
                'error' => 'Mock payments are only available in mock mode'
            ], 403);
        }

        $payment = Payment::findOrFail($id);
        
        // Return a simple HTML page for mock payment
        $html = view('mock-payment', compact('payment'))->render();
        return response($html)->header('Content-Type', 'text/html');
    }

    /**
     * Get all payments for staff view
     */
    public function getAllPayments(Request $request)
    {
        try {
            $payments = Payment::with(['user.program', 'user.voucher', 'batch'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'payments' => $payments
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching payments:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch payments'
            ], 500);
        }
    }
}
