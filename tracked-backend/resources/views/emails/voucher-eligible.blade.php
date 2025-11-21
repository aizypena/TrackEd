<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: #2563eb;
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 40px 30px;
            background: #ffffff;
        }
        .content h2 {
            color: #2563eb;
            margin-top: 0;
        }
        .content p {
            margin: 15px 0;
            color: #555;
        }
        .content ul {
            margin: 20px 0;
            padding-left: 20px;
        }
        .content li {
            margin: 10px 0;
            color: #555;
        }
        .button {
            display: inline-block;
            padding: 14px 28px;
            background: #2563eb;
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
        }
        .button:hover {
            background: #1d4ed8;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .highlight {
            background-color: #fef3c7;
            padding: 15px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
        }
        .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        strong {
            color: #2563eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Great News!</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{ $name }},</h2>
            
            <p>We're excited to inform you that you are now <strong>eligible for a training voucher</strong> for the <strong>{{ $program }}</strong> program!</p>
            
            <p>A voucher slot has become available, and based on your application submission date, you've been moved from the waiting list to eligible status.</p>
            
            <div class="highlight">
                <strong>⏰ Important: Time-Sensitive Action Required</strong>
                <p style="margin: 10px 0 0 0;">Please complete your enrollment within the next <strong>3 days</strong> to secure your voucher. If enrollment is not completed within this timeframe, your voucher eligibility may be transferred to the next applicant on the waiting list.</p>
            </div>
            
            <p><strong>What's Next?</strong></p>
            <ul>
                <li>Review your application status in your dashboard</li>
                <li>Complete any pending enrollment requirements</li>
                <li>Submit all necessary documents</li>
                <li>Confirm your enrollment before the deadline</li>
            </ul>
            
            <div class="button-container">
                <a href="{{ env('FRONTEND_URL', 'http://localhost:3000') }}/application-status" class="button">
                    Check Application Status →
                </a>
            </div>
            
            <p>This is an automated notification from our voucher management system. Your eligibility was automatically updated as part of our fair first-come-first-served process.</p>
            
            <p>If you have any questions or need assistance with the enrollment process, please don't hesitate to contact us at <strong>smiacedmicenter@gmail.com</strong> or call our office.</p>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>SMI Institute Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This email was sent to {{ $name }} regarding voucher eligibility for {{ $program }}.</p>
            <p>© {{ date('Y') }} SMI Institute. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
