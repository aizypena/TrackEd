<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 650px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 30px 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px 20px; }
        .info-box { background: white; padding: 20px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #10b981; }
        .credentials-box { background: #fff3cd; padding: 20px; border-radius: 5px; margin: 15px 0; border: 2px solid #ffc107; }
        .footer { background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
        h1 { margin: 0; font-size: 28px; }
        h3 { color: #10b981; margin-top: 0; margin-bottom: 15px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Student Account Created!</h1>
            <p style='margin: 10px 0 0 0; font-size: 16px;'>Welcome to SMI Training Center</p>
        </div>
        <div class='content'>
            <p>Dear <strong>{{ ucwords($user->first_name . ' ' . $user->last_name) }}</strong>,</p>
            <p>Your student account has been successfully created. Welcome to SMI Training Center!</p>
            
            <div class='info-box'>
                <h3>📋 Your Student Information</h3>
                <p><strong>Student ID:</strong> {{ $user->student_id }}</p>
                <p><strong>Email:</strong> {{ $user->email }}</p>
                @if($programName && $programName != 'N/A')
                <p><strong>Program:</strong> {{ $programName }}</p>
                @endif
                @if($batchCode && $batchCode != 'N/A')
                <p><strong>Batch:</strong> {{ $batchCode }}</p>
                @endif
                <p style='margin-bottom: 0;'><strong>Status:</strong> <span style='color: #10b981;'>Active</span></p>
            </div>

            <div class='credentials-box'>
                <h3 style='color: #856404; margin-top: 0;'>🔐 LMS Access Credentials</h3>
                <p><strong>LMS Portal:</strong> <a href='http://localhost:5173/smi-lms/login'>http://localhost:5173/student/login</a></p>
                <p><strong>Username:</strong> {{ $user->student_id }}</p>
                <p><strong>Temporary Password:</strong> {{ $password }}</p>
                <p style='margin-bottom: 0; color: #856404; font-size: 13px;'>⚠️ Please change your password upon first login.</p>
            </div>

            <div class='info-box'>
                <h3>📅 What's Next?</h3>
                <ul style='margin: 0; padding-left: 20px;'>
                    <li>Login to the LMS portal using your credentials above</li>
                    <li>Complete your student profile</li>
                    <li>Check your batch schedule and course materials</li>
                    <li>Contact us if you have any questions</li>
                </ul>
            </div>

            <p style='color: #666; font-size: 14px; margin-top: 25px;'>
                If you have any questions or concerns, please don't hesitate to contact our admissions office.
            </p>
        </div>
        <div class='footer'>
            <p style='margin: 0 0 5px 0;'><strong>SMI Training Center</strong></p>
            <p style='margin: 0; font-size: 11px;'>TrackEd Learning Management System</p>
            <p style='margin: 10px 0 0 0; font-size: 11px;'>This is an automated email. Please keep this for your records.</p>
        </div>
    </div>
</body>
</html>
