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
            background-color: #f9f9f9;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border: 1px solid #ddd;
        }
        h2 {
            color: #2563eb;
            margin-top: 0;
        }
        .info-section {
            background: #f5f5f5;
            padding: 15px;
            margin: 20px 0;
        }
        .info-section p {
            margin: 5px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Application Received</h2>
        
        <p>Dear {{ $name }},</p>
        
        <p>Thank you for submitting your application through TrackEd. We have successfully received your application.</p>
        
        <div class="info-section">
            <p><strong>Applicant Name:</strong> {{ $name }}</p>
            <p><strong>Email:</strong> {{ $email }}</p>
            <p><strong>Program Applied:</strong> {{ $program }}</p>
            <p><strong>Submitted On:</strong> {{ $submittedAt }}</p>
        </div>
        
        <p><strong>What Happens Next?</strong></p>
        <p>We are currently reviewing your information. Once your application has been approved, we will email you with the next steps.</p>
        
        <p><strong>Important Reminder:</strong></p>
        <p>Batch slot confirmation is not equivalent to a voucher slot. Voucher slots are limited and issued on a first-come, first-served basis.</p>
        
        <p>If you have any questions, please contact us at <a href="mailto:smiacedmicenter@gmail.com">smiacedmicenter@gmail.com</a></p>
        
        <p>Thank you for choosing SMI Institute Inc.</p>
        
        <div class="footer">
            <p><strong>SMI Institute Inc.</strong></p>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© {{ date('Y') }} SMI Institute Inc. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
