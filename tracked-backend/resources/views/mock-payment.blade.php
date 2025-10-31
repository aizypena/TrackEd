<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mock Payment - Development Mode</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 100%;
            padding: 40px;
        }
        .badge {
            background: #fbbf24;
            color: #78350f;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            display: inline-block;
            margin-bottom: 20px;
        }
        h1 {
            color: #1f2937;
            margin-bottom: 10px;
            font-size: 28px;
        }
        p {
            color: #6b7280;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        .payment-details {
            background: #f9fafb;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 30px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .detail-label {
            color: #6b7280;
            font-size: 14px;
        }
        .detail-value {
            color: #1f2937;
            font-weight: 600;
        }
        .amount {
            font-size: 32px;
            color: #667eea;
        }
        .button-group {
            display: flex;
            gap: 12px;
        }
        button {
            flex: 1;
            padding: 16px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .btn-success {
            background: #10b981;
            color: white;
        }
        .btn-success:hover {
            background: #059669;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }
        .btn-danger {
            background: #ef4444;
            color: white;
        }
        .btn-danger:hover {
            background: #dc2626;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .loading {
            display: none;
            text-align: center;
            margin-top: 20px;
        }
        .spinner {
            border: 3px solid #f3f4f6;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .success-message {
            display: none;
            text-align: center;
            padding: 20px;
        }
        .success-icon {
            width: 60px;
            height: 60px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
        }
        .checkmark {
            width: 30px;
            height: 30px;
            border: 3px solid white;
            border-top: none;
            border-right: none;
            transform: rotate(-45deg);
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="badge">🧪 Development Mode</div>
        
        <div id="payment-form">
            <h1>Test Payment</h1>
            <p>This is a mock payment page for development. No real payment will be processed.</p>
            
            <div class="payment-details">
                <div class="detail-row">
                    <span class="detail-label">Reference</span>
                    <span class="detail-value">{{ $payment->reference_code }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Method</span>
                    <span class="detail-value">{{ strtoupper($payment->payment_method) }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Description</span>
                    <span class="detail-value">{{ $payment->payment_description }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount</span>
                    <span class="detail-value amount">₱{{ number_format($payment->amount, 2) }}</span>
                </div>
            </div>
            
            <div class="button-group">
                <button class="btn-success" onclick="completePayment()">
                    ✅ Complete Payment
                </button>
                <button class="btn-danger" onclick="failPayment()">
                    ❌ Fail Payment
                </button>
            </div>
        </div>
        
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p style="margin-top: 16px; color: #6b7280;">Processing...</p>
        </div>
        
        <div class="success-message" id="success">
            <div class="success-icon">
                <div class="checkmark"></div>
            </div>
            <h2 style="color: #10b981; margin-bottom: 10px;">Payment Successful!</h2>
            <p>This window will close automatically...</p>
        </div>
    </div>

    <script>
        const paymentId = "{{ $payment->id }}";
        
        async function completePayment() {
            showLoading();
            
            try {
                const response = await fetch(`/api/payments/${paymentId}/mock-complete`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showSuccess();
                    setTimeout(() => {
                        window.close();
                    }, 2000);
                } else {
                    alert('Error: ' + data.error);
                    hideLoading();
                }
            } catch (error) {
                alert('Error completing payment: ' + error.message);
                hideLoading();
            }
        }
        
        async function failPayment() {
            if (!confirm('Are you sure you want to simulate a failed payment?')) {
                return;
            }
            
            showLoading();
            
            try {
                const response = await fetch(`/api/payments/${paymentId}/mock-fail`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Payment marked as failed');
                    window.close();
                } else {
                    alert('Error: ' + data.error);
                    hideLoading();
                }
            } catch (error) {
                alert('Error failing payment: ' + error.message);
                hideLoading();
            }
        }
        
        function showLoading() {
            document.getElementById('payment-form').style.display = 'none';
            document.getElementById('loading').style.display = 'block';
        }
        
        function hideLoading() {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('payment-form').style.display = 'block';
        }
        
        function showSuccess() {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('success').style.display = 'block';
        }
    </script>
</body>
</html>
