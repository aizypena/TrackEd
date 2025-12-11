<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\User;
use App\Models\Batch;
use App\Models\Voucher;
use App\Services\XenditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    protected $xenditService;

    public function __construct(XenditService $xenditService)
    {
        $this->xenditService = $xenditService;
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
     * Create a payment intent for enrollment (using Xendit)
     */
    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'batch_id' => 'nullable|exists:batches,batch_id',
            'payment_method' => 'required|in:gcash,paymaya,maya,grab_pay,grabpay',
            'amount' => 'nullable|numeric|min:1'
        ]);

        $user = User::findOrFail($request->user_id);
        $batch = $request->batch_id ? Batch::where('batch_id', $request->batch_id)->with('program')->first() : null;
        
        // Get amount from request or from program pricing
        $amount = $request->amount;
        if (!$amount && $batch && $batch->program && $batch->program->pricing) {
            $amount = floatval($batch->program->pricing);
        }
        if (!$amount) {
            $amount = config('xendit.enrollment_fee', 5000.00);
        }

        // Prepare payment description
        $description = "Enrollment fee";
        if ($batch && $batch->program) {
            $description .= " for {$batch->program->name}";
            if ($batch->batch_id) {
                $description .= " - {$batch->batch_id}";
            }
        }

        // Generate reference code
        $referenceCode = 'ENR-' . strtoupper(Str::random(10));

        // Create payment record
        $payment = Payment::create([
            'user_id' => $user->id,
            'batch_id' => $request->batch_id,
            'amount' => $amount,
            'currency' => 'PHP',
            'payment_method' => $request->payment_method,
            'payment_status' => 'pending',
            'payment_description' => $description,
            'reference_code' => $referenceCode
        ]);

        // Create Xendit E-Wallet Charge
        $successRedirectUrl = config('xendit.success_redirect_url', 'https://smitracked.cloud/staff/payment-callback');
        $failureRedirectUrl = config('xendit.failure_redirect_url', 'https://smitracked.cloud/staff/payment-failed');

        $result = $this->xenditService->createEWalletCharge(
            $amount,
            $referenceCode,
            $request->payment_method,
            $description,
            $successRedirectUrl . '?payment_id=' . $payment->id,
            $failureRedirectUrl . '?payment_id=' . $payment->id
        );

        if ($result['success']) {
            // Update payment with Xendit details
            $payment->update([
                'xendit_charge_id' => $result['charge_id'],
                'xendit_response' => $result['data'],
                'payment_status' => 'processing'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment created successfully',
                'payment' => $payment,
                'charge_id' => $result['charge_id'],
                'redirect_url' => $result['redirect_url']
            ]);
        }

        $payment->markAsFailed('Failed to create Xendit payment');

        return response()->json([
            'success' => false,
            'message' => 'Failed to create payment',
            'error' => $result['error']
        ], 422);
    }

    /**
     * Create a payment source (using Xendit Invoice - supports multiple payment methods)
     */
    public function createPaymentSource(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'batch_id' => 'required|exists:batches,batch_id',
            'payment_method' => 'required|in:gcash,paymaya,maya,grab_pay,grabpay',
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
            $amount = config('xendit.enrollment_fee', 5000.00);
        }

        // Generate reference code
        $referenceCode = 'ENR-' . strtoupper(Str::random(10));

        // Create payment record
        $payment = Payment::create([
            'user_id' => $user->id,
            'batch_id' => $request->batch_id,
            'amount' => $amount,
            'currency' => 'PHP',
            'payment_method' => $request->payment_method,
            'payment_status' => 'pending',
            'payment_description' => "Enrollment fee for {$batch->program->name} - {$batch->batch_id}",
            'reference_code' => $referenceCode
        ]);

        // Create Xendit Invoice
        $successRedirectUrl = config('xendit.success_redirect_url', 'https://smitracked.cloud/staff/payment-callback');
        $failureRedirectUrl = config('xendit.failure_redirect_url', 'https://smitracked.cloud/staff/payment-failed');

        $result = $this->xenditService->createInvoice(
            $referenceCode,
            $amount,
            $user->email,
            $payment->payment_description,
            $successRedirectUrl . '?payment_id=' . $payment->id,
            $failureRedirectUrl . '?payment_id=' . $payment->id
        );

        if ($result['success']) {
            // Update payment with Xendit details
            $payment->update([
                'xendit_invoice_id' => $result['invoice_id'],
                'xendit_response' => $result['data'],
                'payment_status' => 'processing'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment invoice created successfully',
                'payment' => $payment,
                'invoice_id' => $result['invoice_id'],
                'redirect_url' => $result['invoice_url']
            ]);
        }

        $payment->markAsFailed('Failed to create Xendit invoice');

        return response()->json([
            'success' => false,
            'message' => 'Failed to create payment invoice',
            'error' => $result['error']
        ], 422);
    }

    /**
     * Verify payment status (using Xendit)
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

        // Check Xendit charge status
        if ($payment->xendit_charge_id) {
            $result = $this->xenditService->getEWalletChargeStatus($payment->xendit_charge_id);
            
            if ($result['success']) {
                $chargeData = $result['data'];
                $status = $chargeData['status'] ?? null;
                
                if ($status === 'SUCCEEDED') {
                    $payment->markAsPaid();
                    $payment->update([
                        'xendit_response' => $chargeData
                    ]);
                } elseif (in_array($status, ['PENDING', 'PROCESSING'])) {
                    $payment->markAsProcessing();
                } elseif (in_array($status, ['FAILED', 'VOIDED'])) {
                    $payment->markAsFailed('Payment failed in Xendit');
                }
            }
        }
        
        // Check Xendit invoice status
        if ($payment->xendit_invoice_id) {
            $result = $this->xenditService->getInvoiceStatus($payment->xendit_invoice_id);
            
            if ($result['success']) {
                $invoiceData = $result['data'];
                $status = $invoiceData['status'] ?? null;
                
                if ($status === 'PAID' || $status === 'SETTLED') {
                    $payment->markAsPaid();
                    $payment->update([
                        'xendit_response' => $invoiceData
                    ]);
                } elseif (in_array($status, ['PENDING', 'PROCESSING'])) {
                    $payment->markAsProcessing();
                } elseif (in_array($status, ['EXPIRED', 'FAILED'])) {
                    $payment->markAsFailed('Payment failed in Xendit');
                }
            }
        }

        return response()->json([
            'success' => true,
            'payment_status' => $payment->payment_status,
            'payment' => $payment
        ]);
    }

    /**
     * Handle Xendit webhook
     */
    public function handleWebhook(Request $request)
    {
        try {
            // Verify webhook signature (optional, but recommended)
            $callbackToken = $request->header('X-Callback-Token');
            $webhookVerificationToken = config('xendit.webhook_verification_token');
            
            if ($webhookVerificationToken && $callbackToken !== $webhookVerificationToken) {
                Log::warning('Xendit Webhook: Invalid callback token');
                return response()->json(['error' => 'Invalid callback token'], 401);
            }

            $eventData = $request->all();
            $eventType = $eventData['event'] ?? null;

            Log::info('Xendit Webhook:', ['type' => $eventType, 'data' => $eventData]);

            // Handle different webhook events
            switch ($eventType) {
                case 'ewallet.capture':
                    $this->handleEWalletCapture($eventData);
                    break;
                
                case 'invoice.paid':
                    $this->handleInvoicePaid($eventData);
                    break;
                    
                case 'invoice.expired':
                    $this->handleInvoiceExpired($eventData);
                    break;
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Xendit Webhook Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Handle e-wallet capture webhook event
     */
    protected function handleEWalletCapture($eventData)
    {
        $chargeData = $eventData['data'] ?? $eventData;
        $chargeId = $chargeData['id'] ?? null;
        $referenceId = $chargeData['reference_id'] ?? null;
        $status = $chargeData['status'] ?? null;

        // Find payment by charge ID or reference code
        $payment = Payment::where('xendit_charge_id', $chargeId)
            ->orWhere('reference_code', $referenceId)
            ->first();

        if ($payment) {
            if ($status === 'SUCCEEDED') {
                $payment->update([
                    'payment_status' => 'paid',
                    'paid_at' => now(),
                    'xendit_response' => $chargeData
                ]);
                Log::info("Payment marked as paid via e-wallet: {$payment->id}");
            } elseif (in_array($status, ['FAILED', 'VOIDED'])) {
                $payment->markAsFailed('E-wallet payment failed');
                Log::info("Payment marked as failed: {$payment->id}");
            }
        }
    }

    /**
     * Handle invoice.paid webhook event
     */
    protected function handleInvoicePaid($eventData)
    {
        $invoiceData = $eventData['data'] ?? $eventData;
        $invoiceId = $invoiceData['id'] ?? null;
        $externalId = $invoiceData['external_id'] ?? null;

        // Find payment by invoice ID or reference code
        $payment = Payment::where('xendit_invoice_id', $invoiceId)
            ->orWhere('reference_code', $externalId)
            ->first();

        if ($payment) {
            $payment->update([
                'payment_status' => 'paid',
                'paid_at' => now(),
                'xendit_response' => $invoiceData
            ]);
            Log::info("Payment marked as paid via invoice: {$payment->id}");
        }
    }

    /**
     * Handle invoice.expired webhook event
     */
    protected function handleInvoiceExpired($eventData)
    {
        $invoiceData = $eventData['data'] ?? $eventData;
        $invoiceId = $invoiceData['id'] ?? null;

        $payment = Payment::where('xendit_invoice_id', $invoiceId)->first();

        if ($payment && $payment->payment_status !== 'paid') {
            $payment->markAsFailed('Invoice expired');
            Log::info("Payment marked as expired: {$payment->id}");
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

    /**
     * Download payment receipt as PDF
     */
    public function downloadReceipt(Request $request, $id)
    {
        try {
            // Authenticate using token from query parameter if present
            if ($request->has('token')) {
                $token = $request->query('token');
                $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                
                if (!$accessToken || !$accessToken->tokenable) {
                    return response('<html><body><h1>Unauthenticated</h1><p>Invalid or expired token.</p></body></html>')->header('Content-Type', 'text/html');
                }
                
                // Verify user is authenticated
                $user = $accessToken->tokenable;
                if (!$user) {
                    return response('<html><body><h1>Unauthenticated</h1><p>User not found.</p></body></html>')->header('Content-Type', 'text/html');
                }
            }

            $payment = Payment::with(['user', 'batch'])->findOrFail($id);

            // Generate receipt HTML
            $html = $this->generateReceiptHTML($payment);

            // Return HTML with print-friendly CSS
            return response($html)->header('Content-Type', 'text/html');
        } catch (\Exception $e) {
            Log::error('Error generating receipt:', [
                'payment_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to generate receipt'
            ], 500);
        }
    }

    /**
     * Generate receipt HTML
     */
    private function generateReceiptHTML($payment)
    {
        $student = $payment->user;
        $batch = $payment->batch;

        return "
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Payment Receipt - {$payment->reference_code}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #2563eb; margin: 0; }
        .header p { color: #666; margin: 5px 0; }
        .receipt-box { border: 2px solid #2563eb; padding: 30px; margin-top: 20px; }
        .receipt-title { background: #2563eb; color: white; padding: 15px; text-align: center; font-size: 20px; font-weight: bold; margin: -30px -30px 20px -30px; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .label { color: #666; }
        .value { font-weight: bold; }
        .amount-row { margin-top: 20px; padding-top: 20px; border-top: 2px solid #2563eb; }
        .total-amount { font-size: 24px; color: #10b981; text-align: right; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
        .no-print { text-align: center; margin-top: 20px; }
        .no-print button { padding: 10px 20px; font-size: 16px; cursor: pointer; background: #2563eb; color: white; border: none; border-radius: 5px; }
        .no-print button:hover { background: #1d4ed8; }
        @media print {
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class='header'>
        <h1>TrackEd System</h1>
        <p>SMI INSTITUTE INC.</p>
        <p>Official Payment Receipt</p>
    </div>

    <div class='receipt-box'>
        <div class='receipt-title'>PAYMENT RECEIPT</div>
        
        <div class='info-row'>
            <span class='label'>Receipt Number:</span>
            <span class='value'>{$payment->reference_code}</span>
        </div>
        
        <div class='info-row'>
            <span class='label'>Date:</span>
            <span class='value'>" . date('F d, Y', strtotime($payment->created_at)) . "</span>
        </div>
        
        <div class='info-row'>
            <span class='label'>Student Name:</span>
            <span class='value'>{$student->first_name} {$student->last_name}</span>
        </div>
        
        <div class='info-row'>
            <span class='label'>Student ID:</span>
            <span class='value'>{$student->student_id}</span>
        </div>
        
        <div class='info-row'>
            <span class='label'>Batch:</span>
            <span class='value'>{$payment->batch_id}</span>
        </div>
        
        <div class='info-row'>
            <span class='label'>Payment Method:</span>
            <span class='value'>" . strtoupper($payment->payment_method) . "</span>
        </div>
        
        <div class='info-row'>
            <span class='label'>Payment Status:</span>
            <span class='value'>" . strtoupper($payment->payment_status) . "</span>
        </div>
        
        <div class='info-row'>
            <span class='label'>Description:</span>
            <span class='value'>{$payment->payment_description}</span>
        </div>
        
        <div class='amount-row'>
            <div class='info-row'>
                <span class='label' style='font-size: 18px;'>Total Amount:</span>
                <span class='total-amount'>₱" . number_format($payment->amount, 2) . "</span>
            </div>
        </div>
    </div>

    <div class='footer'>
        <p>This is an official receipt generated by TrackEd System</p>
        <p>SMI INSTITUTE INC.</p>
    </div>

    <div class='no-print'>
        <button onclick='window.print()'>Print Receipt</button>
        <button onclick='window.close()' style='margin-left: 10px; background: #6b7280;'>Close</button>
    </div>

    <script>
        // Auto-print on load
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>
        ";
    }
}
