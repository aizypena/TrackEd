<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\BatchController;
use App\Http\Controllers\VoucherController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\PaymentController;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Application routes
Route::post('/application', [ApplicationController::class, 'submit']);

// Public Programs Route (for homepage - no auth required)
Route::get('/public/programs', function (Request $request) {
    try {
        $query = \App\Models\Program::query();
        
        // Filter by availability if provided in query params
        if ($request->has('availability')) {
            $query->where('availability', $request->availability);
        } else {
            // Default to only available programs
            $query->where('availability', 'available');
        }
        
        $programs = $query->orderBy('title')->get();
        
        return response()->json([
            'success' => true,
            'data' => $programs  // Changed to 'data' to match expected response format
        ]);
    } catch (\Exception $e) {
        \Log::error('Public programs endpoint error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch programs'
        ], 500);
    }
});

// PayMongo Webhook (no auth required)
Route::post('/webhooks/paymongo', [PaymentController::class, 'handleWebhook']);

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/admin/login', function (Request $request) {
    $request->validate([
        'email' => 'required|string',
        'password' => 'required|string',
    ]);

    // Find admin user (accept either 'admin' or 'administrator' role)
    $user = User::where('email', $request->email)
                ->whereIn('role', ['admin', 'administrator'])
                ->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        // Log failed admin login attempt
        DB::table('system_logs')->insert([
            'user_id' => $user ? $user->id : null,
            'action' => 'admin_login_failed',
            'description' => 'Failed admin login attempt for email: ' . $request->email,
            'log_level' => 'warning',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Invalid credentials'
        ], 401);
    }

    // Delete existing tokens and create new one
    $user->tokens()->delete();
    $token = $user->createToken('admin-token')->plainTextToken;

    // Log successful admin login
    DB::table('system_logs')->insert([
        'user_id' => $user->id,
        'action' => 'admin_login_success',
        'description' => 'Admin logged in successfully: ' . $user->email,
        'log_level' => 'info',
        'ip_address' => $request->ip(),
        'user_agent' => $request->userAgent(),
        'created_at' => now(),
    ]);

    return response()->json([
        'token' => $token,
        'user' => [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'address' => $user->address,
            'role' => $user->role,
            'status' => $user->status,
        ]
    ]);
});

// Admin password verification endpoint
Route::post('/admin/verify-password', function (Request $request) {
    $request->validate([
        'password' => 'required|string',
    ]);

    // Get authenticated admin user
    $user = $request->user();

    if (!$user || !in_array($user->role, ['admin', 'administrator'])) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized'
        ], 401);
    }

    // Check password
    if (!Hash::check($request->password, $user->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Incorrect password'
        ], 401);
    }

    return response()->json([
        'success' => true,
        'message' => 'Password verified'
    ]);
})->middleware('auth:sanctum');

// Trainer password verification endpoint
Route::post('/trainer/verify-password', function (Request $request) {
    $request->validate([
        'password' => 'required|string',
    ]);

    // Get authenticated trainer user
    $user = $request->user();

    if (!$user || $user->role !== 'trainer') {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized'
        ], 401);
    }

    // Check password
    if (!Hash::check($request->password, $user->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Incorrect password'
        ], 401);
    }

    return response()->json([
        'success' => true,
        'message' => 'Password verified'
    ]);
})->middleware('auth:sanctum');

Route::post('/trainer/login', function (Request $request) {
    $request->validate([
        'email' => 'required|string|email',
        'password' => 'required|string',
    ]);

    // Find trainer user
    $user = User::where('email', $request->email)
                ->where('role', 'trainer')
                ->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        // Log failed trainer login attempt
        DB::table('system_logs')->insert([
            'user_id' => $user ? $user->id : null,
            'action' => 'trainer_login_failed',
            'description' => 'Failed trainer login attempt for email: ' . $request->email,
            'log_level' => 'warning',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Invalid credentials. Please check your email and password.'
        ], 401);
    }

    // Check if user account is active
    if ($user->status !== 'active') {
        // Log inactive trainer account login attempt
        DB::table('system_logs')->insert([
            'user_id' => $user->id,
            'action' => 'trainer_login_blocked',
            'description' => 'Trainer login attempt blocked for inactive account: ' . $user->email,
            'log_level' => 'warning',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Your account is not active. Please contact the administrator.'
        ], 403);
    }

    // Delete existing tokens and create new one
    $user->tokens()->delete();
    $token = $user->createToken('trainer-token')->plainTextToken;

    // Log successful trainer login
    DB::table('system_logs')->insert([
        'user_id' => $user->id,
        'action' => 'trainer_login_success',
        'description' => 'Trainer logged in successfully: ' . $user->email,
        'log_level' => 'info',
        'ip_address' => $request->ip(),
        'user_agent' => $request->userAgent(),
        'created_at' => now(),
    ]);

    return response()->json([
        'token' => $token,
        'user' => [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'address' => $user->address,
            'date_of_birth' => $user->date_of_birth,
            'gender' => $user->gender,
            'role' => $user->role,
            'status' => $user->status,
            'specialization' => $user->specialization,
            'certifications' => $user->certifications,
            'experience' => $user->experience,
            'bio' => $user->bio,
            'assigned_programs' => $user->assigned_programs,
        ]
    ]);
});

Route::post('/staff/login', function (Request $request) {
    $request->validate([
        'email' => 'required|string|email',
        'password' => 'required|string',
    ]);

    // Find staff or trainer user
    $user = User::where('email', $request->email)
                ->whereIn('role', ['staff', 'trainer'])
                ->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        // Log failed staff login attempt
        DB::table('system_logs')->insert([
            'user_id' => $user ? $user->id : null,
            'action' => 'staff_login_failed',
            'description' => 'Failed staff login attempt for email: ' . $request->email,
            'log_level' => 'warning',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Invalid credentials. Please check your email and password.'
        ], 401);
    }

    // Check if user account is active
    if ($user->status !== 'active') {
        // Log inactive staff account login attempt
        DB::table('system_logs')->insert([
            'user_id' => $user->id,
            'action' => 'staff_login_blocked',
            'description' => 'Staff login attempt blocked for inactive account: ' . $user->email,
            'log_level' => 'warning',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Your account is not active. Please contact the administrator.'
        ], 403);
    }

    // Delete existing tokens and create new one
    $user->tokens()->delete();
    $token = $user->createToken('staff-token')->plainTextToken;

    // Log successful staff login
    DB::table('system_logs')->insert([
        'user_id' => $user->id,
        'action' => 'staff_login_success',
        'description' => 'Staff logged in successfully: ' . $user->email . ' (' . $user->role . ')',
        'log_level' => 'info',
        'ip_address' => $request->ip(),
        'user_agent' => $request->userAgent(),
        'created_at' => now(),
    ]);

    return response()->json([
        'token' => $token,
        'user' => [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'address' => $user->address,
            'role' => $user->role,
            'status' => $user->status,
            'bio' => $user->bio,
            'permissions' => $user->permissions,
        ]
    ]);
});

Route::post('/student/login', function (Request $request) {
    $request->validate([
        'student_id' => 'required|string',
        'password' => 'required|string',
    ]);

    // Find student user by student_id
    $user = User::where('student_id', $request->student_id)
                ->where('role', 'student')
                ->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        // Log failed student login attempt
        DB::table('system_logs')->insert([
            'user_id' => $user ? $user->id : null,
            'action' => 'student_login_failed',
            'description' => 'Failed student login attempt for Student ID: ' . $request->student_id,
            'log_level' => 'warning',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Invalid credentials. Please check your Student ID and password.'
        ], 401);
    }

    // Check if user account is active
    if ($user->status !== 'active') {
        // Log inactive student account login attempt
        DB::table('system_logs')->insert([
            'user_id' => $user->id,
            'action' => 'student_login_blocked',
            'description' => 'Student login attempt blocked for inactive account: ' . $user->student_id,
            'log_level' => 'warning',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Your account is not active. Please contact the administrator.'
        ], 403);
    }

    // Delete existing tokens and create new one
    $user->tokens()->delete();
    $token = $user->createToken('student-token')->plainTextToken;

    // Log successful student login
    DB::table('system_logs')->insert([
        'user_id' => $user->id,
        'action' => 'student_login_success',
        'description' => 'Student logged in successfully: ' . $user->student_id . ' (' . $user->email . ')',
        'log_level' => 'info',
        'ip_address' => $request->ip(),
        'user_agent' => $request->userAgent(),
        'created_at' => now(),
    ]);

    return response()->json([
        'token' => $token,
        'user' => [
            'id' => $user->id,
            'student_id' => $user->student_id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'address' => $user->address,
            'date_of_birth' => $user->date_of_birth ? $user->date_of_birth->format('Y-m-d') : null,
            'course_program' => $user->course_program,
            'role' => $user->role,
            'status' => $user->status,
            'emergency_contact' => $user->emergency_contact,
            'emergency_phone' => $user->emergency_phone,
            'emergency_relationship' => $user->emergency_relationship,
        ]
    ]);
});

// Student Forgot Password
Route::post('/student/forgot-password', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
    ]);

    // Find user by email and verify they are a student
    $user = User::where('email', $request->email)
                ->where('role', 'student')
                ->first();

    if (!$user) {
        // Log failed attempt
        DB::table('system_logs')->insert([
            'user_id' => null,
            'action' => 'student_forgot_password_failed',
            'description' => 'Password reset requested for non-student email: ' . $request->email,
            'log_level' => 'warning',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'If a student account exists with this email, a password reset link will be sent.'
        ], 200);
    }

    // Generate reset token
    $token = Str::random(64);
    
    // Store reset token in password_resets table
    DB::table('password_resets')->updateOrInsert(
        ['email' => $request->email],
        [
            'email' => $request->email,
            'token' => Hash::make($token),
            'created_at' => now()
        ]
    );

    // Create reset URL
    $resetUrl = 'http://localhost:5173/smi-lms/reset-password?token=' . $token . '&email=' . urlencode($request->email);

    // Log successful password reset request
    DB::table('system_logs')->insert([
        'user_id' => $user->id,
        'action' => 'student_password_reset_requested',
        'description' => 'Password reset requested for student: ' . $user->student_id . ' (' . $user->email . ')',
        'log_level' => 'info',
        'ip_address' => $request->ip(),
        'user_agent' => $request->userAgent(),
        'created_at' => now(),
    ]);

    // Send password reset email
    try {
        $studentName = $user->first_name . ' ' . $user->last_name;
        $emailContent = "
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px; }
                .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Password Reset Request</h1>
                </div>
                <div class='content'>
                    <p>Hi <strong>{$studentName}</strong>,</p>
                    <p>We received a request to reset your password for your TrackEd student account.</p>
                    <p>Click the button below to reset your password:</p>
                    <div style='text-align: center;'>
                        <a href='{$resetUrl}' class='button'>Reset Password</a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style='word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 3px;'>{$resetUrl}</p>
                    <div class='warning'>
                        <strong>⚠️ Security Notice:</strong>
                        <ul style='margin: 10px 0;'>
                            <li>This link will expire in 1 hour</li>
                            <li>If you didn't request this reset, please ignore this email</li>
                            <li>Never share this link with anyone</li>
                        </ul>
                    </div>
                    <p>If you have any questions or concerns, please contact your administrator.</p>
                    <p>Best regards,<br><strong>TrackEd Team</strong></p>
                </div>
                <div class='footer'>
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>&copy; " . date('Y') . " TrackEd. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ";

        Mail::html($emailContent, function ($message) use ($user, $studentName) {
            $message->to($user->email, $studentName)
                    ->subject('Password Reset Request - TrackEd');
        });

        // Log successful email send
        DB::table('system_logs')->insert([
            'user_id' => $user->id,
            'action' => 'student_password_reset_email_sent',
            'description' => 'Password reset email sent successfully to: ' . $user->email,
            'log_level' => 'info',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

    } catch (\Exception $e) {
        // Log email failure
        DB::table('system_logs')->insert([
            'user_id' => $user->id,
            'action' => 'student_password_reset_email_failed',
            'description' => 'Failed to send password reset email: ' . $e->getMessage(),
            'log_level' => 'error',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Failed to send reset email. Please try again later.'
        ], 500);
    }

    return response()->json([
        'success' => true,
        'message' => 'Password reset link has been sent to your email.'
    ]);
});

// Student Reset Password
Route::post('/student/reset-password', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'token' => 'required|string',
        'password' => 'required|string|min:8|confirmed',
    ]);

    // Find the password reset record
    $passwordReset = DB::table('password_resets')
        ->where('email', $request->email)
        ->first();

    if (!$passwordReset) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid reset token or email.'
        ], 400);
    }

    // Verify the token
    if (!Hash::check($request->token, $passwordReset->token)) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid reset token.'
        ], 400);
    }

    // Check if token is expired (1 hour expiration)
    $createdAt = Carbon::parse($passwordReset->created_at);
    if ($createdAt->addHour()->isPast()) {
        // Delete expired token
        DB::table('password_resets')->where('email', $request->email)->delete();
        
        return response()->json([
            'success' => false,
            'message' => 'Reset token has expired. Please request a new one.'
        ], 400);
    }

    // Find user and verify they are a student
    $user = User::where('email', $request->email)
                ->where('role', 'student')
                ->first();

    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Student account not found.'
        ], 404);
    }

    // Update password
    $user->password = Hash::make($request->password);
    $user->save();

    // Delete the used token
    DB::table('password_resets')->where('email', $request->email)->delete();

    // Delete all existing tokens (force re-login)
    $user->tokens()->delete();

    // Log successful password reset
    DB::table('system_logs')->insert([
        'user_id' => $user->id,
        'action' => 'student_password_reset_success',
        'description' => 'Password reset successfully for student: ' . $user->student_id . ' (' . $user->email . ')',
        'log_level' => 'info',
        'ip_address' => $request->ip(),
        'user_agent' => $request->userAgent(),
        'created_at' => now(),
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Password has been reset successfully. You can now login with your new password.'
    ]);
});

// Public Programs Endpoint (for CourseOffered page)
Route::get('/programs', [ProgramController::class, 'index']);

// Student Exam Endpoints
Route::middleware(['auth:sanctum'])->group(function () {
    // Get exams for logged-in student
    Route::get('/api/student/exams', function (Request $request) {
        try {
            $user = $request->user();
            
            if (!$user || $user->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            // Get student's batch_id and program
            $studentBatchId = $user->batch_id;
            $studentProgram = $user->program;

            // Get quizzes (exams) assigned to student's batch
            $exams = DB::table('quizzes')
                ->where('batch_id', $studentBatchId)
                ->where('type', 'written')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($exam) use ($user) {
                    // Check if student has attempted this exam
                    $attempt = DB::table('quiz_attempts')
                        ->where('quiz_id', $exam->id)
                        ->where('student_id', $user->id)
                        ->first();

                    return [
                        'id' => $exam->id,
                        'title' => $exam->title,
                        'code' => 'EXAM-' . str_pad($exam->id, 4, '0', STR_PAD_LEFT),
                        'description' => $exam->description ?? 'No description available',
                        'type' => 'Written Test',
                        'date' => $exam->created_at,
                        'time' => '09:00:00',
                        'duration' => $exam->time_limit . ' minutes',
                        'time_limit' => $exam->time_limit,
                        'venue' => 'Online',
                        'status' => $exam->status === 'active' ? 'scheduled' : 'completed',
                        'total_questions' => $exam->total_questions ?? 0,
                        'passing_score' => $exam->passing_percentage ?? 50,
                        'batch_id' => $exam->batch_id,
                        'has_attempted' => $attempt ? true : false,
                        'attempt_score' => $attempt ? $attempt->score : null,
                        'attempt_date' => $attempt ? $attempt->completed_at : null
                    ];
                });

            return response()->json([
                'success' => true,
                'exams' => $exams
            ]);
        } catch (\Exception $e) {
            \Log::error('Student exams fetch error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load exams',
                'error' => $e->getMessage()
            ], 500);
        }
    });

    // Get single exam details
    Route::get('/api/student/exams/{id}', function (Request $request, $id) {
        try {
            $user = $request->user();
            
            if (!$user || $user->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            // Get exam details
            $exam = DB::table('quizzes')
                ->where('id', $id)
                ->where('batch_id', $user->batch_id)
                ->first();

            if (!$exam) {
                return response()->json([
                    'success' => false,
                    'message' => 'Exam not found or not assigned to your batch'
                ], 404);
            }

            // Get exam questions
            $questions = DB::table('quiz_questions')
                ->where('quiz_id', $id)
                ->orderBy('question_order')
                ->get()
                ->map(function ($question) {
                    return [
                        'id' => $question->id,
                        'question_text' => $question->question_text,
                        'question_type' => $question->question_type,
                        'points' => $question->points,
                        'options' => json_decode($question->options, true)
                    ];
                });

            // Check if student has already attempted
            $attempt = DB::table('quiz_attempts')
                ->where('quiz_id', $id)
                ->where('student_id', $user->id)
                ->first();

            return response()->json([
                'success' => true,
                'exam' => [
                    'id' => $exam->id,
                    'title' => $exam->title,
                    'description' => $exam->description,
                    'time_limit' => $exam->time_limit,
                    'passing_percentage' => $exam->passing_percentage,
                    'status' => $exam->status,
                    'total_questions' => count($questions),
                    'has_attempted' => $attempt ? true : false,
                    'attempt_score' => $attempt ? $attempt->score : null
                ],
                'questions' => $questions
            ]);
        } catch (\Exception $e) {
            \Log::error('Student exam details fetch error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load exam details',
                'error' => $e->getMessage()
            ], 500);
        }
    });

    // Submit exam attempt
    Route::post('/api/student/exams/{id}/submit', function (Request $request, $id) {
        try {
            $user = $request->user();
            
            if (!$user || $user->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            $validated = $request->validate([
                'answers' => 'required|array',
                'time_taken' => 'required|integer'
            ]);

            // Get exam
            $exam = DB::table('quizzes')
                ->where('id', $id)
                ->where('batch_id', $user->batch_id)
                ->first();

            if (!$exam) {
                return response()->json([
                    'success' => false,
                    'message' => 'Exam not found'
                ], 404);
            }

            // Check if already attempted
            $existingAttempt = DB::table('quiz_attempts')
                ->where('quiz_id', $id)
                ->where('student_id', $user->id)
                ->first();

            if ($existingAttempt) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already completed this exam'
                ], 400);
            }

            // Calculate score
            $questions = DB::table('quiz_questions')
                ->where('quiz_id', $id)
                ->get();

            $totalScore = 0;
            $maxScore = 0;
            $answersData = [];

            foreach ($questions as $question) {
                $maxScore += $question->points;
                $questionId = $question->id;
                $studentAnswer = $validated['answers'][$questionId] ?? null;
                
                $isCorrect = false;
                if ($studentAnswer !== null && $question->correct_answer == $studentAnswer) {
                    $isCorrect = true;
                    $totalScore += $question->points;
                }

                $answersData[] = [
                    'question_id' => $questionId,
                    'answer' => $studentAnswer,
                    'is_correct' => $isCorrect,
                    'points_earned' => $isCorrect ? $question->points : 0
                ];
            }

            $percentage = $maxScore > 0 ? ($totalScore / $maxScore) * 100 : 0;
            $passed = $percentage >= $exam->passing_percentage;

            // Create attempt record
            $attemptId = DB::table('quiz_attempts')->insertGetId([
                'quiz_id' => $id,
                'student_id' => $user->id,
                'score' => $totalScore,
                'max_score' => $maxScore,
                'percentage' => $percentage,
                'passed' => $passed,
                'time_taken' => $validated['time_taken'],
                'answers' => json_encode($answersData),
                'started_at' => now(),
                'completed_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Exam submitted successfully',
                'result' => [
                    'attempt_id' => $attemptId,
                    'score' => $totalScore,
                    'max_score' => $maxScore,
                    'percentage' => round($percentage, 2),
                    'passed' => $passed,
                    'time_taken' => $validated['time_taken']
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Student exam submit error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit exam',
                'error' => $e->getMessage()
            ], 500);
        }
    });
});

// Protected Routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Log Action Route - For logging user actions to system_logs table
    Route::post('/log-action', function (Request $request) {
        $request->validate([
            'action' => 'required|string|max:255',
            'description' => 'required|string',
            'log_level' => 'required|in:info,warning,error,critical,debug',
        ]);

        $user = $request->user();

        DB::table('system_logs')->insert([
            'user_id' => $user ? $user->id : null,
            'action' => $request->action,
            'description' => $request->description,
            'log_level' => $request->log_level,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Action logged successfully'
        ]);
    });
    
    // Admin Routes
    Route::get('/admin/dashboard-stats', function (Request $request) {
        // Query users with role 'applicant'
        $totalApplicants = \App\Models\User::where('role', 'applicant')->count();
        $activeApplications = \App\Models\User::where('role', 'applicant')
            ->whereIn('application_status', ['pending', 'under_review'])
            ->count();
        $approvedApplications = \App\Models\User::where('role', 'applicant')
            ->where('application_status', 'approved')
            ->count();
        $pendingApplications = \App\Models\User::where('role', 'applicant')
            ->where('application_status', 'pending')
            ->count();
        $rejectedApplications = \App\Models\User::where('role', 'applicant')
            ->where('application_status', 'rejected')
            ->count();
        $underReviewApplications = \App\Models\User::where('role', 'applicant')
            ->where('application_status', 'under_review')
            ->count();
        
        // Calculate growth rate (current month vs previous month)
        $currentMonthApplicants = \App\Models\User::where('role', 'applicant')
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();
        $previousMonthApplicants = \App\Models\User::where('role', 'applicant')
            ->whereYear('created_at', now()->subMonth()->year)
            ->whereMonth('created_at', now()->subMonth()->month)
            ->count();
        
        $enrollmentGrowth = $previousMonthApplicants > 0 
            ? round((($currentMonthApplicants - $previousMonthApplicants) / $previousMonthApplicants) * 100, 1)
            : 0;
        
        // Calculate conversion rate (approved / total * 100)
        $conversionRate = $totalApplicants > 0 
            ? round(($approvedApplications / $totalApplicants) * 100, 1)
            : 0;
        
        // Get TESDA voucher statistics
        $totalVouchers = DB::table('vouchers')->sum('quantity');
        $usedVouchers = DB::table('vouchers')->sum('used_count');
        $availableVouchers = $totalVouchers - $usedVouchers;
        $eligibleApplicants = \App\Models\User::where('role', 'applicant')
            ->where('voucher_eligibility', 'eligible')
            ->count();
        
        // Get active batches count
        $activeBatches = DB::table('batches')
            ->where('status', 'active')
            ->count();
        
        // Calculate average processing time for approved applications
        $avgProcessingDays = \App\Models\User::where('role', 'applicant')
            ->where('application_status', 'approved')
            ->whereNotNull('updated_at')
            ->selectRaw('AVG(DATEDIFF(updated_at, created_at)) as avg_days')
            ->value('avg_days');
        $avgProcessingTime = $avgProcessingDays ? round($avgProcessingDays, 1) : 0;
        
        // Get recent activities (last 10)
        $recentActivities = \App\Models\User::where('role', 'applicant')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function($applicant) {
                $timestamp = \Carbon\Carbon::parse($applicant->created_at)->diffForHumans();
                return [
                    'id' => $applicant->id,
                    'type' => 'application',
                    'status' => $applicant->application_status === 'approved' ? 'success' : 
                               ($applicant->application_status === 'rejected' ? 'error' : 'info'),
                    'priority' => $applicant->application_status === 'pending' ? 'high' : 'medium',
                    'message' => "New application submitted for " . ($applicant->course_program ?? 'Unknown Program'),
                    'user' => $applicant->first_name . ' ' . $applicant->last_name,
                    'timestamp' => $timestamp
                ];
            });
        
        return response()->json([
            'totalApplicants' => $totalApplicants,
            'activeApplications' => $activeApplications,
            'approvedApplications' => $approvedApplications,
            'pendingApplications' => $pendingApplications,
            'rejectedApplications' => $rejectedApplications,
            'underReviewApplications' => $underReviewApplications,
            'waitlistedApplicants' => 0,
            'enrollmentGrowth' => $enrollmentGrowth,
            'conversionRate' => $conversionRate,
            'tesdaVouchers' => $availableVouchers,
            'totalVouchers' => $totalVouchers,
            'usedVouchers' => $usedVouchers,
            'eligibleApplicants' => $eligibleApplicants,
            'activeBatches' => $activeBatches,
            'avgProcessingTime' => $avgProcessingTime,
            'recentActivities' => $recentActivities
        ]);
    });

    // Admin System Logs Route
    Route::get('/admin/system-logs', function (Request $request) {
        $query = DB::table('system_logs')
            ->leftJoin('users', 'system_logs.user_id', '=', 'users.id')
            ->select(
                'system_logs.*',
                'users.email as user_email',
                'users.first_name',
                'users.last_name',
                'users.role as user_role'
            );
        
        // Apply filters
        if ($request->has('level') && $request->level !== 'all') {
            $query->where('system_logs.log_level', $request->level);
        }
        
        if ($request->has('action') && $request->action !== 'all') {
            $query->where('system_logs.action', 'like', '%' . $request->action . '%');
        }
        
        if ($request->has('user_id') && $request->user_id !== 'all') {
            $query->where('system_logs.user_id', $request->user_id);
        }
        
        if ($request->has('start_date') && $request->start_date) {
            $query->where('system_logs.created_at', '>=', $request->start_date . ' 00:00:00');
        }
        
        if ($request->has('end_date') && $request->end_date) {
            $query->where('system_logs.created_at', '<=', $request->end_date . ' 23:59:59');
        }
        
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('system_logs.description', 'like', '%' . $request->search . '%')
                  ->orWhere('system_logs.action', 'like', '%' . $request->search . '%')
                  ->orWhere('users.email', 'like', '%' . $request->search . '%');
            });
        }
        
        // Order by most recent first
        $logs = $query->orderBy('system_logs.created_at', 'desc')
            ->paginate($request->input('per_page', 50));
        
        // Format the logs
        $formattedLogs = $logs->getCollection()->map(function($log) {
            return [
                'id' => $log->id,
                'user_id' => $log->user_id,
                'action' => $log->action,
                'description' => $log->description,
                'log_level' => $log->log_level,
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
                'created_at' => $log->created_at,
                'user' => $log->user_email ? [
                    'email' => $log->user_email,
                    'name' => trim(($log->first_name ?? '') . ' ' . ($log->last_name ?? '')),
                    'role' => $log->user_role,
                ] : null,
            ];
        });
        
        return response()->json([
            'success' => true,
            'logs' => $formattedLogs,
            'pagination' => [
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'from' => $logs->firstItem(),
                'to' => $logs->lastItem(),
            ]
        ]);
    });

    // Admin Applications Routes
    Route::get('/admin/applications', function (Request $request) {
        // Get all applicants (users with role 'applicant')
        $applications = \App\Models\User::where('role', 'applicant')
            ->orderBy('created_at', 'desc')
            ->select('id', 'first_name', 'last_name', 'email', 'phone_number', 'course_program', 'application_status', 'status', 'created_at', 'valid_id_path', 'transcript_path', 'diploma_path', 'passport_photo_path')
            ->get();
        
        // Format program names and convert to array
        $formatted_applications = $applications->map(function($app) {
            $program_title = 'Not specified';
            
            if ($app->course_program) {
                // Check if course_program is a numeric ID
                if (is_numeric($app->course_program)) {
                    // Fetch the program title from the programs table
                    $program = \App\Models\Program::find($app->course_program);
                    $program_title = $program ? $program->title : 'Not specified';
                } else {
                    // Convert slug to readable name
                    $formatted = str_replace('-', ' ', $app->course_program);
                    $formatted = ucwords($formatted);
                    $formatted = preg_replace('/\bNc\b/', 'NC', $formatted);
                    $formatted = preg_replace('/\bIi\b/', 'II', $formatted);
                    $formatted = preg_replace('/\bIii\b/', 'III', $formatted);
                    $formatted = preg_replace('/\bIv\b/', 'IV', $formatted);
                    $program_title = $formatted;
                }
            }
            
            return [
                'id' => $app->id,
                'first_name' => $app->first_name,
                'last_name' => $app->last_name,
                'email' => $app->email,
                'phone' => $app->phone_number,
                'course_program' => $program_title,
                'application_status' => $app->application_status,
                'status' => $app->status,
                'created_at' => $app->created_at,
                'valid_id' => $app->valid_id_path,
                'transcript' => $app->transcript_path,
                'diploma' => $app->diploma_path,
                'passport_photo' => $app->passport_photo_path,
            ];
        });
        
        return response()->json([
            'applications' => $formatted_applications
        ]);
    });

    // Admin Get Single Applicant Details
    Route::get('/admin/applicants/{id}', function (Request $request, $id) {
        $applicant = \App\Models\User::where('role', 'applicant')
            ->where('id', $id)
            ->first();
        
        if (!$applicant) {
            return response()->json(['message' => 'Applicant not found'], 404);
        }

        // Format program name
        if ($applicant->course_program) {
            if (is_numeric($applicant->course_program)) {
                $program = \App\Models\Program::find($applicant->course_program);
                $applicant->course_program_formatted = $program ? $program->title : 'Not specified';
            } else {
                $formatted = str_replace('-', ' ', $applicant->course_program);
                $formatted = ucwords($formatted);
                $formatted = preg_replace('/\bNc\b/', 'NC', $formatted);
                $formatted = preg_replace('/\bIi\b/', 'II', $formatted);
                $formatted = preg_replace('/\bIii\b/', 'III', $formatted);
                $formatted = preg_replace('/\bIv\b/', 'IV', $formatted);
                $applicant->course_program_formatted = $formatted;
            }
        } else {
            $applicant->course_program_formatted = 'Not specified';
        }

        return response()->json([
            'applicant' => [
                'id' => $applicant->id,
                'first_name' => $applicant->first_name,
                'last_name' => $applicant->last_name,
                'email' => $applicant->email,
                'phone' => $applicant->phone_number,
                'course_program' => $applicant->course_program_formatted,
                'application_status' => $applicant->application_status,
                'status' => $applicant->status,
                'created_at' => $applicant->created_at,
                'valid_id' => $applicant->valid_id_path,
                'transcript' => $applicant->transcript_path,
                'diploma' => $applicant->diploma_path,
                'passport_photo' => $applicant->passport_photo_path
            ]
        ]);
    });

    // Admin Update Applicant
    Route::put('/admin/applicants/{id}', function (Request $request, $id) {
        $applicant = \App\Models\User::where('role', 'applicant')
            ->where('id', $id)
            ->first();
        
        if (!$applicant) {
            return response()->json(['message' => 'Applicant not found'], 404);
        }

        $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $id,
            'phone' => 'sometimes|nullable|string|max:20',
            'application_status' => 'sometimes|in:pending,under_review,approved,rejected'
        ]);

        if ($request->has('first_name')) {
            $applicant->first_name = $request->first_name;
        }
        if ($request->has('last_name')) {
            $applicant->last_name = $request->last_name;
        }
        if ($request->has('email')) {
            $applicant->email = $request->email;
        }
        if ($request->has('phone')) {
            $applicant->phone_number = $request->phone;
        }
        if ($request->has('application_status')) {
            $applicant->application_status = $request->application_status;
        }

        $applicant->save();

        return response()->json([
            'message' => 'Applicant updated successfully',
            'applicant' => $applicant
        ]);
    });

    // Admin Delete Applicant
    Route::delete('/admin/applicants/{id}', function (Request $request, $id) {
        $applicant = \App\Models\User::where('role', 'applicant')
            ->where('id', $id)
            ->first();
        
        if (!$applicant) {
            return response()->json(['message' => 'Applicant not found'], 404);
        }

        // Delete associated files if they exist
        $files = [
            $applicant->valid_id_path,
            $applicant->transcript_path,
            $applicant->diploma_path,
            $applicant->passport_photo_path
        ];

        foreach ($files as $file) {
            if ($file && Storage::exists('public/' . $file)) {
                Storage::delete('public/' . $file);
            }
        }

        $applicant->delete();

        return response()->json([
            'message' => 'Applicant deleted successfully'
        ]);
    });
    
    Route::get('/applications', [ApplicationController::class, 'list']);
    
    // Trainer Routes
    Route::get('/trainer/assigned-programs', function (Request $request) {
        $user = $request->user();
        
        // Get distinct programs assigned to this trainer through batches
        $programs = DB::table('batches')
            ->join('programs', 'batches.program_id', '=', 'programs.id')
            ->where('batches.trainer_id', $user->id)
            ->select('programs.id', 'programs.title')
            ->distinct()
            ->get();
        
        return response()->json([
            'programs' => $programs
        ]);
    });

    // Get batches assigned to the authenticated trainer
    Route::get('/trainer/batches', function (Request $request) {
        $user = $request->user();
        
        if ($user->role !== 'trainer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get batches assigned to this trainer with program details
        $batches = DB::table('batches')
            ->join('programs', 'batches.program_id', '=', 'programs.id')
            ->where('batches.trainer_id', $user->id)
            ->select(
                'batches.id',
                'batches.batch_id',
                'batches.program_id',
                'batches.status',
                'batches.start_date',
                'batches.end_date',
                'batches.max_students',
                'batches.schedule_days',
                'batches.schedule_time_start',
                'batches.schedule_time_end',
                'programs.title as program_name'
            )
            ->orderBy('batches.created_at', 'desc')
            ->get();

        // Count students in each batch
        $batches = $batches->map(function ($batch) {
            $studentCount = DB::table('users')
                ->where('batch_id', $batch->batch_id)
                ->where('role', 'student')
                ->count();
            
            $batch->student_count = $studentCount;
            $batch->schedule_days = json_decode($batch->schedule_days);
            $batch->name = $batch->batch_id; // Add name field for dropdown compatibility
            
            return $batch;
        });
        
        return response()->json([
            'success' => true,
            'data' => $batches
        ]);
    });

    // TESDA Assessment Routes
    
    // Get all TESDA assessment records
    Route::get('/trainer/tesda-assessments', function (Request $request) {
        $trainer = $request->user();
        
        if ($trainer->role !== 'trainer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $assessments = DB::table('tesda_assessments')
            ->where('trainer_id', $trainer->id)
            ->orderBy('assessment_date', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $assessments
        ]);
    });
    
    // Create new TESDA assessment record
    Route::post('/trainer/tesda-assessments', function (Request $request) {
        $trainer = $request->user();
        
        if ($trainer->role !== 'trainer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $validated = $request->validate([
            'student_id' => 'required|string|max:255',
            'student_name' => 'required|string|max:255',
            'program_id' => 'required|integer',
            'batch_id' => 'required|integer',
            'assessment_date' => 'required|date',
            'tesda_assessor' => 'nullable|string|max:255',
            'result' => 'required|in:competent,not_competent,pending',
            'remarks' => 'nullable|string|max:1000'
        ]);
        
        $assessmentId = DB::table('tesda_assessments')->insertGetId([
            'trainer_id' => $trainer->id,
            'student_id' => $validated['student_id'],
            'student_name' => $validated['student_name'],
            'program_id' => $validated['program_id'],
            'batch_id' => $validated['batch_id'],
            'assessment_date' => $validated['assessment_date'],
            'tesda_assessor' => $validated['tesda_assessor'] ?? null,
            'result' => $validated['result'],
            'remarks' => $validated['remarks'] ?? null,
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'TESDA assessment record created successfully',
            'data' => ['id' => $assessmentId]
        ], 201);
    });
    
    // Update TESDA assessment record
    Route::put('/trainer/tesda-assessments/{id}', function (Request $request, $id) {
        $trainer = $request->user();
        
        if ($trainer->role !== 'trainer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $assessment = DB::table('tesda_assessments')
            ->where('id', $id)
            ->where('trainer_id', $trainer->id)
            ->first();
        
        if (!$assessment) {
            return response()->json([
                'success' => false,
                'message' => 'Assessment record not found'
            ], 404);
        }
        
        $validated = $request->validate([
            'student_id' => 'required|string|max:255',
            'student_name' => 'required|string|max:255',
            'program_id' => 'required|integer',
            'batch_id' => 'required|integer',
            'assessment_date' => 'required|date',
            'tesda_assessor' => 'nullable|string|max:255',
            'result' => 'required|in:competent,not_competent,pending',
            'remarks' => 'nullable|string|max:1000'
        ]);
        
        DB::table('tesda_assessments')
            ->where('id', $id)
            ->update([
                'student_id' => $validated['student_id'],
                'student_name' => $validated['student_name'],
                'program_id' => $validated['program_id'],
                'batch_id' => $validated['batch_id'],
                'assessment_date' => $validated['assessment_date'],
                'tesda_assessor' => $validated['tesda_assessor'] ?? null,
                'result' => $validated['result'],
                'remarks' => $validated['remarks'] ?? null,
                'updated_at' => now()
            ]);
        
        return response()->json([
            'success' => true,
            'message' => 'TESDA assessment record updated successfully'
        ]);
    });
    
    // Delete TESDA assessment record
    Route::delete('/trainer/tesda-assessments/{id}', function (Request $request, $id) {
        $trainer = $request->user();
        
        if ($trainer->role !== 'trainer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $assessment = DB::table('tesda_assessments')
            ->where('id', $id)
            ->where('trainer_id', $trainer->id)
            ->first();
        
        if (!$assessment) {
            return response()->json([
                'success' => false,
                'message' => 'Assessment record not found'
            ], 404);
        }
        
        DB::table('tesda_assessments')->where('id', $id)->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'TESDA assessment record deleted successfully'
        ]);
    });
    
    // Get programs list for dropdowns
    Route::get('/trainer/programs', function (Request $request) {
        $trainer = $request->user();
        
        if ($trainer->role !== 'trainer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        // Get distinct programs from trainer's batches
        $programs = DB::table('batches')
            ->join('programs', 'batches.program_id', '=', 'programs.id')
            ->where('batches.trainer_id', $trainer->id)
            ->select('programs.id', 'programs.title as name')
            ->distinct()
            ->orderBy('programs.title')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $programs
        ]);
    });
    
    // Get students list for TESDA assessments
    Route::get('/trainer/students', function (Request $request) {
        $trainer = $request->user();
        
        if ($trainer->role !== 'trainer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        // Get batches assigned to this trainer
        $trainerBatches = DB::table('batches')
            ->where('trainer_id', $trainer->id)
            ->pluck('batch_id');
        
        // Get students in those batches
        $students = DB::table('users')
            ->whereIn('batch_id', $trainerBatches)
            ->where('role', 'student')
            ->where('status', 'active')
            ->select('id', 'student_id', 'first_name', 'last_name', 'batch_id')
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get();
        
        // Add program_id and batch_id mapping
        $students = $students->map(function ($student) {
            // Get batch details
            $batch = DB::table('batches')
                ->where('batch_id', $student->batch_id)
                ->first();
            
            return [
                'id' => $student->id,
                'student_id' => $student->student_id,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'program_id' => $batch ? $batch->program_id : null,
                'batch_id' => $batch ? $batch->id : null
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $students
        ]);
    });

    // Update Trainer Profile
    Route::put('/trainer/profile', function (Request $request) {
        $user = $request->user();
        
        if ($user->role !== 'trainer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone_number' => 'sometimes|nullable|string|max:20',
            'address' => 'sometimes|nullable|string|max:500',
            'date_of_birth' => 'sometimes|nullable|date',
            'gender' => 'sometimes|nullable|in:male,female,other',
            'specialization' => 'sometimes|nullable|string|max:255',
            'experience' => 'sometimes|nullable|string|max:255',
            'bio' => 'sometimes|nullable|string|max:1000',
        ]);

        // Update only the fields that were provided
        if ($request->has('first_name')) {
            $user->first_name = $request->first_name;
        }
        if ($request->has('last_name')) {
            $user->last_name = $request->last_name;
        }
        if ($request->has('phone_number')) {
            $user->phone_number = $request->phone_number;
        }
        if ($request->has('address')) {
            $user->address = $request->address;
        }
        if ($request->has('date_of_birth')) {
            $user->date_of_birth = $request->date_of_birth;
        }
        if ($request->has('gender')) {
            $user->gender = $request->gender;
        }
        if ($request->has('specialization')) {
            $user->specialization = $request->specialization;
        }
        if ($request->has('experience')) {
            $user->experience = $request->experience;
        }
        if ($request->has('bio')) {
            $user->bio = $request->bio;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'address' => $user->address,
                'date_of_birth' => $user->date_of_birth,
                'gender' => $user->gender,
                'role' => $user->role,
                'status' => $user->status,
                'specialization' => $user->specialization,
                'certifications' => $user->certifications,
                'experience' => $user->experience,
                'bio' => $user->bio,
                'assigned_programs' => $user->assigned_programs,
            ]
        ]);
    });

    // Update Trainer Password
    Route::put('/trainer/password', function (Request $request) {
        $user = $request->user();
        
        if ($user->role !== 'trainer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 400);
        }

        // Update password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully'
        ]);
    });
    
    // Trainer Announcements Routes
    
    // Get all announcements for trainer
    Route::get('/trainer/announcements', function (Request $request) {
        $trainer = $request->user();
        
        if ($trainer->role !== 'trainer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $announcements = DB::table('trainer_announcements')
            ->where('trainer_id', $trainer->id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Get batches for each announcement
        $announcements = $announcements->map(function ($announcement) {
            if ($announcement->target_type === 'specific') {
                $batches = DB::table('announcement_batches')
                    ->join('batches', 'announcement_batches.batch_id', '=', 'batches.batch_id')
                    ->where('announcement_batches.announcement_id', $announcement->id)
                    ->select('batches.id', 'batches.batch_id as batch_name')
                    ->get();
                
                $announcement->batches = $batches;
            } else {
                $announcement->batches = [];
            }
            
            return $announcement;
        });
        
        return response()->json([
            'success' => true,
            'announcements' => $announcements
        ]);
    });
    
    // Create announcement
    Route::post('/trainer/announcements', function (Request $request) {
        $trainer = $request->user();
        
        if ($trainer->role !== 'trainer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'required|in:low,normal,high',
            'target_type' => 'required|in:all,specific',
            'batch_ids' => 'required_if:target_type,specific|array',
            'batch_ids.*' => 'exists:batches,id'
        ]);
        
        // Get current time in Philippine timezone
        $philippineTime = now()->setTimezone('Asia/Manila');
        
        // Create announcement
        $announcementId = DB::table('trainer_announcements')->insertGetId([
            'trainer_id' => $trainer->id,
            'title' => $request->input('title'),
            'content' => $request->input('content'),
            'priority' => $request->input('priority'),
            'target_type' => $request->input('target_type'),
            'created_at' => $philippineTime,
            'updated_at' => $philippineTime
        ]);
        
        // If specific batches, create relationships
        if ($request->target_type === 'specific' && !empty($request->batch_ids)) {
            foreach ($request->batch_ids as $batchId) {
                // Get batch_id from id
                $batch = DB::table('batches')->where('id', $batchId)->first();
                if ($batch) {
                    DB::table('announcement_batches')->insert([
                        'announcement_id' => $announcementId,
                        'batch_id' => $batch->batch_id,
                        'created_at' => $philippineTime,
                        'updated_at' => $philippineTime
                    ]);
                }
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Announcement created successfully',
            'announcement_id' => $announcementId
        ], 201);
    });
    
    // Update announcement
    Route::put('/trainer/announcements/{id}', function (Request $request, $id) {
        $trainer = $request->user();
        
        if ($trainer->role !== 'trainer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $announcement = DB::table('trainer_announcements')
            ->where('id', $id)
            ->where('trainer_id', $trainer->id)
            ->first();
        
        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'Announcement not found'
            ], 404);
        }
        
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'required|in:low,normal,high',
            'target_type' => 'required|in:all,specific',
            'batch_ids' => 'required_if:target_type,specific|array',
            'batch_ids.*' => 'exists:batches,id'
        ]);
        
        // Get current time in Philippine timezone
        $philippineTime = now()->setTimezone('Asia/Manila');
        
        // Update announcement
        DB::table('trainer_announcements')
            ->where('id', $id)
            ->update([
                'title' => $request->input('title'),
                'content' => $request->input('content'),
                'priority' => $request->input('priority'),
                'target_type' => $request->input('target_type'),
                'updated_at' => $philippineTime
            ]);
        
        // Delete old batch relationships
        DB::table('announcement_batches')->where('announcement_id', $id)->delete();
        
        // If specific batches, create new relationships
        if ($request->target_type === 'specific' && !empty($request->batch_ids)) {
            foreach ($request->batch_ids as $batchId) {
                // Get batch_id from id
                $batch = DB::table('batches')->where('id', $batchId)->first();
                if ($batch) {
                    DB::table('announcement_batches')->insert([
                        'announcement_id' => $id,
                        'batch_id' => $batch->batch_id,
                        'created_at' => $philippineTime,
                        'updated_at' => $philippineTime
                    ]);
                }
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Announcement updated successfully'
        ]);
    });
    
    // Delete announcement
    Route::delete('/trainer/announcements/{id}', function (Request $request, $id) {
        $trainer = $request->user();
        
        if ($trainer->role !== 'trainer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $announcement = DB::table('trainer_announcements')
            ->where('id', $id)
            ->where('trainer_id', $trainer->id)
            ->first();
        
        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'Announcement not found'
            ], 404);
        }
        
        DB::table('trainer_announcements')->where('id', $id)->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Announcement deleted successfully'
        ]);
    });
    
    // Archive/Unarchive announcement
    Route::patch('/trainer/announcements/{id}/archive', function (Request $request, $id) {
        $trainer = $request->user();
        
        if ($trainer->role !== 'trainer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $announcement = DB::table('trainer_announcements')
            ->where('id', $id)
            ->where('trainer_id', $trainer->id)
            ->first();
        
        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'Announcement not found'
            ], 404);
        }
        
        $isArchived = $request->input('is_archived', true);
        
        // Get current time in Philippine timezone
        $philippineTime = now()->setTimezone('Asia/Manila');
        
        DB::table('trainer_announcements')
            ->where('id', $id)
            ->update([
                'is_archived' => $isArchived,
                'updated_at' => $philippineTime
            ]);
        
        return response()->json([
            'success' => true,
            'message' => $isArchived ? 'Announcement archived successfully' : 'Announcement restored successfully'
        ]);
    });
    
    // Attendance Routes for Trainers
    
    // Get students for attendance marking
    Route::get('/trainer/attendance/students', function (Request $request) {
        $user = $request->user();
        
        if ($user->role !== 'trainer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $date = $request->query('date', now()->toDateString());
        $batchId = $request->query('batch_id');
        $programId = $request->query('program_id');

        // Build query for students in trainer's batches
        // Only show students whose batch dates include the selected date
        $query = DB::table('users')
            ->join('batches', 'users.batch_id', '=', 'batches.batch_id')
            ->join('programs', 'batches.program_id', '=', 'programs.id')
            ->where('batches.trainer_id', $user->id)
            ->where('users.role', 'student')
            ->where('users.status', 'active')
            ->where('batches.start_date', '<=', $date)
            ->where('batches.end_date', '>=', $date);

        if ($batchId && $batchId !== 'all') {
            $query->where('batches.batch_id', $batchId);
        }

        if ($programId && $programId !== 'all') {
            $query->where('batches.program_id', $programId);
        }

        $students = $query->select(
            'users.id',
            'users.student_id',
            'users.first_name',
            'users.last_name',
            'users.email',
            'users.batch_id',
            'batches.program_id',
            'batches.start_date',
            'batches.end_date',
            'programs.title as program_name',
            'batches.schedule_time_start',
            'batches.schedule_time_end'
        )->get();

        // Get attendance records for the specified date
        $attendanceRecords = DB::table('attendances')
            ->where('date', $date)
            ->whereIn('user_id', $students->pluck('id'))
            ->get()
            ->keyBy('user_id');

        // Calculate attendance statistics for each student
        $studentsWithAttendance = $students->map(function ($student) use ($attendanceRecords, $date) {
            $attendance = $attendanceRecords->get($student->id);
            
            // Calculate overall attendance percentage
            $totalDays = DB::table('attendances')
                ->where('user_id', $student->id)
                ->distinct('date')
                ->count();
            
            $presentDays = DB::table('attendances')
                ->where('user_id', $student->id)
                ->whereIn('status', ['present', 'late'])
                ->count();
            
            $attendancePercentage = $totalDays > 0 ? round(($presentDays / $totalDays) * 100, 1) : 0;

            return [
                'id' => $student->id,
                'student_id' => $student->student_id,
                'name' => $student->first_name . ' ' . $student->last_name,
                'email' => $student->email,
                'batch_id' => $student->batch_id,
                'program_id' => $student->program_id,
                'program_name' => $student->program_name,
                'schedule_time_start' => $student->schedule_time_start,
                'schedule_time_end' => $student->schedule_time_end,
                'attendance' => $attendance ? [
                    'status' => $attendance->status,
                    'time_in' => $attendance->time_in,
                    'time_out' => $attendance->time_out,
                    'total_hours' => $attendance->total_hours,
                    'remarks' => $attendance->remarks,
                ] : null,
                'attendance_percentage' => $attendancePercentage,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $studentsWithAttendance,
            'date' => $date
        ]);
    });

    // Mark or update attendance
    Route::post('/trainer/attendance/mark', function (Request $request) {
        $user = $request->user();
        
        if ($user->role !== 'trainer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'batch_id' => 'required|exists:batches,batch_id',
            'date' => 'required|date',
            'status' => 'required|in:present,late,absent,excused',
            'time_in' => 'nullable|date_format:Y-m-d H:i:s',
            'time_out' => 'nullable|date_format:Y-m-d H:i:s',
            'remarks' => 'nullable|string|max:500',
        ]);

        // Verify the student belongs to a batch assigned to this trainer
        $batch = DB::table('batches')
            ->where('batch_id', $request->batch_id)
            ->where('trainer_id', $user->id)
            ->first();

        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to mark attendance for this batch'
            ], 403);
        }

        // Verify the date is within the batch's start and end dates
        $requestDate = new \DateTime($request->date);
        $startDate = new \DateTime($batch->start_date);
        $endDate = new \DateTime($batch->end_date);

        if ($requestDate < $startDate || $requestDate > $endDate) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot mark attendance outside of batch dates (' . 
                    $batch->start_date . ' to ' . $batch->end_date . ')'
            ], 400);
        }

        // Calculate total hours if both time_in and time_out are provided
        $totalHours = 0;
        if ($request->time_in && $request->time_out) {
            $timeIn = new \DateTime($request->time_in);
            $timeOut = new \DateTime($request->time_out);
            $diff = $timeIn->diff($timeOut);
            $totalHours = round($diff->h + ($diff->i / 60), 2);
        }

        // Create or update attendance record
        $attendance = \App\Models\Attendance::updateOrCreate(
            [
                'user_id' => $request->user_id,
                'batch_id' => $request->batch_id,
                'date' => $request->date,
            ],
            [
                'status' => $request->status,
                'time_in' => $request->time_in,
                'time_out' => $request->time_out,
                'total_hours' => $totalHours,
                'remarks' => $request->remarks,
                'marked_by' => $user->id,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Attendance marked successfully',
            'data' => $attendance
        ]);
    });

    // Get attendance report for a batch
    Route::get('/trainer/attendance/report', function (Request $request) {
        $user = $request->user();
        
        if ($user->role !== 'trainer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $batchId = $request->query('batch_id');
        $startDate = $request->query('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->query('end_date', now()->toDateString());

        if (!$batchId) {
            return response()->json([
                'success' => false,
                'message' => 'Batch ID is required'
            ], 400);
        }

        // Verify the batch belongs to this trainer
        $batch = DB::table('batches')
            ->where('batch_id', $batchId)
            ->where('trainer_id', $user->id)
            ->first();

        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'Batch not found or not assigned to you'
            ], 404);
        }

        // Get attendance records
        $attendanceData = DB::table('attendances')
            ->join('users', 'attendances.user_id', '=', 'users.id')
            ->where('attendances.batch_id', $batchId)
            ->whereBetween('attendances.date', [$startDate, $endDate])
            ->select(
                'attendances.*',
                'users.student_id',
                'users.first_name',
                'users.last_name'
            )
            ->orderBy('attendances.date', 'desc')
            ->orderBy('users.last_name')
            ->get();

        // Group by student
        $studentAttendance = $attendanceData->groupBy('user_id')->map(function ($records, $userId) {
            $student = $records->first();
            $totalDays = $records->count();
            $presentDays = $records->whereIn('status', ['present', 'late'])->count();
            $lateDays = $records->where('status', 'late')->count();
            $absentDays = $records->where('status', 'absent')->count();
            $totalHours = $records->sum('total_hours');

            return [
                'user_id' => $userId,
                'student_id' => $student->student_id,
                'name' => $student->first_name . ' ' . $student->last_name,
                'total_days' => $totalDays,
                'present_days' => $presentDays,
                'late_days' => $lateDays,
                'absent_days' => $absentDays,
                'total_hours' => round($totalHours, 2),
                'attendance_percentage' => $totalDays > 0 ? round(($presentDays / $totalDays) * 100, 1) : 0,
                'records' => $records
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'batch_id' => $batchId,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'students' => $studentAttendance
            ]
        ]);
    });
    
    // Get trainer's assessment results
    Route::get('/trainer/assessment-results', function (Request $request) {
        $trainer = $request->user();
        
        if ($trainer->role !== 'trainer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only trainers can access this endpoint.'
            ], 403);
        }
        
        // Get batches assigned to this trainer
        $batches = DB::table('batches')
            ->where('trainer_id', $trainer->id)
            ->pluck('batch_id');
        
        if ($batches->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
                'programs' => [],
                'batches' => [],
                'message' => 'No batches assigned to this trainer'
            ]);
        }
        
        // Get all grades for students in the trainer's batches
        $grades = \App\Models\Grade::whereIn('batch_id', $batches)
            ->with(['student', 'batch.program', 'quiz'])
            ->orderBy('graded_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Format the results
        $results = $grades->map(function ($grade) {
            $student = $grade->student;
            $batch = $grade->batch;
            $program = $batch ? $batch->program : ($grade->program ?? null);
            
            return [
                'id' => $grade->id,
                'student_id' => $student->student_id ?? $student->id,
                'student_name' => $student->first_name . ' ' . $student->last_name,
                'program_name' => $program ? $program->title : 'N/A',
                'program_id' => $program ? $program->id : null,
                'batch_id' => $grade->batch_id,
                'batch_name' => $batch ? $batch->batch_id : 'N/A',
                'assessment_type' => $grade->assessment_type,
                'assessment_title' => $grade->assessment_title,
                'score' => $grade->score,
                'total_points' => $grade->total_points,
                'percentage' => $grade->percentage,
                'passing_score' => $grade->passing_score,
                'status' => $grade->status,
                'competency_status' => $grade->percentage >= 85 ? 'competent' : 'not-competent',
                'graded_at' => $grade->graded_at,
                'feedback' => $grade->feedback,
                'attempt_number' => $grade->attempt_number,
            ];
        });
        
        // Get unique programs and batches for filtering
        $programs = $results->unique('program_id')->map(function ($item) {
            return [
                'id' => $item['program_id'],
                'name' => $item['program_name']
            ];
        })->values();
        
        $batchList = $results->unique('batch_id')->map(function ($item) {
            return [
                'id' => $item['batch_id'],
                'name' => $item['batch_name']
            ];
        })->values();
        
        return response()->json([
            'success' => true,
            'data' => $results,
            'programs' => $programs,
            'batches' => $batchList,
        ]);
    });
    
    // Get trainer's student grades for grade management
    Route::get('/trainer/grades', function (Request $request) {
        $trainer = $request->user();
        
        if ($trainer->role !== 'trainer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only trainers can access this endpoint.'
            ], 403);
        }
        
        // Get batches assigned to this trainer
        $batches = DB::table('batches')
            ->where('trainer_id', $trainer->id)
            ->pluck('batch_id');
        
        if ($batches->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
                'programs' => [],
                'batches' => [],
                'message' => 'No batches assigned to this trainer'
            ]);
        }
        
        // Get all students in the trainer's batches
        $students = \App\Models\User::whereIn('batch_id', $batches)
            ->where('role', 'student')
            ->with(['batch.program'])
            ->get();
        
        // Get all grades for these students
        $studentData = $students->map(function ($student) {
            $batch = $student->batch;
            $program = $batch ? $batch->program : null;
            
            // Get grades grouped by assessment type
            $grades = \App\Models\Grade::where('user_id', $student->id)
                ->get()
                ->groupBy('assessment_type');
            
            // Calculate average for each assessment type
            $gradesByType = [
                'written' => null,
                'oral' => null,
                'demonstration' => null,
                'observation' => null,
            ];
            
            foreach ($grades as $type => $typeGrades) {
                if ($typeGrades->isNotEmpty()) {
                    $avg = $typeGrades->avg('percentage');
                    $gradesByType[$type] = round($avg, 2);
                }
            }
            
            return [
                'id' => $student->id,
                'student_id' => $student->student_id ?? $student->id,
                'name' => $student->first_name . ' ' . $student->last_name,
                'program' => $program ? $program->title : 'N/A',
                'program_id' => $program ? $program->id : null,
                'batch_id' => $student->batch_id,
                'batch_name' => $batch ? $batch->batch_id : 'N/A',
                'grades' => $gradesByType,
            ];
        });
        
        // Get unique programs and batches for filtering
        $programs = $studentData->unique('program_id')->filter(function ($item) {
            return $item['program_id'] !== null;
        })->map(function ($item) {
            return [
                'id' => $item['program_id'],
                'name' => $item['program']
            ];
        })->values();
        
        $batchList = $studentData->unique('batch_id')->filter(function ($item) {
            return $item['batch_id'] !== null;
        })->map(function ($item) {
            return [
                'id' => $item['batch_id'],
                'name' => $item['batch_name']
            ];
        })->values();
        
        return response()->json([
            'success' => true,
            'data' => $studentData,
            'programs' => $programs,
            'batches' => $batchList,
        ]);
    });
    
    // Update student grade for a specific assessment
    Route::post('/trainer/grades/update', function (Request $request) {
        $trainer = $request->user();
        
        if ($trainer->role !== 'trainer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only trainers can access this endpoint.'
            ], 403);
        }
        
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'assessment_type' => 'required|in:oral,demonstration,observation',
            'score' => 'required|numeric|min:0|max:100',
            'assessment_title' => 'required|string',
        ]);
        
        $student = \App\Models\User::find($request->student_id);
        
        // Verify student is in trainer's batch
        $trainerBatches = DB::table('batches')
            ->where('trainer_id', $trainer->id)
            ->pluck('batch_id');
        
        if (!$trainerBatches->contains($student->batch_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Student is not in your assigned batches'
            ], 403);
        }
        
        // Get batch and program info
        $batch = \App\Models\Batch::where('batch_id', $student->batch_id)->first();
        $programId = $batch ? $batch->program_id : null;
        
        // Create or update grade
        $grade = \App\Models\Grade::updateOrCreate(
            [
                'user_id' => $student->id,
                'assessment_type' => $request->assessment_type,
                'assessment_title' => $request->assessment_title,
            ],
            [
                'score' => $request->score,
                'total_points' => 100,
                'percentage' => $request->score,
                'passing_score' => 75,
                'status' => $request->score >= 75 ? 'passed' : 'failed',
                'graded_by' => $trainer->id,
                'graded_at' => now(),
                'batch_id' => $student->batch_id,
                'program_id' => $programId,
            ]
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Grade updated successfully',
            'grade' => $grade
        ]);
    });
    
    // Certification Management Route
    Route::get('/trainer/certification/students', function (Request $request) {
        $trainer = $request->user();
        
        if ($trainer->role !== 'trainer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only trainers can access this endpoint.'
            ], 403);
        }
        
        // Get batches assigned to this trainer
        $batches = DB::table('batches')
            ->where('trainer_id', $trainer->id)
            ->pluck('batch_id');
        
        if ($batches->isEmpty()) {
            return response()->json([
                'success' => true,
                'students' => [],
                'programs' => [],
                'sections' => [],
                'message' => 'No batches assigned to this trainer'
            ]);
        }
        
        // Get all students in the trainer's batches with their progress data
        $students = \App\Models\User::whereIn('batch_id', $batches)
            ->where('role', 'student')
            ->with(['batch.program', 'grades', 'attendances'])
            ->get();
        
        // Calculate certification eligibility for each student
        $studentData = $students->map(function ($student) {
            $batch = $student->batch;
            $program = $batch ? $batch->program : null;
            
            // Calculate attendance percentage
            $totalClasses = \App\Models\Attendance::where('batch_id', $student->batch_id)
                ->distinct()
                ->count('date');
            
            $attendedClasses = \App\Models\Attendance::where('user_id', $student->id)
                ->whereIn('status', ['present', 'late'])
                ->count();
            
            $attendancePercentage = $totalClasses > 0 ? round(($attendedClasses / $totalClasses) * 100, 2) : 0;
            
            // Calculate grades by assessment type
            $grades = $student->grades;
            $gradesByType = [
                'practical' => $grades->whereIn('assessment_type', ['demonstration', 'observation'])->avg('percentage') ?? 0,
                'theoretical' => $grades->whereIn('assessment_type', ['oral', 'written'])->avg('percentage') ?? 0,
            ];
            
            $overallGrade = $grades->avg('percentage') ?? 0;
            
            // Count completed modules (assessments passed)
            $completedModules = $grades->where('status', 'passed')->count();
            $totalModules = 12; // Default, can be made dynamic
            
            // Get detailed grades list
            $gradesList = $grades->map(function ($grade) {
                return [
                    'id' => $grade->id,
                    'assessment_title' => $grade->assessment_title,
                    'assessment_type' => $grade->assessment_type,
                    'score' => $grade->score,
                    'total_points' => $grade->total_points,
                    'percentage' => $grade->percentage,
                    'status' => $grade->status,
                    'graded_at' => $grade->graded_at ? $grade->graded_at->toDateString() : null,
                ];
            })->values();
            
            // Check if student has TESDA assessment record
            $hasTesdaAssessment = DB::table('tesda_assessments')
                ->where('student_id', $student->student_id)
                ->exists();
            
            // Check if certificate already exists for this student
            $certificate = DB::table('certificates')
                ->where('user_id', $student->id)
                ->where('program_id', $program ? $program->id : null)
                ->first();
            
            // Determine certification requirements
            $requirements = [
                'attendance' => $attendancePercentage >= 85,
                'grades' => $overallGrade >= 75,
                'practicals' => $gradesByType['practical'] >= 75,
                'theoretical' => $gradesByType['theoretical'] >= 75,
                'modules' => $completedModules >= $totalModules,
            ];
            
            // Determine certification status
            $allRequirementsMet = !in_array(false, $requirements, true);
            $status = $allRequirementsMet ? 'eligible' : 
                     ($attendancePercentage >= 85 && $overallGrade >= 70 ? 'pending' : 'not-eligible');
            
            // Generate remarks
            $remarks = '';
            if (!$requirements['attendance']) {
                $remarks = 'Attendance below required threshold (85%)';
            } elseif (!$requirements['modules']) {
                $remarks = 'Pending completion of remaining modules';
            } elseif (!$requirements['grades']) {
                $remarks = 'Overall grades below required threshold (75%)';
            }
            
            return [
                'id' => $student->id,
                'name' => $student->first_name . ' ' . $student->last_name,
                'student_id' => $student->student_id ?? 'N/A',
                'program' => $program ? $program->title : 'N/A',
                'program_id' => $program ? $program->id : null,
                'section' => $batch ? $batch->batch_id : 'N/A',
                'batch_id' => $student->batch_id,
                'has_tesda_assessment' => $hasTesdaAssessment,
                'progress' => [
                    'attendance' => round($attendancePercentage, 2),
                    'overall_grade' => round($overallGrade, 2),
                    'practical_assessments' => round($gradesByType['practical'], 2),
                    'theoretical_assessments' => round($gradesByType['theoretical'], 2),
                    'completed_modules' => $completedModules,
                    'total_modules' => $totalModules,
                ],
                'grades' => $gradesList,
                'certificate' => $certificate ? [
                    'certificate_number' => $certificate->certificate_number,
                    'issued_date' => $certificate->issued_date,
                    'status' => $certificate->status,
                ] : null,
                'certification' => [
                    'status' => $certificate ? 'certified' : $status,
                    'remarks' => $certificate ? 'Certificate already issued' : $remarks,
                    'last_updated' => now()->toIso8601String(),
                    'requirements' => $requirements,
                ],
            ];
        });
        
        // Get unique programs for filtering
        $programs = $studentData->unique('program_id')->filter(function ($item) {
            return $item['program_id'] !== null;
        })->map(function ($item) {
            return [
                'value' => $item['program_id'],
                'label' => $item['program']
            ];
        })->values();
        
        // Get unique sections for filtering
        $sections = $studentData->unique('batch_id')->filter(function ($item) {
            return $item['batch_id'] !== null;
        })->map(function ($item) {
            return [
                'value' => $item['batch_id'],
                'label' => $item['section']
            ];
        })->values();
        
        return response()->json([
            'success' => true,
            'students' => $studentData->values(),
            'programs' => $programs,
            'sections' => $sections,
        ]);
    });
    
    // Generate Certificate for Student
    Route::post('/trainer/certification/generate', function (Request $request) {
        $trainer = $request->user();
        
        if ($trainer->role !== 'trainer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only trainers can access this endpoint.'
            ], 403);
        }
        
        $request->validate([
            'student_id' => 'required|exists:users,id',
        ]);
        
        $student = \App\Models\User::with(['batch.program'])->find($request->student_id);
        
        if (!$student || $student->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }
        
        // Verify student is in trainer's batch
        $trainerBatches = DB::table('batches')
            ->where('trainer_id', $trainer->id)
            ->pluck('batch_id');
        
        if (!$trainerBatches->contains($student->batch_id)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to generate certificate for this student'
            ], 403);
        }
        
        // Verify student is eligible
        $grades = $student->grades;
        $overallGrade = $grades->avg('percentage') ?? 0;
        
        $totalClasses = \App\Models\Attendance::where('batch_id', $student->batch_id)
            ->distinct()
            ->count('date');
        
        $attendedClasses = \App\Models\Attendance::where('user_id', $student->id)
            ->whereIn('status', ['present', 'late'])
            ->count();
        
        $attendancePercentage = $totalClasses > 0 ? round(($attendedClasses / $totalClasses) * 100, 2) : 0;
        
        if ($attendancePercentage < 85 || $overallGrade < 75) {
            return response()->json([
                'success' => false,
                'message' => 'Student does not meet certification requirements',
                'requirements' => [
                    'attendance' => $attendancePercentage,
                    'overall_grade' => $overallGrade,
                    'required_attendance' => 85,
                    'required_grade' => 75,
                ]
            ], 400);
        }
        
        // Check if certificate already exists
        $existingCertificate = DB::table('certificates')
            ->where('user_id', $student->id)
            ->where('program_id', $student->batch->program_id)
            ->first();
        
        if ($existingCertificate) {
            return response()->json([
                'success' => false,
                'message' => 'Certificate already exists for this student',
                'certificate' => [
                    'id' => $existingCertificate->id,
                    'certificate_number' => $existingCertificate->certificate_number,
                    'issued_date' => $existingCertificate->issued_date,
                ]
            ], 400);
        }
        
        // Generate certificate number
        $year = now()->year;
        $lastCertificate = DB::table('certificates')
            ->where('certificate_number', 'like', "CERT-$year-%")
            ->orderBy('id', 'desc')
            ->first();
        
        $lastNumber = $lastCertificate 
            ? intval(substr($lastCertificate->certificate_number, -4)) 
            : 0;
        
        $certificateNumber = sprintf("CERT-%s-%04d", $year, $lastNumber + 1);
        
        // Create certificate record
        $certificateId = DB::table('certificates')->insertGetId([
            'certificate_number' => $certificateNumber,
            'user_id' => $student->id,
            'program_id' => $student->batch->program_id,
            'issued_date' => now(),
            'issued_by' => $trainer->id,
            'grade' => round($overallGrade, 2),
            'attendance_rate' => round($attendancePercentage, 2),
            'status' => 'issued',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Certificate generated successfully',
            'certificate' => [
                'id' => $certificateId,
                'certificate_number' => $certificateNumber,
                'student_name' => $student->first_name . ' ' . $student->last_name,
                'student_id' => $student->student_id,
                'program' => $student->batch->program->title,
                'grade' => round($overallGrade, 2),
                'attendance_rate' => round($attendancePercentage, 2),
                'issued_date' => now()->toDateString(),
                'issued_by' => $trainer->first_name . ' ' . $trainer->last_name,
            ]
        ]);
    });
    
    // Course Materials Routes
    // Get course materials for trainer's assigned programs
    Route::get('/trainer/course-materials', function (Request $request) {
        $user = $request->user();
        
        if ($user->role !== 'trainer' && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        // If admin, get all materials. If trainer, get only assigned program materials
        if ($user->role === 'admin') {
            $materials = \App\Models\CourseMaterial::with(['program', 'uploader'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Get programs assigned to this trainer
            $programIds = DB::table('batches')
                ->where('trainer_id', $user->id)
                ->distinct()
                ->pluck('program_id');
            
            $materials = \App\Models\CourseMaterial::whereIn('program_id', $programIds)
                ->with(['program', 'uploader'])
                ->orderBy('created_at', 'desc')
                ->get();
        }
        
        // Transform materials
        $materials = $materials->map(function ($material) {
                return [
                    'id' => $material->id,
                    'title' => $material->title,
                    'description' => $material->description,
                    'program_id' => $material->program_id,
                    'program' => [
                        'id' => $material->program->id,
                        'title' => $material->program->title
                    ],
                    'type' => $material->type,
                    'file_type' => strtoupper($material->file_format),
                    'file_format' => $material->file_format,
                    'file_size' => $material->file_size,
                    'file_name' => $material->file_name,
                    'download_count' => $material->downloads ?? 0,
                    'downloads' => $material->downloads ?? 0,
                    'uploaded_by' => $material->uploader->first_name . ' ' . $material->uploader->last_name,
                    'uploaded_at' => $material->created_at->toDateString(),
                    'created_at' => $material->created_at->toIso8601String(),
                ];
            });
        
        return response()->json([
            'success' => true,
            'materials' => $materials
        ]);
    });
    
    // Upload course material
    Route::post('/trainer/course-materials/upload', function (Request $request) {
        $user = $request->user();
        
        if ($user->role !== 'trainer' && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $request->validate([
            'program_id' => 'required|exists:programs,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|in:document,video,presentation,image,assessment',
            'file' => 'required|file|max:512000', // 500MB max
        ]);
        
        // If trainer, verify trainer has access to this program
        if ($user->role === 'trainer') {
            $hasAccess = DB::table('batches')
                ->where('trainer_id', $user->id)
                ->where('program_id', $request->program_id)
                ->exists();
            
            if (!$hasAccess) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have access to this program'
                ], 403);
            }
        }
        // Admin has access to all programs
        
        // Handle file upload
        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $fileSize = $file->getSize();
        
        // Create unique filename
        $fileName = time() . '_' . uniqid() . '.' . $extension;
        
        // Store file in storage/app/public/course_materials
        $path = $file->storeAs('course_materials', $fileName, 'public');
        
        // Create database record
        $material = \App\Models\CourseMaterial::create([
            'program_id' => $request->program_id,
            'uploaded_by' => $user->id,
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'file_path' => $path,
            'file_name' => $originalName,
            'file_format' => $extension,
            'file_size' => $fileSize,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Material uploaded successfully',
            'material' => [
                'id' => $material->id,
                'title' => $material->title,
                'file_name' => $material->file_name,
            ]
        ], 201);
    });
    
    // Download course material
    Route::get('/trainer/course-materials/{id}/download', function (Request $request, $id) {
        $user = $request->user();
        
        if ($user->role !== 'trainer' && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $material = \App\Models\CourseMaterial::find($id);
        
        if (!$material) {
            return response()->json([
                'success' => false,
                'message' => 'Material not found'
            ], 404);
        }
        
        // If trainer, verify trainer has access to this program
        if ($user->role === 'trainer') {
            $hasAccess = DB::table('batches')
                ->where('trainer_id', $user->id)
                ->where('program_id', $material->program_id)
                ->exists();
            
            if (!$hasAccess) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have access to this material'
                ], 403);
            }
        }
        // Admin has access to all materials
        
        // Increment download count
        $material->increment('downloads');
        
        // Return file download
        $filePath = storage_path('app/public/' . $material->file_path);
        
        if (!file_exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }
        
        return response()->download($filePath, $material->file_name);
    });
    
    // Delete course material
    Route::delete('/trainer/course-materials/{id}', function (Request $request, $id) {
        $user = $request->user();
        
        if ($user->role !== 'trainer' && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $material = \App\Models\CourseMaterial::find($id);
        
        if (!$material) {
            return response()->json([
                'success' => false,
                'message' => 'Material not found'
            ], 404);
        }
        
        // If trainer, verify trainer uploaded this material. Admin can delete any material.
        if ($user->role === 'trainer' && $material->uploaded_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only delete materials you uploaded'
            ], 403);
        }
        
        // Delete file from storage
        $filePath = storage_path('app/public/' . $material->file_path);
        if (file_exists($filePath)) {
            unlink($filePath);
        }
        
        // Delete database record
        $material->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Material deleted successfully'
        ]);
    });
    
    // Update course material
    Route::put('/trainer/course-materials/{id}', function (Request $request, $id) {
        $user = $request->user();
        
        if ($user->role !== 'trainer' && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $material = \App\Models\CourseMaterial::find($id);
        
        if (!$material) {
            return response()->json([
                'success' => false,
                'message' => 'Material not found'
            ], 404);
        }
        
        // If trainer, verify trainer uploaded this material. Admin can edit any material.
        if ($user->role === 'trainer' && $material->uploaded_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only edit materials you uploaded'
            ], 403);
        }
        
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'sometimes|in:document,video,presentation,image,assessment',
        ]);
        
        if ($request->has('title')) {
            $material->title = $request->title;
        }
        if ($request->has('description')) {
            $material->description = $request->description;
        }
        if ($request->has('type')) {
            $material->type = $request->type;
        }
        
        $material->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Material updated successfully',
            'material' => $material
        ]);
    });
    
    // Student Routes
    // Get course materials for student's program
    Route::get('/student/course-materials', function (Request $request) {
        $student = $request->user();
        
        if ($student->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        // Get student's batch
        $batch = DB::table('batches')
            ->where('batch_id', $student->batch_id)
            ->first();
        
        if (!$batch) {
            return response()->json([
                'success' => true,
                'materials' => []
            ]);
        }
        
        // Get materials for the student's program
        $materials = \App\Models\CourseMaterial::where('program_id', $batch->program_id)
            ->with(['program', 'uploader'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($material) {
                return [
                    'id' => $material->id,
                    'title' => $material->title,
                    'description' => $material->description,
                    'program_id' => $material->program_id,
                    'program_title' => $material->program->title,
                    'type' => $material->type,
                    'format' => $material->file_format,
                    'size' => $material->file_size,
                    'file_name' => $material->file_name,
                    'downloads' => $material->downloads,
                    'uploaded_by' => $material->uploader->first_name . ' ' . $material->uploader->last_name,
                    'uploaded_at' => $material->created_at->toDateString(),
                ];
            });
        
        return response()->json([
            'success' => true,
            'materials' => $materials
        ]);
    });
    
    // Download course material (student)
    Route::get('/student/course-materials/{id}/download', function (Request $request, $id) {
        $student = $request->user();
        
        if ($student->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $material = \App\Models\CourseMaterial::find($id);
        
        if (!$material) {
            return response()->json([
                'success' => false,
                'message' => 'Material not found'
            ], 404);
        }
        
        // Get student's batch
        $batch = DB::table('batches')
            ->where('batch_id', $student->batch_id)
            ->first();
        
        // Verify material belongs to student's program
        if (!$batch || $material->program_id !== $batch->program_id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to this material'
            ], 403);
        }
        
        // Increment download count
        $material->increment('downloads');
        
        // Return file download
        $filePath = storage_path('app/public/' . $material->file_path);
        
        if (!file_exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }
        
        return response()->download($filePath, $material->file_name);
    });
    
    // Get announcements for student
    Route::get('/student/announcements', function (Request $request) {
        $student = $request->user();
        
        if ($student->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        // Get student's batch
        $batch = DB::table('batches')
            ->where('batch_id', $student->batch_id)
            ->first();
        
        if (!$batch) {
            return response()->json([
                'success' => true,
                'announcements' => []
            ]);
        }
        
        // Get trainer for this batch
        $trainerId = $batch->trainer_id;
        
        // Get announcements that are either:
        // 1. For all students (target_type = 'all') from this trainer
        // 2. Specifically for this student's batch (target_type = 'specific')
        // Exclude archived announcements
        $allAnnouncements = DB::table('trainer_announcements')
            ->where('trainer_id', $trainerId)
            ->where('target_type', 'all')
            ->where('is_archived', false)
            ->select('id', 'title', 'content', 'priority', 'target_type', 'created_at', 'updated_at', 'trainer_id')
            ->get();
        
        $specificAnnouncements = DB::table('trainer_announcements')
            ->join('announcement_batches', 'trainer_announcements.id', '=', 'announcement_batches.announcement_id')
            ->where('trainer_announcements.trainer_id', $trainerId)
            ->where('announcement_batches.batch_id', $student->batch_id)
            ->where('trainer_announcements.target_type', 'specific')
            ->where('trainer_announcements.is_archived', false)
            ->select('trainer_announcements.id', 'trainer_announcements.title', 'trainer_announcements.content', 
                     'trainer_announcements.priority', 'trainer_announcements.target_type', 
                     'trainer_announcements.created_at', 'trainer_announcements.updated_at', 'trainer_announcements.trainer_id')
            ->get();
        
        // Merge and sort by created_at
        $announcements = $allAnnouncements->merge($specificAnnouncements)
            ->sortByDesc('created_at')
            ->values()
            ->map(function ($announcement) {
                // Get trainer name
                $trainer = DB::table('users')->where('id', $announcement->trainer_id)->first();
                $trainerName = $trainer ? $trainer->first_name . ' ' . $trainer->last_name : 'Unknown';
                
                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'content' => $announcement->content,
                    'priority' => $announcement->priority,
                    'target_type' => $announcement->target_type,
                    'trainer_name' => $trainerName,
                    'created_at' => $announcement->created_at,
                    'updated_at' => $announcement->updated_at,
                ];
            });
        
        return response()->json([
            'success' => true,
            'announcements' => $announcements
        ]);
    });
    
    // Get pending assessments for student (quizzes they haven't answered yet)
    Route::get('/student/pending-assessments', function (Request $request) {
        $student = $request->user();
        
        if ($student->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        // Get all quizzes for the student's batch (match by batch_id)
        $allQuizzes = DB::table('quizzes')
            ->where('batch_id', $student->batch_id)
            ->where('status', 'active')
            ->select('id', 'title', 'description', 'time_limit', 'program_id', 'batch_id', 'created_at')
            ->get();
        
        // Get quizzes that the student has already answered
        $answeredQuizIds = DB::table('quiz_attempts')
            ->where('user_id', $student->id)
            ->pluck('quiz_id')
            ->toArray();
        
        // Filter out answered quizzes
        $pendingQuizzes = $allQuizzes->filter(function ($quiz) use ($answeredQuizIds) {
            return !in_array($quiz->id, $answeredQuizIds);
        });
        
        // Get program details and question counts
        $assessments = $pendingQuizzes->map(function ($quiz) {
            // Get program name from student's batch
            $batch = DB::table('batches')->where('batch_id', $quiz->batch_id)->first();
            $programName = 'N/A';
            
            if ($batch && $batch->program_id) {
                $program = DB::table('programs')->where('id', $batch->program_id)->first();
                $programName = $program ? $program->title : 'N/A';
            }
            
            $questionCount = DB::table('quiz_questions')->where('quiz_id', $quiz->id)->count();
            
            return [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'duration' => $quiz->time_limit,
                'total_questions' => $questionCount,
                'program_id' => $quiz->program_id,
                'program_name' => $programName,
                'created_at' => $quiz->created_at,
                'due_date' => null // You can add due date logic if needed
            ];
        })->values();
        
        return response()->json([
            'success' => true,
            'assessments' => $assessments
        ]);
    });
    
    // Get Recent Course Materials for Student
    Route::get('/student/recent-materials', function (Request $request) {
        $student = $request->user();
        
        if (!$student || $student->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        // Get student's batch
        $batch = DB::table('batches')->where('batch_id', $student->batch_id)->first();
        
        if (!$batch) {
            return response()->json([
                'success' => true,
                'materials' => []
            ]);
        }
        
        // Get recent materials for the student's program (last 3)
        $materials = DB::table('course_materials')
            ->where('program_id', $batch->program_id)
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();
        
        // Get program name
        $program = DB::table('programs')->where('id', $batch->program_id)->first();
        $programName = $program ? $program->title : 'N/A';
        
        // Format materials
        $formattedMaterials = $materials->map(function ($material) use ($programName) {
            // Format file size
            $fileSize = 'N/A';
            if ($material->file_size) {
                $bytes = floatval($material->file_size);
                if ($bytes >= 1048576) {
                    $fileSize = number_format($bytes / 1048576, 1) . ' MB';
                } else if ($bytes >= 1024) {
                    $fileSize = number_format($bytes / 1024, 1) . ' KB';
                } else {
                    $fileSize = $bytes . ' B';
                }
            }
            
            // Construct file URL
            $fileUrl = url('storage/' . $material->file_path);
            
            return [
                'id' => $material->id,
                'title' => $material->title,
                'description' => $material->description,
                'file_type' => $material->file_format,
                'file_url' => $fileUrl,
                'file_size' => $fileSize,
                'program_name' => $programName,
                'created_at' => $material->created_at
            ];
        });
        
        return response()->json([
            'success' => true,
            'materials' => $formattedMaterials
        ]);
    });
    
    // Update Student Profile
    Route::put('/student/profile', function (Request $request) {
        $student = $request->user();
        
        if (!$student || $student->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone_number' => 'sometimes|nullable|string|max:20',
            'address' => 'sometimes|nullable|string|max:500',
            'date_of_birth' => 'sometimes|nullable|date',
            'emergency_contact' => 'sometimes|nullable|string|max:255',
            'emergency_phone' => 'sometimes|nullable|string|max:20',
            'emergency_relationship' => 'sometimes|nullable|string|max:100',
        ]);

        // Update only the fields that were provided
        if ($request->has('first_name')) {
            $student->first_name = $request->first_name;
        }
        if ($request->has('last_name')) {
            $student->last_name = $request->last_name;
        }
        if ($request->has('phone_number')) {
            $student->phone_number = $request->phone_number;
        }
        if ($request->has('address')) {
            $student->address = $request->address;
        }
        if ($request->has('date_of_birth')) {
            $student->date_of_birth = $request->date_of_birth;
        }
        if ($request->has('emergency_contact')) {
            $student->emergency_contact = $request->emergency_contact;
        }
        if ($request->has('emergency_phone')) {
            $student->emergency_phone = $request->emergency_phone;
        }
        if ($request->has('emergency_relationship')) {
            $student->emergency_relationship = $request->emergency_relationship;
        }

        $student->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $student->id,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'email' => $student->email,
                'phone_number' => $student->phone_number,
                'address' => $student->address,
                'date_of_birth' => $student->date_of_birth,
                'emergency_contact' => $student->emergency_contact,
                'emergency_phone' => $student->emergency_phone,
                'emergency_relationship' => $student->emergency_relationship,
                'student_id' => $student->student_id,
                'role' => $student->role
            ]
        ]);
    });
    
    // Staff Routes
    // Get Staff Profile
    Route::get('/staff/profile', function (Request $request) {
        $user = $request->user();
        
        if (!in_array($user->role, ['staff', 'trainer'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'address' => $user->address,
                'role' => $user->role,
                'status' => $user->status,
                'bio' => $user->bio,
                'permissions' => $user->permissions,
            ]
        ]);
    });
    
    // Update Staff Profile
    Route::put('/staff/profile', function (Request $request) {
        $user = $request->user();
        
        if (!in_array($user->role, ['staff', 'trainer'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone_number' => 'sometimes|nullable|string|max:20',
            'address' => 'sometimes|nullable|string|max:500',
            'bio' => 'sometimes|nullable|string|max:1000',
        ]);

        // Update only the fields that were provided
        if ($request->has('first_name')) {
            $user->first_name = $request->first_name;
        }
        if ($request->has('last_name')) {
            $user->last_name = $request->last_name;
        }
        if ($request->has('phone_number')) {
            $user->phone_number = $request->phone_number;
        }
        if ($request->has('address')) {
            $user->address = $request->address;
        }
        if ($request->has('bio')) {
            $user->bio = $request->bio;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'address' => $user->address,
                'role' => $user->role,
                'status' => $user->status,
                'bio' => $user->bio,
                'permissions' => $user->permissions,
            ]
        ]);
    });

    // Update Staff Password
    Route::put('/staff/password', function (Request $request) {
        $user = $request->user();
        
        if (!in_array($user->role, ['staff', 'trainer'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 400);
        }

        // Update password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully'
        ]);
    });

    // Update Student Password
    Route::put('/student/password', function (Request $request) {
        $user = $request->user();
        
        if ($user->role !== 'student') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 400);
        }

        // Update password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully'
        ]);
    });

    // Update Admin Password
    Route::put('/admin/password', function (Request $request) {
        $user = $request->user();
        
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 400);
        }

        // Update password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully'
        ]);
    });

    // Verify Admin Password (for sensitive operations)
    Route::post('/admin/verify-password', function (Request $request) {
        $user = $request->user();
        
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'password' => 'required|string',
        ]);

        // Verify password
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Incorrect password'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Password verified successfully'
        ]);
    });

    // Update Admin Profile
    Route::put('/admin/profile', function (Request $request) {
        $user = $request->user();
        
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
        ]);

        // Update profile
        $user->first_name = $request->first_name;
        $user->last_name = $request->last_name;
        $user->phone_number = $request->phone_number;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'role' => $user->role,
            ]
        ]);
    });

    Route::get('/staff/recent-applications', function (Request $request) {
        // Get recent applicants (users with role 'applicant')
        $applications = \App\Models\User::where('role', 'applicant')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->select('id', 'first_name', 'last_name', 'email', 'course_program', 'application_status', 'status', 'created_at')
            ->get();
        
        // Format program names
        $applications = $applications->map(function($app) {
            if ($app->course_program) {
                // Check if course_program is a numeric ID
                if (is_numeric($app->course_program)) {
                    // Fetch the program title from the programs table
                    $program = \App\Models\Program::find($app->course_program);
                    $app->course_program_formatted = $program ? $program->title : 'Not specified';
                } else {
                    // Convert slug to readable name
                    $formatted = str_replace('-', ' ', $app->course_program);
                    // Apply title case
                    $formatted = ucwords($formatted);
                    // Fix NC levels - handle all variations
                    $formatted = preg_replace('/\bNc\b/', 'NC', $formatted);
                    $formatted = preg_replace('/\bIi\b/', 'II', $formatted);
                    $formatted = preg_replace('/\bIii\b/', 'III', $formatted);
                    $formatted = preg_replace('/\bIv\b/', 'IV', $formatted);
                    $app->course_program_formatted = $formatted;
                }
            } else {
                $app->course_program_formatted = 'Not specified';
            }
            return $app;
        });
        
        return response()->json([
            'applications' => $applications
        ]);
    });

    // Get all applications (for applications page)
    Route::get('/staff/applications', function (Request $request) {
        // Get all applicants (users with role 'applicant')
        $applications = \App\Models\User::where('role', 'applicant')
            ->orderBy('created_at', 'desc')
            ->select('id', 'first_name', 'last_name', 'email', 'phone_number', 'course_program', 'application_status', 'status', 'created_at', 'valid_id_path', 'transcript_path', 'diploma_path', 'passport_photo_path')
            ->get();
        
        // Format program names
        $applications = $applications->map(function($app) {
            $appData = $app->toArray();
            
            if ($app->course_program) {
                // Check if course_program is a numeric ID
                if (is_numeric($app->course_program)) {
                    // Fetch the program title from the programs table
                    $program = \App\Models\Program::find($app->course_program);
                    $appData['course_program_formatted'] = $program ? $program->title : 'Not specified';
                } else {
                    // Convert slug to readable name
                    $formatted = str_replace('-', ' ', $app->course_program);
                    // Apply title case
                    $formatted = ucwords($formatted);
                    // Fix NC levels - handle all variations
                    $formatted = preg_replace('/\bNc\b/', 'NC', $formatted);
                    $formatted = preg_replace('/\bIi\b/', 'II', $formatted);
                    $formatted = preg_replace('/\bIii\b/', 'III', $formatted);
                    $formatted = preg_replace('/\bIv\b/', 'IV', $formatted);
                    $appData['course_program_formatted'] = $formatted;
                }
            } else {
                $appData['course_program_formatted'] = 'Not specified';
            }
            
            return $appData;
        });
        
        return response()->json([
            'applications' => $applications
        ]);
    });

    // Get single applicant details
    Route::get('/staff/applicants/{id}', function (Request $request, $id) {
        $applicant = \App\Models\User::where('role', 'applicant')
            ->where('id', $id)
            ->first();
        
        if (!$applicant) {
            return response()->json(['error' => 'Applicant not found'], 404);
        }
        
        // Convert to array to add custom field
        $applicantData = $applicant->toArray();
        
        // Format program name
        if ($applicant->course_program) {
            if (is_numeric($applicant->course_program)) {
                $program = \App\Models\Program::find($applicant->course_program);
                $applicantData['course_program_formatted'] = $program ? $program->title : 'Not specified';
            } else {
                $formatted = str_replace('-', ' ', $applicant->course_program);
                $formatted = ucwords($formatted);
                $formatted = preg_replace('/\bNc\b/', 'NC', $formatted);
                $formatted = preg_replace('/\bIi\b/', 'II', $formatted);
                $formatted = preg_replace('/\bIii\b/', 'III', $formatted);
                $formatted = preg_replace('/\bIv\b/', 'IV', $formatted);
                $applicantData['course_program_formatted'] = $formatted;
            }
        } else {
            $applicantData['course_program_formatted'] = 'Not specified';
        }
        
        return response()->json([
            'applicant' => $applicantData
        ]);
    });

    // Update applicant status
    Route::put('/staff/applicants/{id}/status', function (Request $request, $id) {
        $request->validate([
            'application_status' => 'required|in:pending,under_review,approved,rejected',
            'reason' => 'required_if:application_status,under_review,rejected|string|max:1000'
        ]);

        $applicant = \App\Models\User::where('role', 'applicant')
            ->where('id', $id)
            ->first();
        
        // Also check if user is already a student (for rejected status)
        if (!$applicant) {
            $applicant = \App\Models\User::where('id', $id)->first();
            if (!$applicant) {
                return response()->json(['error' => 'Applicant not found'], 404);
            }
        }
        
        // Store old status to check if it changed
        $oldStatus = $applicant->application_status;
        $newStatus = $request->application_status;
        
        // Handle rejection - free up voucher slot if applicant was eligible
        if ($newStatus === 'rejected') {
            // Check if applicant had a voucher assigned (only for approved applicants who were converted to students)
            if ($applicant->role === 'student' && 
                !empty($applicant->voucher_eligibility) &&
                $applicant->voucher_eligibility === 'eligible' && 
                !empty($applicant->voucher_id)) {
                
                // Find the voucher and decrement used_count
                $voucher = \App\Models\Voucher::where('voucher_id', $applicant->voucher_id)->first();
                if ($voucher && $voucher->used_count > 0) {
                    $voucher->decrement('used_count');
                    
                    // Update voucher status back to 'issued' if it was marked as 'used'
                    if ($voucher->status === 'used' && $voucher->used_count < $voucher->quantity) {
                        $voucher->update(['status' => 'issued']);
                    }
                }
                
                // Clear voucher assignment
                $applicant->voucher_id = null;
            }
            
            // Update voucher eligibility to not_eligible for rejected applicants
            $applicant->voucher_eligibility = 'not_eligible';
            
            // If they were a student, revert back to applicant
            if ($applicant->role === 'student') {
                $applicant->role = 'applicant';
                $applicant->batch_id = null;
                $applicant->student_id = null;
            }
        }
        
        $applicant->application_status = $newStatus;
        
        // Store the reason if provided
        if ($request->has('reason') && in_array($newStatus, ['under_review', 'rejected'])) {
            $applicant->application_status_reason = $request->reason;
        }
        
        $applicant->save();
        
        // Send email notification if status changed to under_review or rejected
        if ($oldStatus !== $newStatus && in_array($newStatus, ['under_review', 'rejected'])) {
            \Log::info("Attempting to send email notification", [
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'email' => $applicant->email,
                'applicant_id' => $applicant->id,
                'reason' => $request->reason
            ]);
            
            try {
                $applicantName = ucfirst($applicant->first_name) . ' ' . ucfirst($applicant->last_name);
                $programName = '';
                $reason = $request->reason ?? '';
                
                // Get program name
                if ($applicant->course_program) {
                    $program = \App\Models\Program::find($applicant->course_program);
                    $programName = $program ? $program->title : 'your selected program';
                }
                
                if ($newStatus === 'under_review') {
                    $subject = 'Application Under Review - TrackEd';
                    $message = "
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                                .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                                .reason-box { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
                                .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px; }
                            </style>
                        </head>
                        <body>
                            <div class='container'>
                                <div class='header'>
                                    <h1>Application Update</h1>
                                </div>
                                <div class='content'>
                                    <p>Dear {$applicantName},</p>
                                    <p>Your application for <strong>{$programName}</strong> is now <strong>under review</strong>.</p>
                                    <div class='reason-box'>
                                        <strong>Reason for Review:</strong><br>
                                        {$reason}
                                    </div>
                                    <p>Our staff team is currently reviewing your application and submitted documents. We will notify you once a decision has been made.</p>
                                    <p>This process typically takes 3-5 business days. If we require any additional information, we will contact you via email.</p>
                                    <p>Thank you for your patience.</p>
                                    <p>Best regards,<br>TrackEd Team</p>
                                </div>
                                <div class='footer'>
                                    <p>This is an automated message. Please do not reply to this email.</p>
                                    <p>&copy; 2025 TrackEd. All rights reserved.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    ";
                } else { // rejected
                    $subject = 'Application Status Update - TrackEd';
                    $message = "
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                                .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                                .reason-box { background-color: #fee2e2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; }
                                .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px; }
                            </style>
                        </head>
                        <body>
                            <div class='container'>
                                <div class='header'>
                                    <h1>Application Status Update</h1>
                                </div>
                                <div class='content'>
                                    <p>Dear {$applicantName},</p>
                                    <p>Thank you for your interest in <strong>{$programName}</strong> at TrackEd.</p>
                                    <p>After careful review of your application, we regret to inform you that we are unable to accept your application at this time.</p>
                                    <div class='reason-box'>
                                        <strong>Reason:</strong><br>
                                        {$reason}
                                    </div>
                                    <p>We encourage you to reapply in the future or consider other programs that may be a better fit for your qualifications and goals.</p>
                                    <p>If you have any questions or would like further clarification, please feel free to contact our admissions office.</p>
                                    <p>Thank you for considering TrackEd for your training needs.</p>
                                    <p>Best regards,<br>TrackEd Admissions Team</p>
                                </div>
                                <div class='footer'>
                                    <p>This is an automated message. Please do not reply to this email.</p>
                                    <p>&copy; 2025 TrackEd. All rights reserved.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    ";
                }
                
                // Send email using Laravel's Mail facade
                \Mail::send([], [], function ($mail) use ($applicant, $subject, $message) {
                    $mail->to($applicant->email)
                         ->subject($subject)
                         ->html($message);
                });
                
                \Log::info("Application status email sent to {$applicant->email} for status: {$newStatus}");
            } catch (\Exception $e) {
                \Log::error("Failed to send application status email: " . $e->getMessage());
                \Log::error("Email error trace: " . $e->getTraceAsString());
                // Don't fail the status update if email fails
            }
        }
        
        return response()->json([
            'message' => 'Application status updated successfully',
            'applicant' => $applicant
        ]);
    });
    
    // Approve applicant and convert to student
    Route::post('/staff/applicants/{id}/approve', function (Request $request, $id) {
        $request->validate([
            'program_id' => 'required|exists:programs,id',
            'batch_id' => 'required|exists:batches,batch_id',
            'voucher_eligible' => 'boolean',
            'notes' => 'nullable|string'
        ]);

        $applicant = \App\Models\User::where('role', 'applicant')
            ->where('id', $id)
            ->first();
        
        if (!$applicant) {
            return response()->json(['error' => 'Applicant not found'], 404);
        }
        
        if ($applicant->application_status === 'approved') {
            return response()->json(['error' => 'Applicant has already been approved'], 400);
        }
        
        // Get batch and program details
        $batch = \App\Models\Batch::where('batch_id', $request->batch_id)->first();
        if (!$batch) {
            return response()->json(['error' => 'Batch not found'], 404);
        }
        
        $program = \App\Models\Program::find($request->program_id);
        if (!$program) {
            return response()->json(['error' => 'Program not found'], 404);
        }
        
        // Update applicant (keep as applicant role, mark as approved)
        $applicant->update([
            'application_status' => 'approved',
            'course_program' => $request->program_id,
            'batch_id' => $request->batch_id,
            'voucher_eligible' => $request->voucher_eligible ?? false,
            'approval_notes' => $request->notes,
            'approved_at' => now(),
        ]);
        
        // Send approval email with voucher eligibility details
        try {
            $applicantName = ucwords(strtolower($applicant->first_name)) . ' ' . ucwords(strtolower($applicant->last_name));
            $programName = $program->name;
            $voucherEligible = $request->voucher_eligible ?? false;
            
            // Get program fee (format with thousands separator)
            $programFee = $program->pricing ?? 0;
            $programFee = number_format($programFee, 2);
            
            // Create HTML email content based on voucher eligibility
            if ($voucherEligible) {
                // Email for voucher-eligible applicants
                $emailContent = "
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
                            .content { padding: 20px; }
                            .highlight { background-color: #d1fae5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
                            .documents { background-color: #f3f4f6; padding: 15px; margin: 20px 0; }
                            .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
                            ul { padding-left: 20px; }
                            .important { color: #dc2626; font-weight: bold; }
                        </style>
                    </head>
                    <body>
                        <div class='header'>
                            <h1>Congratulations! Application Approved</h1>
                        </div>
                        <div class='content'>
                            <p>Dear {$applicantName},</p>
                            
                            <p>We are pleased to inform you that your application for the <strong>{$programName}</strong> program at SMI Institute Inc. has been <strong>APPROVED</strong>!</p>
                            
                            <div class='highlight'>
                                <h3>GREAT NEWS: You are ELIGIBLE for Training Voucher (TESDA Subsidy)</h3>
                                <p>Your training fees will be covered by TESDA scholarship program. No payment is required from you!</p>
                            </div>
                            
                            <h3>NEXT STEPS - ONSITE DOCUMENT VERIFICATION REQUIRED</h3>
                            <p>To complete your enrollment, please visit our office within <strong>3 WORKING DAYS</strong> for document verification.</p>
                            
                            <div class='documents'>
                                <h4>Required Documents (Original and Photocopies):</h4>
                                <ul>
                                    <li>Valid Government-Issued ID</li>
                                    <li>Transcript of Records</li>
                                    <li>Diploma</li>
                                    <li>Passport size picture with white background</li>
                                </ul>
                            </div>
                            
                            <h3>OFFICE INFORMATION</h3>
                            <p><strong>Address:</strong><br>
                            SMI Institute Inc.<br>
                            1991 Wardley Bldg., San Juan St., Cor. Taft Ave.<br>
                            Brgy. 36, Pasay City, Metro Manila</p>
                            
                            <p><strong>Contact Number:</strong> 09177990724</p>
                            
                            <p><strong>Office Hours:</strong><br>
                            Monday to Friday: 8:00 AM - 5:00 PM<br>
                            Saturday & Sunday: CLOSED</p>
                            
                            <p class='important'>IMPORTANT: Saturdays and Sundays are NOT counted as working days.</p>
                            
                            <h3>WHAT TO EXPECT DURING YOUR VISIT:</h3>
                            <ul>
                                <li>Document verification (15-20 minutes)</li>
                                <li>Interview with enrollment officer (10-15 minutes)</li>
                                <li>TESDA voucher processing</li>
                                <li>Schedule assignment and batch confirmation</li>
                                <li>Orientation on LMS (Learning Management System) access</li>
                            </ul>
                            
                            <p>Once your enrollment is confirmed, you will receive:</p>
                            <ul>
                                <li>Student ID number</li>
                                <li>LMS login credentials</li>
                                <li>Class schedule</li>
                                <li>Training program guidelines</li>
                            </ul>
                            
                            <p>Should you have any questions, please contact us at <strong>09177990724</strong>.</p>
                            
                            <p>We look forward to welcoming you to the SMI Institute Inc. family!</p>
                            
                            <p>Warm regards,<br>
                            <strong>Enrollment Team</strong><br>
                            SMI Institute Inc.<br>
                            TESDA-Accredited Training Center</p>
                        </div>
                        <div class='footer'>
                            <p>This is an automated message. For inquiries, contact: 09177990724</p>
                        </div>
                    </body>
                    </html>
                ";
            } else {
                // Email for non-voucher eligible applicants
                $emailContent = "
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; }
                            .content { padding: 20px; }
                            .highlight { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
                            .documents { background-color: #f3f4f6; padding: 15px; margin: 20px 0; }
                            .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
                            ul { padding-left: 20px; }
                            .important { color: #dc2626; font-weight: bold; }
                        </style>
                    </head>
                    <body>
                        <div class='header'>
                            <h1>Congratulations! Application Approved</h1>
                        </div>
                        <div class='content'>
                            <p>Dear {$applicantName},</p>
                            
                            <p>We are pleased to inform you that your application for the <strong>{$programName}</strong> program at SMI Institute Inc. has been <strong>APPROVED</strong>!</p>
                            
                            <div class='highlight'>
                                <h3>PAYMENT INFORMATION</h3>
                                <p>Based on our assessment, you will be enrolling as a <strong>self-funded student</strong>.</p>
                                <div style='background: white; padding: 15px; border-radius: 5px; margin: 15px 0;'>
                                    <p style='margin: 0; font-size: 14px; color: #666;'>Program Training Fee:</p>
                                    <p style='margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #f59e0b;'>₱{$programFee}</p>
                                </div>
                                <p><strong>Accepted Payment Methods:</strong></p>
                                <ul style='margin: 10px 0; padding-left: 20px;'>
                                    <li>Cash</li>
                                    <li>Major Debit/Credit Cards</li>
                                    <li>GCash</li>
                                    <li>Maya</li>
                                </ul>
                            </div>
                            
                            <h3>NEXT STEPS - ONSITE DOCUMENT VERIFICATION & PAYMENT</h3>
                            <p>To complete your enrollment, please visit our office within <strong>3 WORKING DAYS</strong> for document verification and payment processing.</p>
                            
                            <div class='documents'>
                                <h4>Required Documents (Original and Photocopies):</h4>
                                <ul>
                                    <li>Valid Government-Issued ID</li>
                                    <li>Transcript of Records</li>
                                    <li>Diploma</li>
                                    <li>Passport size picture with white background</li>
                                </ul>
                                <p class='important'>Please bring sufficient amount for enrollment fees and other charges.</p>
                            </div>
                            
                            <h3>OFFICE INFORMATION</h3>
                            <p><strong>Address:</strong><br>
                            SMI Institute Inc.<br>
                            1991 Wardley Bldg., San Juan St., Cor. Taft Ave.<br>
                            Brgy. 36, Pasay City, Metro Manila</p>
                            
                            <p><strong>Contact Number:</strong> 09177990724</p>
                            
                            <p><strong>Office Hours:</strong><br>
                            Monday to Friday: 8:00 AM - 5:00 PM<br>
                            Saturday & Sunday: CLOSED</p>
                            
                            <p class='important'>IMPORTANT: Saturdays and Sundays are NOT counted as working days.</p>
                            
                            <h3>WHAT TO EXPECT DURING YOUR VISIT:</h3>
                            <ul>
                                <li>Document verification (15-20 minutes)</li>
                                <li>Interview with enrollment officer (10-15 minutes)</li>
                                <li>Fee confirmation and discussion of payment options</li>
                                <li>Payment processing (Cash, Card, GCash, or Maya)</li>
                                <li>Issuance of official receipt</li>
                                <li>Schedule assignment and batch confirmation</li>
                                <li>Orientation on LMS (Learning Management System) access</li>
                            </ul>
                            
                            <p>Once your enrollment is confirmed, you will receive:</p>
                            <ul>
                                <li>Official enrollment receipt</li>
                                <li>Student ID number</li>
                                <li>LMS login credentials</li>
                                <li>Class schedule</li>
                                <li>Training program guidelines</li>
                            </ul>
                            
                            <p>Should you have any questions about fees or payment options, please contact us at <strong>09177990724</strong>.</p>
                            
                            <p>We look forward to welcoming you to the SMI Institute Inc. family!</p>
                            
                            <p>Warm regards,<br>
                            <strong>Enrollment Team</strong><br>
                            SMI Institute Inc.<br>
                            TESDA-Accredited Training Center</p>
                        </div>
                        <div class='footer'>
                            <p>This is an automated message. For inquiries, contact: 09177990724</p>
                        </div>
                    </body>
                    </html>
                ";
            }
            
            \Illuminate\Support\Facades\Mail::send([], [], function ($message) use ($applicant, $emailContent, $voucherEligible) {
                $subject = $voucherEligible 
                    ? 'SMI Institute Inc. - Application Approved (Voucher Eligible)' 
                    : 'SMI Institute Inc. - Application Approved (Payment Required)';
                    
                $message->to($applicant->email)
                        ->subject($subject)
                        ->html($emailContent);
            });
            
            \Illuminate\Support\Facades\Log::info("Approval email sent to {$applicant->email} with voucher_eligible: " . ($voucherEligible ? 'true' : 'false'));
        } catch (\Exception $e) {
            // Log error but don't fail the approval
            \Illuminate\Support\Facades\Log::error('Failed to send approval email: ' . $e->getMessage());
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Applicant approved successfully',
            'voucher_eligible' => $request->voucher_eligible ?? false,
            'applicant' => $applicant->fresh()
        ]);
    });

    // Enroll Approved Applicant as Student (Voucher Eligible Only)
    Route::post('/staff/applicants/{id}/enroll-student', function (Request $request, $id) {
        $applicant = \App\Models\User::find($id);

        if (!$applicant) {
            return response()->json(['message' => 'Applicant not found'], 404);
        }

        // Validate that applicant is approved
        if ($applicant->application_status !== 'approved') {
            return response()->json(['message' => 'Only approved applicants can be enrolled'], 400);
        }

        // Validate that applicant is voucher eligible
        if (!$applicant->voucher_eligible) {
            return response()->json(['message' => 'Only voucher-eligible applicants can be enrolled through this process. Non-voucher applicants must complete payment first.'], 400);
        }

        // Check if already a student
        if ($applicant->role === 'student') {
            return response()->json([
                'message' => 'Applicant is already enrolled as a student',
                'student_id' => $applicant->student_id
            ], 400);
        }

        // Generate Student ID
        $year = date('Y');
        $lastStudent = \App\Models\User::where('role', 'student')
            ->where('student_id', 'like', "STU-{$year}-%")
            ->orderBy('student_id', 'desc')
            ->first();

        if ($lastStudent && $lastStudent->student_id) {
            // Extract the number from the last student ID
            $lastNumber = (int) substr($lastStudent->student_id, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        $studentId = sprintf("STU-%s-%04d", $year, $newNumber);

        // Update user to student role and assign student ID
        $applicant->role = 'student';
        $applicant->student_id = $studentId;
        $applicant->save();

        // Increment voucher used count for the batch
        if ($applicant->batch_id) {
            $voucher = \App\Models\Voucher::where('batch_id', $applicant->batch_id)->first();
            if ($voucher) {
                $voucher->used_count = $voucher->used_count + 1;
                $voucher->save();
                \Illuminate\Support\Facades\Log::info("Voucher used count incremented for batch {$applicant->batch_id}. New count: {$voucher->used_count}/{$voucher->quantity}");
            } else {
                \Illuminate\Support\Facades\Log::warning("No voucher found for batch {$applicant->batch_id} when enrolling student {$studentId}");
            }
        }

        // Send enrollment confirmation email
        try {
            $recipientEmail = $applicant->email;
            $recipientName = ucwords($applicant->first_name . ' ' . $applicant->last_name);
            $programName = $applicant->course_program_formatted ?? $applicant->course_program ?? 'N/A';
            $batchId = $applicant->batch_id ?? 'To be assigned';

            // Generate temporary LMS password (student can change later)
            $tempPassword = 'SMI' . date('Y') . substr(str_shuffle('0123456789'), 0, 4);
            
            // Update user password in database
            $applicant->password = \Illuminate\Support\Facades\Hash::make($tempPassword);
            $applicant->save();
            
            // Get batch details for schedule information
            $batch = null;
            $scheduleInfo = 'Your class schedule will be sent separately via email once finalized.';
            if ($applicant->batch_id) {
                $batch = \App\Models\Batch::where('batch_id', $applicant->batch_id)->first();
                if ($batch) {
                    $startDate = $batch->start_date ? date('F d, Y', strtotime($batch->start_date)) : 'TBA';
                    $endDate = $batch->end_date ? date('F d, Y', strtotime($batch->end_date)) : 'TBA';
                    $scheduleInfo = "
                        <strong>Training Period:</strong> {$startDate} to {$endDate}<br>
                        <strong>Schedule:</strong> Monday to Friday, 8:00 AM - 5:00 PM<br>
                        <strong>Batch:</strong> {$batchId}<br>
                        <em>*Specific daily schedules will be provided on the first day of training</em>
                    ";
                }
            }

            $emailContent = "
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 650px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #10b981; color: white; padding: 30px 20px; text-align: center; border-radius: 5px 5px 0 0; }
                        .content { background-color: #f9f9f9; padding: 30px 20px; }
                        .highlight { background-color: #d1fae5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
                        .student-id-box { font-size: 28px; font-weight: bold; color: #10b981; text-align: center; padding: 25px; background: white; border-radius: 5px; margin: 20px 0; border: 2px solid #10b981; }
                        .info-box { background: white; padding: 20px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #10b981; }
                        .credentials-box { background: #fff3cd; padding: 20px; border-radius: 5px; margin: 15px 0; border: 2px solid #ffc107; }
                        .important-box { background: #fee; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545; margin: 15px 0; }
                        .guidelines { background: white; padding: 20px; border-radius: 5px; margin: 15px 0; }
                        .guidelines ol { margin: 10px 0; padding-left: 25px; }
                        .guidelines li { margin: 8px 0; }
                        .footer { background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
                        h1 { margin: 0; font-size: 28px; }
                        h3 { color: #10b981; margin-top: 0; margin-bottom: 15px; }
                        .warning { color: #dc3545; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Welcome to SMI Training Center!</h1>
                            <p style='margin: 10px 0 0 0; font-size: 16px;'>Your Enrollment is Complete</p>
                        </div>
                        <div class='content'>
                            <p>Dear <strong>{$recipientName}</strong>,</p>
                            
                            <div class='highlight'>
                                <strong>Congratulations! You are now officially enrolled as a student at SMI Technical Training Center.</strong><br>
                                Your training voucher has been confirmed and your student account is active. Below are your important enrollment details.
                            </div>

                            <div class='student-id-box'>
                                STUDENT ID NUMBER<br>
                                {$studentId}
                            </div>

                            <div class='info-box'>
                                <h3>1. STUDENT IDENTIFICATION</h3>
                                <p><strong>Student ID:</strong> {$studentId}</p>
                                <p><strong>Full Name:</strong> {$recipientName}</p>
                                <p><strong>Program:</strong> {$programName}</p>
                                <p><strong>Batch:</strong> {$batchId}</p>
                                <p><strong>Status:</strong> Enrolled - Voucher Eligible</p>
                            </div>

                            <div class='credentials-box'>
                                <h3 style='color: #856404; margin-top: 0;'>2. LMS LOGIN CREDENTIALS</h3>
                                <p><strong>Learning Management System (LMS) Portal:</strong><br>
                                <a href='http://localhost:3000/student/login' style='color: #0066cc;'>http://localhost:3000/student/login</a></p>
                                
                                <p style='margin-top: 15px;'><strong>Your Login Details:</strong></p>
                                <p style='margin: 5px 0;'><strong>Email/Username:</strong> {$recipientEmail}</p>
                                <p style='margin: 5px 0;'><strong>Temporary Password:</strong> <span style='background: #fff; padding: 5px 10px; border: 1px solid #856404; border-radius: 3px; font-family: monospace; font-size: 16px;'>{$tempPassword}</span></p>
                                
                                <p class='warning' style='margin-top: 15px;'>⚠️ IMPORTANT: Please change your password immediately after your first login for security purposes.</p>
                            </div>

                            <div class='info-box'>
                                <h3>3. CLASS SCHEDULE</h3>
                                <p>{$scheduleInfo}</p>
                            </div>

                            <div class='guidelines'>
                                <h3>4. TRAINING PROGRAM GUIDELINES</h3>
                                <p><strong>Please read and follow these important guidelines:</strong></p>
                                
                                <h4 style='color: #333; margin-top: 15px;'>Attendance Requirements:</h4>
                                <ol>
                                    <li>Maintain at least <strong>90% attendance</strong> throughout the training program</li>
                                    <li>Be punctual - classes start promptly at the scheduled time</li>
                                    <li>Notify your instructor in advance if you cannot attend a session</li>
                                    <li>Absences exceeding the allowed limit may result in disqualification</li>
                                </ol>

                                <h4 style='color: #333; margin-top: 15px;'>Academic Requirements:</h4>
                                <ol>
                                    <li>Complete all assigned coursework and practical exercises</li>
                                    <li>Participate actively in class discussions and group activities</li>
                                    <li>Submit all projects and assessments on time</li>
                                    <li>Achieve passing grades in all competency assessments</li>
                                    <li>Maintain professional conduct at all times</li>
                                </ol>

                                <h4 style='color: #333; margin-top: 15px;'>Training Center Rules:</h4>
                                <ol>
                                    <li>Bring your Student ID to every session</li>
                                    <li>Wear appropriate attire (business casual or as specified for your program)</li>
                                    <li>Mobile phones must be on silent mode during classes</li>
                                    <li>Respect training center property and equipment</li>
                                    <li>Follow safety protocols, especially in laboratory sessions</li>
                                    <li>No smoking, eating, or drinking in training rooms</li>
                                </ol>

                                <h4 style='color: #333; margin-top: 15px;'>Certification Requirements:</h4>
                                <ol>
                                    <li>Complete all required training hours</li>
                                    <li>Pass all competency assessments with at least 75% score</li>
                                    <li>Submit all required documentation</li>
                                    <li>Settle any outstanding obligations (if applicable)</li>
                                    <li>Attend the graduation/completion ceremony</li>
                                </ol>
                            </div>

                            <div class='important-box'>
                                <h3 style='color: #dc3545; margin-top: 0;'>IMPORTANT REMINDERS</h3>
                                <ul style='margin: 10px 0; padding-left: 20px;'>
                                    <li>Keep your Student ID and LMS credentials confidential and secure</li>
                                    <li>Login to the LMS portal and change your password immediately</li>
                                    <li>Check your email and LMS portal regularly for updates and announcements</li>
                                    <li>Bring the following on your first day:
                                        <ul style='margin-top: 5px;'>
                                            <li>Valid Government-Issued ID</li>
                                            <li>Printed copy of this email</li>
                                            <li>Notebook and writing materials</li>
                                            <li>Any specific materials mentioned for your program</li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>

                            <div class='info-box'>
                                <h3>CONTACT & SUPPORT</h3>
                                <p><strong>Training Center Office:</strong><br>
                                Address: SMI Technical Training Center, 123 Main Street, City, Philippines</p>
                                <p><strong>Office Hours:</strong> Monday to Friday, 8:00 AM - 5:00 PM</p>
                                <p><strong>Contact Numbers:</strong> (02) 1234-5678</p>
                                <p><strong>Email:</strong> info@smitraining.edu.ph</p>
                                <p><strong>Technical Support:</strong> support@smitraining.edu.ph</p>
                            </div>

                            <p style='margin-top: 25px;'>We are excited to have you join our training program! If you have any questions or concerns, please don't hesitate to reach out to us.</p>
                            
                            <p style='margin-top: 20px;'>Best regards,<br>
                            <strong>SMI Technical Training Center</strong><br>
                            <em>Building Skills, Building Futures</em></p>
                        </div>
                        <div class='footer'>
                            <p>&copy; 2025 SMI Technical Training Center. All rights reserved.</p>
                            <p>This is an automated message. Please do not reply directly to this email.</p>
                            <p style='margin-top: 10px;'>For inquiries, please contact us at info@smitraining.edu.ph</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            Mail::html($emailContent, function ($message) use ($recipientEmail, $recipientName, $studentId) {
                $message->to($recipientEmail, $recipientName)
                    ->subject("Welcome to SMI Training Center - Student ID: {$studentId}");
            });

            \Illuminate\Support\Facades\Log::info("Enrollment confirmation email sent to {$applicant->email} with Student ID: {$studentId}");
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send enrollment email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Applicant successfully enrolled as student',
            'student_id' => $studentId,
            'student' => $applicant->fresh()
        ]);
    });

    // Process Cash Payment and Enroll Student (Cash Only)
    Route::post('/staff/applicants/{id}/process-cash-payment', function (Request $request, $id) {
        $request->validate([
            'payment_method' => 'required|in:cash',
            'amount_paid' => 'required|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        $applicant = \App\Models\User::find($id);

        if (!$applicant) {
            return response()->json(['success' => false, 'message' => 'Applicant not found'], 404);
        }

        // Validate that applicant is approved
        if ($applicant->application_status !== 'approved') {
            return response()->json(['success' => false, 'message' => 'Only approved applicants can be enrolled'], 400);
        }

        // Validate that applicant is NOT voucher eligible (payment required)
        if ($applicant->voucher_eligible) {
            return response()->json(['success' => false, 'message' => 'This applicant is voucher-eligible. Use the direct enrollment process instead.'], 400);
        }

        // Check if already a student
        if ($applicant->role === 'student') {
            return response()->json([
                'success' => false,
                'message' => 'Applicant is already enrolled as a student',
                'student_id' => $applicant->student_id
            ], 400);
        }

        // Generate Student ID
        $year = date('Y');
        $lastStudent = \App\Models\User::where('role', 'student')
            ->where('student_id', 'like', "STU-{$year}-%")
            ->orderBy('student_id', 'desc')
            ->first();

        if ($lastStudent && $lastStudent->student_id) {
            $lastNumber = (int) substr($lastStudent->student_id, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        $studentId = sprintf("STU-%s-%04d", $year, $newNumber);

        // Generate Receipt Number
        $receiptNumber = 'RCP-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 6));

        // Get program name from the program table
        $program = \App\Models\Program::find($applicant->course_program);
        $programName = $program ? ($program->title ?? $program->name ?? 'N/A') : 'N/A';

        // Update user to student role and assign student ID
        $applicant->role = 'student';
        $applicant->student_id = $studentId;
        $applicant->save();

        // Create cash payment record
        try {
            \App\Models\Payment::create([
                'user_id' => $applicant->id,
                'batch_id' => $applicant->batch_id,
                'amount' => $request->amount_paid,
                'currency' => 'PHP',
                'payment_method' => 'cash',
                'payment_status' => 'paid',
                'reference_code' => $receiptNumber,
                'payment_description' => "Cash enrollment fee for {$programName}" . ($applicant->batch_id ? " - {$applicant->batch_id}" : ''),
                'notes' => $request->notes ?? 'Cash payment received',
                'paid_at' => now()
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to create cash payment record: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to record payment: ' . $e->getMessage()
            ], 500);
        }

        // Send enrollment confirmation email with receipt
        try {
            $recipientEmail = $applicant->email;
            $recipientName = ucwords($applicant->first_name . ' ' . $applicant->last_name);
            $batchId = $applicant->batch_id ?? 'To be assigned';
            $amountPaid = number_format($request->amount_paid, 2);
            $paymentMethod = 'Cash';
            $paymentDate = date('F d, Y g:i A');

            // Generate temporary LMS password
            $tempPassword = 'SMI' . date('Y') . substr(str_shuffle('0123456789'), 0, 4);
            
            // Update user password in database
            $applicant->password = \Illuminate\Support\Facades\Hash::make($tempPassword);
            $applicant->save();

            $emailContent = "
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 650px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #10b981; color: white; padding: 30px 20px; text-align: center; border-radius: 5px 5px 0 0; }
                        .content { background-color: #f9f9f9; padding: 30px 20px; }
                        .receipt-box { background: white; border: 2px dashed #10b981; padding: 20px; margin: 20px 0; border-radius: 5px; }
                        .receipt-header { background: #10b981; color: white; padding: 10px; text-align: center; font-weight: bold; margin: -20px -20px 15px -20px; }
                        .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                        .receipt-row:last-child { border-bottom: none; font-weight: bold; font-size: 18px; color: #10b981; }
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
                            <h1>Cash Payment Received & Enrollment Complete!</h1>
                            <p style='margin: 10px 0 0 0; font-size: 16px;'>Welcome to SMI Training Center</p>
                        </div>
                        <div class='content'>
                            <p>Dear <strong>{$recipientName}</strong>,</p>
                            <p>We have successfully received your cash payment and processed your enrollment. Welcome to SMI Training Center!</p>
                            
                            <div class='receipt-box'>
                                <div class='receipt-header'>OFFICIAL RECEIPT</div>
                                <div class='receipt-row'>
                                    <span>Receipt Number:</span>
                                    <strong>{$receiptNumber}</strong>
                                </div>
                                <div class='receipt-row'>
                                    <span>Payment Date:</span>
                                    <strong>{$paymentDate}</strong>
                                </div>
                                <div class='receipt-row'>
                                    <span>Payment Method:</span>
                                    <strong>{$paymentMethod}</strong>
                                </div>
                                <div class='receipt-row'>
                                    <span>Program:</span>
                                    <strong>{$programName}</strong>
                                </div>
                                <div class='receipt-row'>
                                    <span>Batch:</span>
                                    <strong>{$batchId}</strong>
                                </div>
                                <div class='receipt-row'>
                                    <span>Amount Paid:</span>
                                    <strong>₱{$amountPaid}</strong>
                                </div>
                            </div>

                            <div class='info-box'>
                                <h3>📋 Your Student Information</h3>
                                <p><strong>Student ID:</strong> {$studentId}</p>
                                <p><strong>Program:</strong> {$programName}</p>
                                <p><strong>Batch:</strong> {$batchId}</p>
                                <p style='margin-bottom: 0;'><strong>Status:</strong> <span style='color: #10b981;'>Enrolled</span></p>
                            </div>

                            <div class='credentials-box'>
                                <h3 style='color: #856404; margin-top: 0;'>🔐 LMS Access Credentials</h3>
                                <p><strong>LMS Portal:</strong> <a href='#'>smitracked.cloud/smi-lms/login</a></p>
                                <p><strong>Username:</strong> {$applicant->email}</p>
                                <p><strong>Temporary Password:</strong> {$tempPassword}</p>
                                <p style='margin-bottom: 0; color: #856404; font-size: 13px;'>⚠️ Please change your password upon first login.</p>
                            </div>

                            <div class='info-box'>
                                <h3>📅 What's Next?</h3>
                                <ul style='margin: 0; padding-left: 20px;'>
                                    <li>Check your batch schedule in the LMS portal</li>
                                    <li>Prepare required materials for training</li>
                                    <li>Attend orientation on your batch start date</li>
                                    <li>Contact us if you have any questions</li>
                                </ul>
                            </div>

                            <p style='color: #666; font-size: 14px; margin-top: 25px;'>
                                If you have any questions or concerns, please don't hesitate to contact our admissions office.
                            </p>
                        </div>
                        <div class='footer'>
                            <p style='margin: 0 0 5px 0;'><strong>SMI Training Center</strong></p>
                            <p style='margin: 0; font-size: 11px;'>Address | Phone | Email | Website</p>
                            <p style='margin: 10px 0 0 0; font-size: 11px;'>This is an automated email. Please keep this for your records.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            \Illuminate\Support\Facades\Mail::html($emailContent, function ($message) use ($recipientEmail, $recipientName, $receiptNumber) {
                $message->to($recipientEmail)
                    ->subject("Payment Received - Receipt #{$receiptNumber} - SMI Training Center")
                    ->from(config('mail.from.address'), config('mail.from.name'));
            });
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send cash payment email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Cash payment processed and student enrolled successfully',
            'student_id' => $studentId,
            'receipt_number' => $receiptNumber,
            'student' => $applicant->fresh()
        ]);
    });

    // Process Payment and Enroll Student (Non-Voucher Eligible)
    Route::post('/staff/applicants/{id}/process-payment', function (Request $request, $id) {
        $request->validate([
            'payment_method' => 'required|in:cash,credit_card,debit_card,gcash,maya',
            'amount_paid' => 'required|numeric|min:0',
            'reference_number' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        $applicant = \App\Models\User::find($id);

        if (!$applicant) {
            return response()->json(['message' => 'Applicant not found'], 404);
        }

        // Validate that applicant is approved
        if ($applicant->application_status !== 'approved') {
            return response()->json(['message' => 'Only approved applicants can be enrolled'], 400);
        }

        // Validate that applicant is NOT voucher eligible (payment required)
        if ($applicant->voucher_eligible) {
            return response()->json(['message' => 'This applicant is voucher-eligible. Use the direct enrollment process instead.'], 400);
        }

        // Check if already a student
        if ($applicant->role === 'student') {
            return response()->json([
                'message' => 'Applicant is already enrolled as a student',
                'student_id' => $applicant->student_id
            ], 400);
        }

        // Generate Student ID
        $year = date('Y');
        $lastStudent = \App\Models\User::where('role', 'student')
            ->where('student_id', 'like', "STU-{$year}-%")
            ->orderBy('student_id', 'desc')
            ->first();

        if ($lastStudent && $lastStudent->student_id) {
            $lastNumber = (int) substr($lastStudent->student_id, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        $studentId = sprintf("STU-%s-%04d", $year, $newNumber);

        // Generate Receipt Number
        $receiptNumber = 'RCP-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 6));

        // Get program name from the program table
        $program = \App\Models\Program::find($applicant->course_program);
        $programName = $program ? ($program->title ?? $program->name ?? 'N/A') : 'N/A';

        // Update user to student role and assign student ID
        $applicant->role = 'student';
        $applicant->student_id = $studentId;
        $applicant->save();

        // Update existing payment record or create new one
        try {
            // Try to find existing payment by paymongo_payment_id
            $payment = null;
            if ($request->paymongo_payment_id) {
                $payment = \App\Models\Payment::where('paymongo_payment_id', $request->paymongo_payment_id)
                    ->orWhere('paymongo_payment_intent_id', $request->reference_number)
                    ->first();
            }

            if ($payment) {
                // Update existing payment record
                $payment->update([
                    'payment_status' => 'paid',
                    'reference_code' => $receiptNumber,
                    'payment_description' => "Enrollment fee for {$programName} - " . ($applicant->batch_id ?? 'N/A'),
                    'notes' => $request->notes,
                    'paid_at' => now()
                ]);
            } else {
                // Create new payment record (fallback for cash/manual payments)
                \App\Models\Payment::create([
                    'user_id' => $applicant->id,
                    'batch_id' => $applicant->batch_id,
                    'amount' => $request->amount_paid,
                    'currency' => 'PHP',
                    'payment_method' => $request->payment_method,
                    'payment_status' => 'paid',
                    'paymongo_payment_id' => $request->paymongo_payment_id ?? null,
                    'paymongo_payment_intent_id' => $request->reference_number ?? null,
                    'reference_code' => $receiptNumber,
                    'payment_description' => "Enrollment fee for {$programName} - " . ($applicant->batch_id ?? 'N/A'),
                    'notes' => $request->notes,
                    'paid_at' => now()
                ]);
            }
        } catch (\Exception $e) {
            // Log error but continue with enrollment
            \Illuminate\Support\Facades\Log::error('Failed to update/create payment record: ' . $e->getMessage());
        }

        // Send enrollment confirmation email with receipt
        try {
            $recipientEmail = $applicant->email;
            $recipientName = ucwords($applicant->first_name . ' ' . $applicant->last_name);
            $programName = $applicant->course_program_formatted ?? $applicant->course_program ?? 'N/A';
            $batchId = $applicant->batch_id ?? 'To be assigned';
            $amountPaid = number_format($request->amount_paid, 2);
            $paymentMethod = ucwords(str_replace('_', ' ', $request->payment_method));
            $paymentDate = date('F d, Y g:i A');

            // Generate temporary LMS password
            $tempPassword = 'SMI' . date('Y') . substr(str_shuffle('0123456789'), 0, 4);
            
            // Update user password in database
            $applicant->password = \Illuminate\Support\Facades\Hash::make($tempPassword);
            $applicant->save();

            $emailContent = "
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 650px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #10b981; color: white; padding: 30px 20px; text-align: center; border-radius: 5px 5px 0 0; }
                        .content { background-color: #f9f9f9; padding: 30px 20px; }
                        .receipt-box { background: white; border: 2px dashed #10b981; padding: 20px; margin: 20px 0; border-radius: 5px; }
                        .receipt-header { background: #10b981; color: white; padding: 10px; text-align: center; font-weight: bold; margin: -20px -20px 15px -20px; }
                        .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                        .receipt-row:last-child { border-bottom: none; font-weight: bold; font-size: 18px; color: #10b981; }
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
                            <h1>Payment Received & Enrollment Complete!</h1>
                            <p style='margin: 10px 0 0 0; font-size: 16px;'>Welcome to SMI Training Center</p>
                        </div>
                        <div class='content'>
                            <p>Dear <strong>{$recipientName}</strong>,</p>
                            
                            <p>Thank you for your payment! Your enrollment has been completed successfully. Below is your official receipt and enrollment details.</p>

                            <!-- RECEIPT -->
                            <div class='receipt-box'>
                                <div class='receipt-header'>OFFICIAL RECEIPT</div>
                                <div class='receipt-row'>
                                    <span>Receipt Number:</span>
                                    <strong>{$receiptNumber}</strong>
                                </div>
                                <div class='receipt-row'>
                                    <span>Date:</span>
                                    <strong>{$paymentDate}</strong>
                                </div>
                                <div class='receipt-row'>
                                    <span>Student Name:</span>
                                    <strong>{$recipientName}</strong>
                                </div>
                                <div class='receipt-row'>
                                    <span>Student ID:</span>
                                    <strong>{$studentId}</strong>
                                </div>
                                <div class='receipt-row'>
                                    <span>Program:</span>
                                    <strong>{$programName}</strong>
                                </div>
                                <div class='receipt-row'>
                                    <span>Payment Method:</span>
                                    <strong>{$paymentMethod}</strong>
                                </div>
                                " . ($request->reference_number ? "<div class='receipt-row'><span>Reference Number:</span><strong>{$request->reference_number}</strong></div>" : "") . "
                                <div class='receipt-row'>
                                    <span>Amount Paid:</span>
                                    <strong>₱{$amountPaid}</strong>
                                </div>
                            </div>

                            <div class='info-box'>
                                <h3>STUDENT IDENTIFICATION</h3>
                                <p><strong>Student ID:</strong> {$studentId}</p>
                                <p><strong>Full Name:</strong> {$recipientName}</p>
                                <p><strong>Program:</strong> {$programName}</p>
                                <p><strong>Batch:</strong> {$batchId}</p>
                                <p><strong>Status:</strong> Enrolled - Payment Completed</p>
                            </div>

                            <div class='credentials-box'>
                                <h3 style='color: #856404; margin-top: 0;'>LMS LOGIN CREDENTIALS</h3>
                                <p><strong>Learning Management System (LMS) Portal:</strong><br>
                                <a href='http://localhost:3000/student/login' style='color: #0066cc;'>http://localhost:3000/student/login</a></p>
                                
                                <p style='margin-top: 15px;'><strong>Your Login Details:</strong></p>
                                <p style='margin: 5px 0;'><strong>Email/Username:</strong> {$recipientEmail}</p>
                                <p style='margin: 5px 0;'><strong>Temporary Password:</strong> <span style='background: #fff; padding: 5px 10px; border: 1px solid #856404; border-radius: 3px; font-family: monospace; font-size: 16px;'>{$tempPassword}</span></p>
                                
                                <p style='margin-top: 15px; color: #dc2626; font-weight: bold;'>⚠️ IMPORTANT: Please change your password immediately after your first login for security purposes.</p>
                            </div>

                            <div class='info-box'>
                                <h3>IMPORTANT REMINDERS</h3>
                                <ul style='margin: 10px 0; padding-left: 20px;'>
                                    <li>Keep this receipt for your records</li>
                                    <li>Your Student ID is required for all training sessions</li>
                                    <li>Login to the LMS portal and change your password immediately</li>
                                    <li>Check your email and LMS regularly for schedule updates</li>
                                    <li>Maintain at least 90% attendance throughout the program</li>
                                </ul>
                            </div>

                            <div class='info-box'>
                                <h3>CONTACT INFORMATION</h3>
                                <p><strong>Training Center Office:</strong><br>
                                SMI Institute Inc.<br>
                                1991 Wardley Bldg., San Juan St., Cor. Taft Ave.<br>
                                Brgy. 36, Pasay City, Metro Manila</p>
                                <p><strong>Contact:</strong> 09177990724</p>
                                <p><strong>Office Hours:</strong> Monday to Friday, 8:00 AM - 5:00 PM</p>
                            </div>

                            <p style='margin-top: 25px;'>We are excited to have you join our training program! If you have any questions, please don't hesitate to contact us.</p>
                            
                            <p style='margin-top: 20px;'>Best regards,<br>
                            <strong>SMI Technical Training Center</strong><br>
                            <em>Building Skills, Building Futures</em></p>
                        </div>
                        <div class='footer'>
                            <p>&copy; 2025 SMI Technical Training Center. All rights reserved.</p>
                            <p>This is an automated message. For inquiries, contact: 09177990724</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            Mail::html($emailContent, function ($message) use ($recipientEmail, $recipientName, $receiptNumber) {
                $message->to($recipientEmail, $recipientName)
                    ->subject("Payment Receipt & Enrollment Confirmation - {$receiptNumber}");
            });

            \Illuminate\Support\Facades\Log::info("Payment receipt and enrollment email sent to {$applicant->email} with Receipt: {$receiptNumber}");
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send payment receipt email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment processed and student enrolled successfully',
            'student_id' => $studentId,
            'receipt_number' => $receiptNumber,
            'student' => $applicant->fresh()
        ]);
    });

    // Staff Enrollment Records Endpoint
    Route::get('/staff/enrollments', function (Request $request) {
        try {
            // Get all students (users with role 'student')
            $students = \App\Models\User::where('role', 'student')
                ->with(['batch.program', 'voucher'])
                ->orderBy('created_at', 'desc')
                ->get();
            
            // Get all payments for mapping
            $payments = \App\Models\Payment::all()->keyBy('user_id');
            
            // Transform the data into enrollment records
            $enrollments = $students->map(function ($student) use ($payments) {
                $payment = $payments->get($student->id);
                $hasVoucher = $student->voucher_id && $student->voucher;
                
                // Determine payment status
                $paymentStatus = 'unpaid';
                if ($hasVoucher) {
                    $paymentStatus = 'voucher';
                } elseif ($payment) {
                    $paymentStatus = $payment->payment_status;
                }
                
                // Get batch and program info
                $batch = $student->batch;
                $program = $batch ? $batch->program : null;
                
                // Calculate actual attendance
                $attendancePercentage = 0;
                if ($batch && $batch->batch_id) {
                    // Get total number of unique dates with attendance records for this batch
                    $totalClasses = DB::table('attendances')
                        ->where('batch_id', $batch->batch_id)
                        ->selectRaw('COUNT(DISTINCT date) as total')
                        ->value('total') ?? 0;
                    
                    // Get number of days student was present or late
                    $attendedClasses = \App\Models\Attendance::where('user_id', $student->id)
                        ->where('batch_id', $batch->batch_id)
                        ->whereIn('status', ['present', 'late'])
                        ->count();
                    
                    // Calculate percentage
                    $attendancePercentage = $totalClasses > 0 
                        ? round(($attendedClasses / $totalClasses) * 100) 
                        : 0;
                }
                
                return [
                    'id' => $student->id,
                    'enrollment_id' => 'ENR-' . str_pad($student->id, 6, '0', STR_PAD_LEFT),
                    'student_id' => $student->student_id,
                    'student_name' => $student->first_name . ' ' . ($student->middle_name ? $student->middle_name . ' ' : '') . $student->last_name,
                    'first_name' => $student->first_name,
                    'middle_name' => $student->middle_name,
                    'last_name' => $student->last_name,
                    'email' => $student->email,
                    'phone' => $student->phone_number,
                    'date_of_birth' => $student->date_of_birth ? (is_string($student->date_of_birth) ? $student->date_of_birth : $student->date_of_birth->format('Y-m-d')) : null,
                    'gender' => $student->gender ? ucfirst($student->gender) : null,
                    'address' => $student->address,
                    'emergency_contact' => [
                        'name' => $student->emergency_contact,
                        'relationship' => $student->emergency_relationship,
                        'phone' => $student->emergency_phone
                    ],
                    'program' => $program ? $program->title : 'N/A',
                    'batch' => $batch ? $batch->batch_id : 'N/A',
                    'enrollment_date' => $student->created_at ? $student->created_at->format('Y-m-d') : null,
                    'start_date' => $batch && $batch->start_date ? (is_string($batch->start_date) ? $batch->start_date : $batch->start_date->format('Y-m-d')) : null,
                    'expected_end_date' => $batch && $batch->end_date ? (is_string($batch->end_date) ? $batch->end_date : $batch->end_date->format('Y-m-d')) : null,
                    'status' => $student->status === 'active' ? 'active' : ($batch && $batch->status === 'finished' ? 'completed' : 'pending'),
                    'payment_status' => $paymentStatus,
                    'attendance' => $attendancePercentage,
                    'documents' => [
                        'valid_id' => $student->valid_id_path,
                        'transcript' => $student->transcript_path,
                        'diploma' => $student->diploma_path,
                        'passport_photo' => $student->passport_photo_path,
                    ],
                ];
            });
            
            return response()->json([
                'success' => true,
                'enrollments' => $enrollments->values(),
                'total' => $enrollments->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch enrollment records',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    // Staff Enrollment Trends Analytics Endpoint
    Route::get('/staff/enrollment-trends', function (Request $request) {
        try {
            $yearFilter = $request->get('year', date('Y'));
            
            // Function to read and parse CSV files
            $readCSVData = function() {
                $csvPath = public_path('enrollment-data');
                $csvData = [];
                
                if (is_dir($csvPath)) {
                    $files = glob($csvPath . '/*.csv');
                    foreach ($files as $file) {
                        if (($handle = fopen($file, 'r')) !== false) {
                            $headers = fgetcsv($handle);
                            while (($row = fgetcsv($handle)) !== false) {
                                if (count($row) >= 3) {
                                    $csvData[] = [
                                        'date' => $row[0],
                                        'enrollment' => (int)$row[1],
                                        'program' => $row[2]
                                    ];
                                }
                            }
                            fclose($handle);
                        }
                    }
                }
                return $csvData;
            };
            
            // Get CSV data
            $csvEnrollments = $readCSVData();
            
            // Get all students (enrolled users) from database
            $students = \App\Models\User::where('role', 'student')
                ->with(['batch.program'])
                ->get();
            
            // Get all applications
            $applications = \App\Models\Application::all();
            
            // Calculate yearly enrollment data (2020 to current year)
            $yearlyData = [];
            for ($year = 2020; $year <= date('Y'); $year++) {
                // Count from CSV data
                $csvYearTotal = collect($csvEnrollments)->filter(function ($item) use ($year) {
                    return substr($item['date'], 0, 4) == $year;
                })->sum('enrollment');
                
                // Count from database
                $dbYearTotal = $students->filter(function ($student) use ($year) {
                    return $student->created_at && $student->created_at->year == $year;
                })->count();
                
                // Combine totals
                $yearTotal = $csvYearTotal + $dbYearTotal;
                
                // Calculate previous year total
                $csvPrevYearTotal = collect($csvEnrollments)->filter(function ($item) use ($year) {
                    return substr($item['date'], 0, 4) == ($year - 1);
                })->sum('enrollment');
                
                $dbPrevYearTotal = $students->filter(function ($student) use ($year) {
                    return $student->created_at && $student->created_at->year == ($year - 1);
                })->count();
                
                $previousYearTotal = $csvPrevYearTotal + $dbPrevYearTotal;
                
                $growth = $previousYearTotal > 0 
                    ? (($yearTotal - $previousYearTotal) / $previousYearTotal) * 100 
                    : 0;
                
                $yearlyData[$year] = [
                    'total' => $yearTotal,
                    'growth' => round($growth, 1)
                ];
            }
            
            // Calculate monthly data for selected year
            $monthlyData = [];
            for ($month = 1; $month <= 12; $month++) {
                // CSV enrollments for this month
                $csvMonthEnrollments = collect($csvEnrollments)->filter(function ($item) use ($yearFilter, $month) {
                    $itemDate = strtotime($item['date']);
                    return date('Y', $itemDate) == $yearFilter && date('n', $itemDate) == $month;
                })->sum('enrollment');
                
                // Database enrollments for this month
                $dbMonthEnrollments = $students->filter(function ($student) use ($yearFilter, $month) {
                    return $student->created_at 
                        && $student->created_at->year == $yearFilter 
                        && $student->created_at->month == $month;
                })->count();
                
                $monthApplications = $applications->filter(function ($app) use ($yearFilter, $month) {
                    return $app->created_at 
                        && $app->created_at->year == $yearFilter 
                        && $app->created_at->month == $month;
                })->count();
                
                $monthlyData[] = [
                    'month' => date('M', mktime(0, 0, 0, $month, 1)),
                    'enrollments' => $csvMonthEnrollments + $dbMonthEnrollments,
                    'applications' => $monthApplications
                ];
            }
            
            // Get program breakdown
            $programs = \App\Models\Program::all();
            $programBreakdown = $programs->map(function ($program) use ($students, $csvEnrollments) {
                // Database program students
                $programStudents = $students->filter(function ($student) use ($program) {
                    return $student->batch && $student->batch->program_id == $program->id;
                });
                
                // CSV program enrollments (match by program title)
                $csvProgramTotal = collect($csvEnrollments)->filter(function ($item) use ($program) {
                    return stripos($item['program'], $program->title) !== false;
                })->sum('enrollment');
                
                $dbEnrollmentCount = $programStudents->count();
                $enrollmentCount = $csvProgramTotal + $dbEnrollmentCount;
                
                // Calculate total (CSV + DB)
                $totalCsvEnrollments = collect($csvEnrollments)->sum('enrollment');
                $totalDbStudents = $students->count();
                $totalStudents = $totalCsvEnrollments + $totalDbStudents;
                
                $percentage = $totalStudents > 0 ? ($enrollmentCount / $totalStudents) * 100 : 0;
                
                // Calculate growth (comparing current year to previous year)
                // CSV current year
                $csvCurrentYear = collect($csvEnrollments)->filter(function ($item) use ($program) {
                    return stripos($item['program'], $program->title) !== false 
                        && substr($item['date'], 0, 4) == date('Y');
                })->sum('enrollment');
                
                // DB current year
                $dbCurrentYear = $programStudents->filter(function ($student) {
                    return $student->created_at && $student->created_at->year == date('Y');
                })->count();
                
                $currentYearStudents = $csvCurrentYear + $dbCurrentYear;
                
                // CSV previous year
                $csvPreviousYear = collect($csvEnrollments)->filter(function ($item) use ($program) {
                    return stripos($item['program'], $program->title) !== false 
                        && substr($item['date'], 0, 4) == (date('Y') - 1);
                })->sum('enrollment');
                
                // DB previous year
                $dbPreviousYear = $programStudents->filter(function ($student) {
                    return $student->created_at && $student->created_at->year == (date('Y') - 1);
                })->count();
                
                $previousYearStudents = $csvPreviousYear + $dbPreviousYear;
                
                $growthRate = $previousYearStudents > 0 
                    ? (($currentYearStudents - $previousYearStudents) / $previousYearStudents) * 100 
                    : 0;
                
                // Determine trend
                $trend = 'stable';
                if ($growthRate > 5) $trend = 'up';
                elseif ($growthRate < -5) $trend = 'down';
                
                // Get batch count
                $batches = \App\Models\Batch::where('program_id', $program->id)->count();
                $avgBatchSize = $batches > 0 ? round($enrollmentCount / $batches) : $enrollmentCount;
                
                return [
                    'program' => $program->title,
                    'enrollments' => $enrollmentCount,
                    'percentage' => round($percentage, 1),
                    'trend' => $trend,
                    'growthRate' => round($growthRate, 1),
                    'batches' => $batches,
                    'avgBatchSize' => $avgBatchSize
                ];
            })->sortByDesc('enrollments')->values();
            
            // Demographics
            $genderStats = [
                [
                    'category' => 'Male',
                    'count' => $students->where('gender', 'male')->count(),
                    'percentage' => $students->count() > 0 ? round(($students->where('gender', 'male')->count() / $students->count()) * 100, 1) : 0
                ],
                [
                    'category' => 'Female',
                    'count' => $students->where('gender', 'female')->count(),
                    'percentage' => $students->count() > 0 ? round(($students->where('gender', 'female')->count() / $students->count()) * 100, 1) : 0
                ]
            ];
            
            // Age groups
            $ageGroups = [
                ['group' => '18-24', 'count' => 0, 'percentage' => 0],
                ['group' => '25-34', 'count' => 0, 'percentage' => 0],
                ['group' => '35-44', 'count' => 0, 'percentage' => 0],
                ['group' => '45+', 'count' => 0, 'percentage' => 0]
            ];
            
            foreach ($students as $student) {
                if ($student->date_of_birth) {
                    $dob = is_string($student->date_of_birth) 
                        ? \Carbon\Carbon::parse($student->date_of_birth) 
                        : $student->date_of_birth;
                    $age = $dob->age;
                    
                    if ($age >= 18 && $age <= 24) $ageGroups[0]['count']++;
                    elseif ($age >= 25 && $age <= 34) $ageGroups[1]['count']++;
                    elseif ($age >= 35 && $age <= 44) $ageGroups[2]['count']++;
                    elseif ($age >= 45) $ageGroups[3]['count']++;
                }
            }
            
            foreach ($ageGroups as $key => $group) {
                $ageGroups[$key]['percentage'] = $students->count() > 0 
                    ? round(($group['count'] / $students->count()) * 100, 1) 
                    : 0;
            }
            
            // Conversion rate
            $totalApplications = $applications->count();
            $enrolledCount = $students->count();
            $approvedApplications = $applications->where('application_status', 'approved')->count();
            $rejectedApplications = $applications->where('application_status', 'rejected')->count();
            $withdrawnApplications = $applications->where('application_status', 'withdrawn')->count();
            
            $conversionRate = [
                'applications' => $totalApplications,
                'enrolled' => $enrolledCount,
                'rate' => $totalApplications > 0 ? round(($enrolledCount / $totalApplications) * 100, 1) : 0,
                'withdrawn' => $withdrawnApplications,
                'rejected' => $rejectedApplications
            ];
            
            return response()->json([
                'success' => true,
                'data' => [
                    'yearly' => $yearlyData,
                    'monthly' => $monthlyData,
                    'programBreakdown' => $programBreakdown,
                    'demographics' => [
                        'gender' => $genderStats,
                        'ageGroups' => $ageGroups
                    ],
                    'conversionRate' => $conversionRate
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch enrollment trends',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    // Staff Enrollment Report Endpoint
    Route::get('/staff/enrollment-report', function (Request $request) {
        try {
            $reportType = $request->get('report_type', 'summary');
            $dateFrom = $request->get('date_from');
            $dateTo = $request->get('date_to');
            $programFilter = $request->get('program', 'all');
            $statusFilter = $request->get('status', 'all');
            
            // Function to read CSV data
            $readCSVData = function() use ($dateFrom, $dateTo, $programFilter, $statusFilter) {
                $csvData = [];
                $csvDir = public_path('enrollment-data');
                
                if (!is_dir($csvDir)) {
                    return $csvData;
                }
                
                $csvFiles = glob($csvDir . '/*.csv');
                
                foreach ($csvFiles as $file) {
                    if (($handle = fopen($file, 'r')) !== false) {
                        $headers = fgetcsv($handle);
                        
                        while (($row = fgetcsv($handle)) !== false) {
                            if (count($row) >= 6) { // date, enrollment, program, completed, withdrawn, dropped_out
                                $date = $row[0];
                                $totalEnrollment = (int)$row[1];
                                $program = $row[2];
                                $completed = (int)$row[3];
                                $withdrawn = (int)$row[4];
                                $droppedOut = (int)$row[5];
                                
                                // Apply date filter
                                if ($dateFrom && $date < $dateFrom) continue;
                                if ($dateTo && $date > $dateTo) continue;
                                
                                // Apply program filter
                                if ($programFilter !== 'all') {
                                    $programModel = \App\Models\Program::find($programFilter);
                                    if ($programModel && stripos($program, $programModel->title) === false) {
                                        continue;
                                    }
                                }
                                
                                $csvData[] = [
                                    'date' => $date,
                                    'total_enrollment' => $totalEnrollment,
                                    'program' => $program,
                                    'completed' => $completed,
                                    'withdrawn' => $withdrawn,
                                    'dropped_out' => $droppedOut
                                ];
                            }
                        }
                        fclose($handle);
                    }
                }
                
                return $csvData;
            };
            
            // Read CSV data
            $csvEnrollments = $readCSVData();
            
            // Base query for students from database
            $query = \App\Models\User::where('role', 'student')
                ->with(['batch.program']);
            
            // Apply date filter
            if ($dateFrom) {
                $query->whereDate('created_at', '>=', $dateFrom);
            }
            if ($dateTo) {
                $query->whereDate('created_at', '<=', $dateTo);
            }
            
            $students = $query->get();
            
            // Apply program filter
            if ($programFilter !== 'all') {
                $students = $students->filter(function ($student) use ($programFilter) {
                    return $student->batch && $student->batch->program_id == $programFilter;
                });
            }
            
            // Apply status filter (only for database students, CSV data doesn't have status)
            if ($statusFilter !== 'all') {
                $students = $students->filter(function ($student) use ($statusFilter) {
                    return strtolower($student->batch_status ?? 'active') === $statusFilter;
                });
            }
            
            // Calculate statistics (database students only for status)
            $dbStatistics = [
                'total' => $students->count(),
                'active' => $students->filter(function ($student) {
                    return strtolower($student->batch_status ?? 'active') === 'active';
                })->count(),
                'completed' => $students->filter(function ($student) {
                    return strtolower($student->batch_status ?? '') === 'completed';
                })->count(),
                'withdrawn' => $students->filter(function ($student) {
                    return strtolower($student->batch_status ?? '') === 'withdrawn';
                })->count()
            ];
            
            // Calculate CSV statistics by status
            $csvCompleted = 0;
            $csvWithdrawn = 0;
            $csvDroppedOut = 0;
            $csvTotal = 0;
            
            foreach ($csvEnrollments as $csvEntry) {
                $csvTotal += $csvEntry['total_enrollment'];
                $csvCompleted += $csvEntry['completed'];
                $csvWithdrawn += $csvEntry['withdrawn'];
                $csvDroppedOut += $csvEntry['dropped_out'];
            }
            
            // Apply status filter to CSV data
            if ($statusFilter === 'completed') {
                $csvFilteredTotal = $csvCompleted;
            } elseif ($statusFilter === 'withdrawn') {
                $csvFilteredTotal = $csvWithdrawn;
            } elseif ($statusFilter === 'dropped_out') {
                $csvFilteredTotal = $csvDroppedOut;
            } elseif ($statusFilter === 'active') {
                $csvFilteredTotal = 0; // CSV data is historical, no active students
            } else {
                $csvFilteredTotal = $csvTotal; // All statuses
            }
            
            $statistics = [
                'total' => $dbStatistics['total'] + ($statusFilter === 'all' ? $csvTotal : $csvFilteredTotal),
                'active' => $dbStatistics['active'], // Only from database
                'completed' => $dbStatistics['completed'] + $csvCompleted,
                'withdrawn' => $dbStatistics['withdrawn'] + $csvWithdrawn,
                'dropped_out' => $csvDroppedOut // Only from CSV
            ];
            
            $reportData = ['statistics' => $statistics];
            
            // Generate report based on type
            if ($reportType === 'summary') {
                // Summary by program
                $programs = \App\Models\Program::all();
                $programData = $programs->map(function ($program) use ($students, $csvEnrollments) {
                    // Database students
                    $programStudents = $students->filter(function ($student) use ($program) {
                        return $student->batch && $student->batch->program_id == $program->id;
                    });
                    
                    // CSV enrollments for this program - aggregate by status
                    $csvCompleted = 0;
                    $csvWithdrawn = 0;
                    $csvDroppedOut = 0;
                    $csvTotal = 0;
                    
                    foreach ($csvEnrollments as $csvEntry) {
                        if (stripos($csvEntry['program'], $program->title) !== false) {
                            $csvTotal += $csvEntry['total_enrollment'];
                            $csvCompleted += $csvEntry['completed'];
                            $csvWithdrawn += $csvEntry['withdrawn'];
                            $csvDroppedOut += $csvEntry['dropped_out'];
                        }
                    }
                    
                    $dbActive = $programStudents->filter(function ($s) {
                        return strtolower($s->batch_status ?? 'active') === 'active';
                    })->count();
                    
                    $dbCompleted = $programStudents->filter(function ($s) {
                        return strtolower($s->batch_status ?? '') === 'completed';
                    })->count();
                    
                    $dbWithdrawn = $programStudents->filter(function ($s) {
                        return strtolower($s->batch_status ?? '') === 'withdrawn';
                    })->count();
                    
                    return [
                        'program' => $program->title,
                        'total' => $programStudents->count() + $csvTotal,
                        'active' => $dbActive, // Only from database
                        'completed' => $dbCompleted + $csvCompleted,
                        'withdrawn' => $dbWithdrawn + $csvWithdrawn,
                        'dropped_out' => $csvDroppedOut // Only from CSV
                    ];
                })->filter(function ($item) {
                    return $item['total'] > 0;
                })->values();
                
                $reportData['programs'] = $programData;
                
            } elseif ($reportType === 'detailed') {
                // Detailed enrollment list
                $enrollments = $students->map(function ($student) {
                    return [
                        'student_name' => trim($student->first_name . ' ' . $student->last_name),
                        'email' => $student->email,
                        'program' => $student->batch && $student->batch->program ? $student->batch->program->title : 'N/A',
                        'batch' => $student->batch ? $student->batch->batch_code : 'N/A',
                        'status' => $student->batch_status ?? 'active',
                        'enrollment_date' => $student->created_at->format('Y-m-d')
                    ];
                })->values();
                
                $reportData['enrollments'] = $enrollments;
                
            } elseif ($reportType === 'by_program') {
                // Enrollment by program and month
                $data = [];
                $programs = \App\Models\Program::all();
                
                foreach ($programs as $program) {
                    // Database students
                    $programStudents = $students->filter(function ($student) use ($program) {
                        return $student->batch && $student->batch->program_id == $program->id;
                    });
                    
                    // Group database students by month
                    $byMonth = $programStudents->groupBy(function ($student) {
                        return $student->created_at->format('Y-m');
                    });
                    
                    foreach ($byMonth as $month => $monthStudents) {
                        $data[] = [
                            'program' => $program->title,
                            'month' => date('M Y', strtotime($month . '-01')),
                            'enrollments' => $monthStudents->count()
                        ];
                    }
                    
                    // Add CSV data grouped by month - use total_enrollment
                    $csvByMonth = [];
                    foreach ($csvEnrollments as $csvEntry) {
                        if (stripos($csvEntry['program'], $program->title) !== false) {
                            $month = date('Y-m', strtotime($csvEntry['date']));
                            if (!isset($csvByMonth[$month])) {
                                $csvByMonth[$month] = 0;
                            }
                            $csvByMonth[$month] += $csvEntry['total_enrollment'];
                        }
                    }
                    
                    foreach ($csvByMonth as $month => $count) {
                        $monthFormatted = date('M Y', strtotime($month . '-01'));
                        
                        // Check if this month already exists in data (from database)
                        $existingIndex = array_search($monthFormatted, array_column($data, 'month'));
                        if ($existingIndex !== false && $data[$existingIndex]['program'] === $program->title) {
                            $data[$existingIndex]['enrollments'] += $count;
                        } else {
                            $data[] = [
                                'program' => $program->title,
                                'month' => $monthFormatted,
                                'enrollments' => $count
                            ];
                        }
                    }
                }
                
                $reportData['data'] = collect($data)->sortBy('month')->values();
                
            } elseif ($reportType === 'by_status') {
                // Enrollment by status - use statistics total for percentage calculation
                $total = $statistics['total'];
                $statusData = [
                    [
                        'status' => 'active',
                        'count' => $statistics['active'],
                        'percentage' => $total > 0 ? round(($statistics['active'] / $total) * 100, 1) : 0
                    ],
                    [
                        'status' => 'completed',
                        'count' => $statistics['completed'],
                        'percentage' => $total > 0 ? round(($statistics['completed'] / $total) * 100, 1) : 0
                    ],
                    [
                        'status' => 'withdrawn',
                        'count' => $statistics['withdrawn'],
                        'percentage' => $total > 0 ? round(($statistics['withdrawn'] / $total) * 100, 1) : 0
                    ],
                    [
                        'status' => 'dropped_out',
                        'count' => $statistics['dropped_out'],
                        'percentage' => $total > 0 ? round(($statistics['dropped_out'] / $total) * 100, 1) : 0
                    ]
                ];
                
                $reportData['data'] = $statusData;
            }
            
            return response()->json([
                'success' => true,
                'data' => $reportData
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate report',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    // Staff Programs Endpoint
    Route::get('/staff/programs', function (Request $request) {
        try {
            // Check authentication
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }
            
            $programs = \App\Models\Program::all();
            
            return response()->json([
                'success' => true,
                'data' => $programs
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Staff programs endpoint error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch programs',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    // Staff Student Reports Endpoint
    Route::post('/staff/reports/students', function (Request $request) {
        try {
            $reportType = $request->input('report_type', 'program_distribution');
            $dateFrom = $request->input('date_from');
            $dateTo = $request->input('date_to');
            $programId = $request->input('program_id');
            $statusFilter = $request->input('status');
            
            // Base query for students
            $studentsQuery = \App\Models\User::where('role', 'student')
                ->whereBetween('created_at', [$dateFrom, $dateTo]);
            
            if ($programId) {
                $studentsQuery->where('course_program', $programId);
            }
            
            if ($statusFilter && $statusFilter !== 'all') {
                $studentsQuery->where('batch_status', $statusFilter);
            }
            
            $students = $studentsQuery->get();
            
            // Calculate statistics - treat null or empty batch_status as 'active'
            $totalStudents = $students->count();
            
            // Count by status - null/empty is considered active
            $activeCount = $students->filter(function($s) {
                $status = strtolower($s->batch_status ?? 'active');
                return $status === 'active' || empty($s->batch_status);
            })->count();
            
            $completedCount = $students->filter(function($s) {
                return strtolower($s->batch_status ?? '') === 'completed';
            })->count();
            
            $withdrawnCount = $students->filter(function($s) {
                return strtolower($s->batch_status ?? '') === 'withdrawn';
            })->count();
            
            $droppedOutCount = $students->filter(function($s) {
                return strtolower($s->batch_status ?? '') === 'dropped_out';
            })->count();
            
            $statistics = [
                'total' => $totalStudents,
                'active' => $activeCount,
                'completed' => $completedCount,
                'withdrawn' => $withdrawnCount,
                'dropped_out' => $droppedOutCount
            ];
            
            $reportData = [];
            
            if ($reportType === 'program_distribution') {
                // Get all programs
                $programs = \App\Models\Program::all();
                
                foreach ($programs as $program) {
                    $programStudents = $students->where('course_program', $program->id);
                    
                    if ($programStudents->count() > 0) {
                        $reportData[] = [
                            'program' => $program->title,
                            'total' => $programStudents->count(),
                            'active' => $programStudents->filter(function($s) {
                                $status = strtolower($s->batch_status ?? 'active');
                                return $status === 'active' || empty($s->batch_status);
                            })->count(),
                            'completed' => $programStudents->filter(function($s) {
                                return strtolower($s->batch_status ?? '') === 'completed';
                            })->count(),
                            'withdrawn' => $programStudents->filter(function($s) {
                                return strtolower($s->batch_status ?? '') === 'withdrawn';
                            })->count(),
                            'dropped_out' => $programStudents->filter(function($s) {
                                return strtolower($s->batch_status ?? '') === 'dropped_out';
                            })->count()
                        ];
                    }
                }
                
            } elseif ($reportType === 'payment_status') {
                // Get payment records for students
                foreach ($students as $student) {
                    $program = \App\Models\Program::find($student->course_program);
                    
                    // Get payment records (assuming you have a payments table)
                    // For now, using mock data structure
                    $totalFee = 5000; // This should come from program or payment records
                    $amountPaid = 0; // This should be sum of payments
                    
                    // Try to get actual payment data if payments table exists
                    try {
                        $payments = \DB::table('payments')
                            ->where('user_id', $student->id)
                            ->sum('amount');
                        $amountPaid = $payments ?? 0;
                    } catch (\Exception $e) {
                        // Payments table doesn't exist, use default
                        $amountPaid = rand(0, $totalFee);
                    }
                    
                    $balance = $totalFee - $amountPaid;
                    
                    $status = 'Not Paid';
                    if ($amountPaid >= $totalFee) {
                        $status = 'Fully Paid';
                    } elseif ($amountPaid > 0) {
                        $status = 'Partially Paid';
                    }
                    
                    $reportData[] = [
                        'student_name' => $student->first_name . ' ' . $student->last_name,
                        'program' => $program ? $program->title : 'N/A',
                        'total_fee' => number_format($totalFee, 2),
                        'amount_paid' => number_format($amountPaid, 2),
                        'balance' => number_format($balance, 2),
                        'status' => $status
                    ];
                }
                
            } elseif ($reportType === 'status_report') {
                // Detailed status report with individual student records
                foreach ($students as $student) {
                    $program = \App\Models\Program::find($student->course_program);
                    
                    // Get batch name - handle if it's an object or string
                    $batchName = 'N/A';
                    if ($student->batch) {
                        if (is_object($student->batch)) {
                            $batchName = $student->batch->batch_id ?? 'N/A';
                        } else {
                            $batchName = $student->batch;
                        }
                    }
                    
                    $reportData[] = [
                        'student_name' => $student->first_name . ' ' . $student->last_name,
                        'email' => $student->email,
                        'program' => $program ? $program->title : 'N/A',
                        'batch' => $batchName,
                        'status' => $student->batch_status ?? 'active',
                        'enrollment_date' => $student->created_at ? $student->created_at->format('Y-m-d') : 'N/A'
                    ];
                }
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'statistics' => $statistics,
                    'data' => $reportData
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Staff student reports error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate student report',
                'error' => $e->getMessage()
            ], 500);
        }
    });

    // Staff Batches Endpoint
    Route::get('/staff/batches', function (Request $request) {
        try {
            // Check authentication
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }
            
            $batches = \App\Models\Batch::orderBy('batch_id', 'desc')->get();
            
            \Log::info('Batches fetched: ' . $batches->count() . ' batches found');
            
            return response()->json([
                'success' => true,
                'data' => $batches
            ]);
        } catch (\Exception $e) {
            \Log::error('Staff batches error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load batches',
                'error' => $e->getMessage()
            ], 500);
        }
    });

    // Staff Exams Endpoints
    // Get all exams
    Route::get('/staff/exams', function (Request $request) {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }
            
            $exams = DB::table('exams')
                ->leftJoin('programs', 'exams.program_id', '=', 'programs.id')
                ->leftJoin('batches', 'exams.batch_id', '=', 'batches.id')
                ->select(
                    'exams.*',
                    'programs.title as program_name',
                    'batches.batch_id as batch_name'
                )
                ->orderBy('exams.created_at', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $exams
            ]);
        } catch (\Exception $e) {
            \Log::error('Staff exams fetch error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load exams',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    // Create exam
    Route::post('/staff/exams', function (Request $request) {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }
            
            $validated = $request->validate([
                'exam_title' => 'required|string|max:255',
                'exam_code' => 'required|string|max:100|unique:exams,exam_code',
                'program_id' => 'required|exists:programs,id',
                'batch_id' => 'nullable|exists:batches,id',
                'exam_type' => 'required|in:written,practical,oral,online',
                'exam_date' => 'required|date',
                'exam_time' => 'required',
                'duration' => 'required|integer|min:1',
                'passing_score' => 'required|numeric|min:0',
                'total_score' => 'required|numeric|min:1',
                'venue' => 'required|string|max:255',
                'proctor' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:scheduled,ongoing,completed,cancelled'
            ]);
            
            $examId = DB::table('exams')->insertGetId(array_merge($validated, [
                'created_by' => $user->id,
                'created_at' => now(),
                'updated_at' => now()
            ]));
            
            return response()->json([
                'success' => true,
                'message' => 'Exam created successfully',
                'data' => ['id' => $examId]
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Staff exam create error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create exam',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    // Update exam
    Route::put('/staff/exams/{id}', function (Request $request, $id) {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }
            
            $exam = DB::table('exams')->where('id', $id)->first();
            if (!$exam) {
                return response()->json([
                    'success' => false,
                    'message' => 'Exam not found'
                ], 404);
            }
            
            $validated = $request->validate([
                'exam_title' => 'required|string|max:255',
                'exam_code' => 'required|string|max:100|unique:exams,exam_code,' . $id,
                'program_id' => 'required|exists:programs,id',
                'batch_id' => 'nullable|exists:batches,id',
                'exam_type' => 'required|in:written,practical,oral,online',
                'exam_date' => 'required|date',
                'exam_time' => 'required',
                'duration' => 'required|integer|min:1',
                'passing_score' => 'required|numeric|min:0',
                'total_score' => 'required|numeric|min:1',
                'venue' => 'required|string|max:255',
                'proctor' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:scheduled,ongoing,completed,cancelled'
            ]);
            
            DB::table('exams')->where('id', $id)->update(array_merge($validated, [
                'updated_at' => now()
            ]));
            
            return response()->json([
                'success' => true,
                'message' => 'Exam updated successfully'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Staff exam update error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update exam',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    // Delete exam
    Route::delete('/staff/exams/{id}', function (Request $request, $id) {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }
            
            $exam = DB::table('exams')->where('id', $id)->first();
            if (!$exam) {
                return response()->json([
                    'success' => false,
                    'message' => 'Exam not found'
                ], 404);
            }
            
            DB::table('exams')->where('id', $id)->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Exam deleted successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Staff exam delete error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete exam',
                'error' => $e->getMessage()
            ], 500);
        }
    });

    // Staff Assessment Reports Endpoint
    Route::post('/staff/reports/assessments', function (Request $request) {
        try {
            $reportType = $request->input('report_type', 'assessment_results');
            $dateFrom = $request->input('date_from');
            $dateTo = $request->input('date_to');
            $programId = $request->input('program_id');
            $batchId = $request->input('batch_id');
            
            \Log::info('Assessment report request', [
                'report_type' => $reportType,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'program_id' => $programId,
                'batch_id' => $batchId
            ]);
            
            // Base query for grades/assessments
            $gradesQuery = \App\Models\Grade::whereBetween('created_at', [$dateFrom, $dateTo]);
            
            // Apply program filter if provided and is numeric
            if ($programId && is_numeric($programId)) {
                $gradesQuery->where('program_id', $programId);
                \Log::info('Applied program filter: ' . $programId);
            }
            
            // Apply batch filter if provided
            // Note: batch_id can be either the numeric id or the string batch_id (e.g., "BATCH-2024-001")
            if ($batchId) {
                if (is_numeric($batchId)) {
                    // If numeric ID is provided, get the batch_id string
                    $batch = \App\Models\Batch::find($batchId);
                    if ($batch) {
                        $gradesQuery->where('batch_id', $batch->batch_id);
                        \Log::info('Applied batch filter: ' . $batch->batch_id . ' (from numeric ID: ' . $batchId . ')');
                    }
                } else {
                    // If batch_id string is provided directly
                    $gradesQuery->where('batch_id', $batchId);
                    \Log::info('Applied batch filter: ' . $batchId);
                }
            }
            
            $grades = $gradesQuery->with(['student', 'program', 'batch'])->get();
            
            \Log::info('Found ' . $grades->count() . ' grades matching criteria');
            
            // Calculate statistics
            $totalAssessments = $grades->count();
            $passedCount = $grades->where('status', 'passed')->count();
            $failedCount = $grades->where('status', 'failed')->count();
            $passRate = $totalAssessments > 0 ? round(($passedCount / $totalAssessments) * 100, 2) : 0;
            
            $statistics = [
                'total' => $totalAssessments,
                'passed' => $passedCount,
                'failed' => $failedCount,
                'pass_rate' => $passRate
            ];
            
            $reportData = [];
            
            if ($reportType === 'assessment_results') {
                // Individual assessment results
                foreach ($grades as $grade) {
                    $student = $grade->student;
                    $program = $grade->program;
                    $batch = $grade->batch;
                    
                    $reportData[] = [
                        'student_name' => $student ? ($student->first_name . ' ' . $student->last_name) : 'N/A',
                        'program' => $program ? $program->title : 'N/A',
                        'batch' => $batch ? $batch->batch_id : 'N/A',
                        'assessment_type' => ucfirst($grade->assessment_type),
                        'score' => $grade->score . '/' . $grade->total_points,
                        'result' => ucfirst($grade->status),
                        'date_taken' => $grade->created_at ? $grade->created_at->format('Y-m-d') : 'N/A'
                    ];
                }
                
            } else if ($reportType === 'pass_rate') {
                // Pass rate by program and batch
                $groupedData = $grades->groupBy(function($grade) {
                    return ($grade->program ? $grade->program->title : 'N/A') . '|' . ($grade->batch ? $grade->batch->batch_id : 'N/A');
                });
                
                foreach ($groupedData as $key => $group) {
                    [$program, $batch] = explode('|', $key);
                    $total = $group->count();
                    $passed = $group->where('status', 'passed')->count();
                    $failed = $group->where('status', 'failed')->count();
                    $passRate = $total > 0 ? round(($passed / $total) * 100, 2) : 0;
                    
                    $reportData[] = [
                        'program' => $program,
                        'batch' => $batch,
                        'total' => $total,
                        'passed' => $passed,
                        'failed' => $failed,
                        'pass_rate' => $passRate
                    ];
                }
                
            } else if ($reportType === 'competency_summary') {
                // Get program competencies
                $programs = \App\Models\Program::whereIn('id', $grades->pluck('program_id')->unique())->get();
                $competencyData = [];
                
                foreach ($programs as $program) {
                    if ($program->core_competencies) {
                        $competencies = is_string($program->core_competencies) ? json_decode($program->core_competencies, true) : $program->core_competencies;
                        
                        if (is_array($competencies)) {
                            foreach ($competencies as $competency) {
                                if (!isset($competencyData[$competency])) {
                                    $competencyData[$competency] = [
                                        'total' => 0,
                                        'competent' => 0,
                                        'not_competent' => 0
                                    ];
                                }
                                
                                // Count assessments for this program
                                $programGrades = $grades->where('program_id', $program->id);
                                $competencyData[$competency]['total'] += $programGrades->count();
                                $competencyData[$competency]['competent'] += $programGrades->where('status', 'passed')->count();
                                $competencyData[$competency]['not_competent'] += $programGrades->where('status', 'failed')->count();
                            }
                        }
                    }
                }
                
                foreach ($competencyData as $competency => $data) {
                    $percentage = $data['total'] > 0 ? round(($data['competent'] / $data['total']) * 100, 2) : 0;
                    $reportData[] = [
                        'competency' => $competency,
                        'total' => $data['total'],
                        'competent' => $data['competent'],
                        'not_competent' => $data['not_competent'],
                        'percentage' => $percentage
                    ];
                }
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'statistics' => $statistics,
                    'data' => $reportData
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Staff assessment reports error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate assessment report',
                'error' => $e->getMessage()
            ], 500);
        }
    });

    // Staff Equipment Categories Endpoint
    Route::get('/staff/equipment/categories', function (Request $request) {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }
            
            $categories = \App\Models\Equipment::distinct()->pluck('category')->filter()->values();
            
            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            \Log::error('Equipment categories error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load categories',
                'error' => $e->getMessage()
            ], 500);
        }
    });

    // Staff Inventory Reports Endpoint
    Route::post('/staff/reports/inventory', function (Request $request) {
        try {
            $reportType = $request->input('report_type', 'stock_summary');
            $dateFrom = $request->input('date_from');
            $dateTo = $request->input('date_to');
            $category = $request->input('category');
            $status = $request->input('status');
            
            \Log::info('Inventory report request', [
                'report_type' => $reportType,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'category' => $category,
                'status' => $status
            ]);
            
            // Base query for equipment
            $equipmentQuery = \App\Models\Equipment::query();
            
            // Apply category filter if provided
            if ($category && $category !== 'all') {
                $equipmentQuery->where('category', $category);
            }
            
            // Apply status filter if provided
            if ($status && $status !== 'all') {
                $equipmentQuery->where('status', $status);
            }
            
            $equipment = $equipmentQuery->get();
            
            // Calculate statistics
            $totalEquipment = $equipment->sum('quantity');
            $availableCount = $equipment->sum('available');
            $inUseCount = $equipment->sum('in_use');
            $maintenanceCount = $equipment->sum('maintenance');
            
            $statistics = [
                'total' => $totalEquipment,
                'available' => $availableCount,
                'in_use' => $inUseCount,
                'maintenance' => $maintenanceCount
            ];
            
            $reportData = [];
            
            if ($reportType === 'stock_summary') {
                // Stock summary report
                foreach ($equipment as $item) {
                    $reportData[] = [
                        'name' => $item->name,
                        'category' => $item->category,
                        'quantity' => $item->quantity,
                        'available' => $item->available,
                        'in_use' => $item->in_use,
                        'maintenance' => $item->maintenance,
                        'damaged' => $item->damaged,
                        'status' => $item->status
                    ];
                }
                
            } else if ($reportType === 'maintenance_schedule') {
                // Maintenance schedule report
                foreach ($equipment as $item) {
                    $reportData[] = [
                        'name' => $item->name,
                        'category' => $item->category,
                        'last_maintenance' => $item->last_maintenance ? $item->last_maintenance : 'N/A',
                        'next_maintenance' => $item->next_maintenance ? $item->next_maintenance : 'N/A',
                        'status' => $item->status,
                        'condition' => $item->condition
                    ];
                }
                
            } else if ($reportType === 'utilization_report') {
                // Utilization report by category
                $groupedData = $equipment->groupBy('category');
                
                foreach ($groupedData as $cat => $items) {
                    $total = $items->sum('quantity');
                    $available = $items->sum('available');
                    $inUse = $items->sum('in_use');
                    $utilizationRate = $total > 0 ? round(($inUse / $total) * 100, 2) : 0;
                    
                    $reportData[] = [
                        'category' => $cat,
                        'total' => $total,
                        'available' => $available,
                        'in_use' => $inUse,
                        'utilization_rate' => $utilizationRate
                    ];
                }
                
            } else if ($reportType === 'value_summary') {
                // Value summary by category
                $groupedData = $equipment->groupBy('category');
                
                foreach ($groupedData as $cat => $items) {
                    $totalItems = $items->sum('quantity');
                    $totalValue = $items->sum(function($item) {
                        return $item->value * $item->quantity;
                    });
                    $averageValue = $totalItems > 0 ? round($totalValue / $totalItems, 2) : 0;
                    
                    $reportData[] = [
                        'category' => $cat,
                        'total_items' => $totalItems,
                        'total_value' => number_format($totalValue, 2),
                        'average_value' => number_format($averageValue, 2)
                    ];
                }
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'statistics' => $statistics,
                    'data' => $reportData
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Staff inventory reports error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate inventory report',
                'error' => $e->getMessage()
            ], 500);
        }
    });

    // Staff Payment Reports Endpoint
    Route::post('/staff/reports/payments', function (Request $request) {
        try {
            $reportType = $request->input('report_type', 'revenue_summary');
            $dateFrom = $request->input('date_from');
            $dateTo = $request->input('date_to');
            $status = $request->input('status');
            $method = $request->input('method');
            
            \Log::info('Payment report request', [
                'report_type' => $reportType,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'status' => $status,
                'method' => $method
            ]);
            
            // Base query for payments
            $paymentsQuery = \App\Models\Payment::whereBetween('created_at', [$dateFrom, $dateTo]);
            
            // Apply status filter if provided
            if ($status && $status !== 'all') {
                $paymentsQuery->where('payment_status', $status);
            }
            
            // Apply payment method filter if provided
            if ($method && $method !== 'all') {
                $paymentsQuery->where('payment_method', $method);
            }
            
            $payments = $paymentsQuery->with(['user'])->get();
            
            // Calculate statistics
            $totalRevenue = $payments->sum('amount');
            $totalTransactions = $payments->count();
            $paidAmount = $payments->where('payment_status', 'paid')->sum('amount');
            $unpaidAmount = $payments->whereIn('payment_status', ['unpaid', 'processing'])->sum('amount');
            
            $statistics = [
                'total_revenue' => number_format($totalRevenue, 2),
                'total_transactions' => $totalTransactions,
                'paid' => number_format($paidAmount, 2),
                'unpaid' => number_format($unpaidAmount, 2)
            ];
            
            $reportData = [];
            
            if ($reportType === 'revenue_summary') {
                // Monthly revenue summary
                $groupedData = $payments->groupBy(function($payment) {
                    return \Carbon\Carbon::parse($payment->created_at)->format('Y-m');
                });
                
                // Helper function to format payment method names
                $formatPaymentMethod = function($method) {
                    $formatted = [
                        'gcash' => 'GCash',
                        'paymaya' => 'PayMaya',
                        'card' => 'Card',
                        'grab_pay' => 'GrabPay',
                        'bank_transfer' => 'Bank Transfer',
                        'cash' => 'Cash',
                        'other' => 'Other'
                    ];
                    return $formatted[strtolower($method)] ?? ucfirst(str_replace('_', ' ', $method));
                };
                
                foreach ($groupedData as $period => $items) {
                    $totalRev = $items->sum('amount');
                    $count = $items->count();
                    $avgTransaction = $count > 0 ? $totalRev / $count : 0;
                    $methods = $items->pluck('payment_method')->unique()->filter()->map($formatPaymentMethod)->implode(', ');
                    
                    $reportData[] = [
                        'period' => \Carbon\Carbon::parse($period . '-01')->format('F Y'),
                        'total_revenue' => number_format($totalRev, 2),
                        'transaction_count' => $count,
                        'average_transaction' => number_format($avgTransaction, 2),
                        'payment_methods' => $methods ?: 'N/A'
                    ];
                }
                
            } else if ($reportType === 'payment_method_breakdown') {
                // Payment method breakdown
                $groupedData = $payments->where('payment_status', 'paid')->groupBy('payment_method');
                $totalPaid = $payments->where('payment_status', 'paid')->sum('amount');
                
                // Helper function to format payment method names
                $formatPaymentMethod = function($method) {
                    $formatted = [
                        'gcash' => 'GCash',
                        'paymaya' => 'PayMaya',
                        'card' => 'Card',
                        'grab_pay' => 'GrabPay',
                        'bank_transfer' => 'Bank Transfer',
                        'cash' => 'Cash',
                        'other' => 'Other'
                    ];
                    return $formatted[strtolower($method ?? '')] ?? ucfirst(str_replace('_', ' ', $method ?? 'Not Specified'));
                };
                
                foreach ($groupedData as $paymentMethod => $items) {
                    $amount = $items->sum('amount');
                    $count = $items->count();
                    $percentage = $totalPaid > 0 ? round(($amount / $totalPaid) * 100, 2) : 0;
                    
                    $reportData[] = [
                        'method' => $formatPaymentMethod($paymentMethod),
                        'count' => $count,
                        'amount' => number_format($amount, 2),
                        'percentage' => $percentage
                    ];
                }
                
            } else if ($reportType === 'outstanding_payments') {
                // Outstanding/unpaid payments
                $outstandingPayments = \App\Models\Payment::whereIn('payment_status', ['unpaid', 'processing'])
                    ->with(['user'])
                    ->get();
                
                foreach ($outstandingPayments as $payment) {
                    $user = $payment->user;
                    $createdDate = \Carbon\Carbon::parse($payment->created_at);
                    $daysOverdue = $createdDate->diffInDays(now());
                    
                    $reportData[] = [
                        'student_name' => $user ? ($user->first_name . ' ' . $user->last_name) : 'N/A',
                        'batch' => $payment->batch_id ?? 'N/A',
                        'amount' => number_format($payment->amount, 2),
                        'due_date' => $createdDate->format('Y-m-d'),
                        'days_overdue' => $daysOverdue,
                        'status' => $payment->payment_status
                    ];
                }
                
            } else if ($reportType === 'daily_collection') {
                // Daily collection report
                $groupedData = $payments->where('payment_status', 'paid')->groupBy(function($payment) {
                    return \Carbon\Carbon::parse($payment->paid_at ?? $payment->created_at)->format('Y-m-d');
                });
                
                foreach ($groupedData as $date => $items) {
                    $total = $items->sum('amount');
                    $cash = $items->where('payment_method', 'cash')->sum('amount');
                    $online = $items->whereIn('payment_method', ['gcash', 'paymaya', 'card', 'grab_pay'])->sum('amount');
                    
                    $reportData[] = [
                        'date' => \Carbon\Carbon::parse($date)->format('M d, Y'),
                        'transactions' => $items->count(),
                        'total' => number_format($total, 2),
                        'cash' => number_format($cash, 2),
                        'online' => number_format($online, 2)
                    ];
                }
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'statistics' => $statistics,
                    'data' => $reportData
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Staff payment reports error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate payment report',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    // Staff Applicant Documents Endpoint
    Route::get('/staff/applicant-documents', function (Request $request) {
        try {
            // Get all applicants (users with application_status or role='applicant')
            $applicants = \App\Models\User::where(function($query) {
                $query->whereNotNull('application_status')
                      ->orWhere('role', 'applicant');
            })
            ->orderBy('created_at', 'desc')
            ->get();
            
            $documents = [];
            
            foreach ($applicants as $applicant) {
                $applicantName = trim($applicant->first_name . ' ' . ($applicant->middle_name ? $applicant->middle_name . ' ' : '') . $applicant->last_name);
                
                // Define document categories and their paths - only 4 required documents
                $documentTypes = [
                    'Valid ID' => 'valid_id_path',
                    'Transcript of Records' => 'transcript_path',
                    'Diploma' => 'diploma_path',
                    'Passport Photo' => 'passport_photo_path'
                ];
                
                foreach ($documentTypes as $docType => $pathField) {
                    if ($applicant->$pathField) {
                        // Get file info
                        $filePath = $applicant->$pathField;
                        $fileName = basename($filePath);
                        $fileSize = 'N/A';
                        
                        // Try to get actual file size if file exists
                        $fullPath = storage_path('app/public/' . $filePath);
                        if (file_exists($fullPath)) {
                            $bytes = filesize($fullPath);
                            if ($bytes >= 1048576) {
                                $fileSize = number_format($bytes / 1048576, 2) . ' MB';
                            } else if ($bytes >= 1024) {
                                $fileSize = number_format($bytes / 1024, 2) . ' KB';
                            } else {
                                $fileSize = $bytes . ' B';
                            }
                        }
                        
                        $documents[] = [
                            'id' => $applicant->id . '-' . $pathField,
                            'applicant_id' => $applicant->id,
                            'applicant_name' => $applicantName,
                            'student_id' => $applicant->student_id ?? 'N/A',
                            'email' => $applicant->email,
                            'document_type' => $docType,
                            'file_name' => $fileName,
                            'file_path' => $filePath,
                            'file_size' => $fileSize,
                            'upload_date' => $applicant->created_at ? $applicant->created_at->format('Y-m-d') : null,
                            'application_status' => $applicant->application_status ?? 'pending',
                            'status' => $applicant->status ?? 'pending'
                        ];
                    }
                }
            }
            
            // Group documents by category - only 4 required documents
            $categorizedDocuments = [
                'Valid ID' => array_filter($documents, fn($doc) => $doc['document_type'] === 'Valid ID'),
                'Transcript of Records' => array_filter($documents, fn($doc) => $doc['document_type'] === 'Transcript of Records'),
                'Diploma' => array_filter($documents, fn($doc) => $doc['document_type'] === 'Diploma'),
                'Passport Photo' => array_filter($documents, fn($doc) => $doc['document_type'] === 'Passport Photo')
            ];
            
            // Convert to indexed arrays
            foreach ($categorizedDocuments as $key => $value) {
                $categorizedDocuments[$key] = array_values($value);
            }
            
            return response()->json([
                'success' => true,
                'documents' => $documents,
                'categorized' => $categorizedDocuments,
                'total' => count($documents)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch applicant documents',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    // Staff Document Download Endpoint
    Route::get('/staff/document/download', function (Request $request) {
        try {
            $filePath = $request->query('path');
            
            if (!$filePath) {
                return response()->json([
                    'success' => false,
                    'message' => 'File path is required'
                ], 400);
            }
            
            $fullPath = storage_path('app/public/' . $filePath);
            
            if (!file_exists($fullPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found'
                ], 404);
            }
            
            $fileName = basename($fullPath);
            
            return response()->download($fullPath, $fileName, [
                'Content-Type' => mime_content_type($fullPath),
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to download file',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    // Staff Assessment Results Endpoint
    Route::get('/staff/assessment-results', function (Request $request) {
        try {
            // Get all grades with relationships
            $gradesQuery = \App\Models\Grade::with(['student', 'batch.program', 'gradedBy'])
                ->orderBy('graded_at', 'desc')
                ->orderBy('created_at', 'desc');
            
            // Apply filters if provided
            if ($request->has('program_id') && $request->program_id !== 'all') {
                $gradesQuery->where('program_id', $request->program_id);
            }
            
            if ($request->has('batch_id') && $request->batch_id !== 'all') {
                $gradesQuery->where('batch_id', $request->batch_id);
            }
            
            if ($request->has('assessment_type') && $request->assessment_type !== 'all') {
                $gradesQuery->where('assessment_type', $request->assessment_type);
            }
            
            if ($request->has('status') && $request->status !== 'all') {
                $gradesQuery->where('status', $request->status);
            }
            
            $grades = $gradesQuery->get();
            
            // Group grades by assessment (assessment_title + assessment_type + batch_id)
            $assessmentGroups = $grades->groupBy(function ($grade) {
                return $grade->assessment_title . '|' . $grade->assessment_type . '|' . $grade->batch_id;
            });
            
            // Format assessment results
            $assessments = $assessmentGroups->map(function ($gradeGroup, $key) {
                $firstGrade = $gradeGroup->first();
                $batch = $firstGrade->batch;
                $program = $batch ? $batch->program : null;
                
                // Calculate statistics
                $totalStudents = $gradeGroup->count();
                $gradedStudents = $gradeGroup->where('status', '!=', 'pending')->count();
                $passedStudents = $gradeGroup->where('status', 'passed')->count();
                $averageScore = $gradedStudents > 0 ? $gradeGroup->where('status', '!=', 'pending')->avg('percentage') : 0;
                $passRate = $gradedStudents > 0 ? ($passedStudents / $gradedStudents) * 100 : 0;
                $highestScore = $gradedStudents > 0 ? $gradeGroup->where('status', '!=', 'pending')->max('percentage') : 0;
                $lowestScore = $gradedStudents > 0 ? $gradeGroup->where('status', '!=', 'pending')->min('percentage') : 0;
                
                // Determine overall status
                $pendingCount = $gradeGroup->where('status', 'pending')->count();
                if ($pendingCount === $totalStudents) {
                    $status = 'scheduled';
                } elseif ($pendingCount > 0) {
                    $status = 'ongoing';
                } else {
                    $status = 'completed';
                }
                
                // Format individual student results
                $results = $gradeGroup->map(function ($grade) use ($firstGrade) {
                    $student = $grade->student;
                    return [
                        'id' => $grade->id,
                        'studentId' => $student->student_id ?? $student->id,
                        'studentName' => trim(($student->first_name ?? '') . ' ' . ($student->last_name ?? '')),
                        'score' => round($grade->percentage, 2),
                        'rawScore' => $grade->score,
                        'totalPoints' => $grade->total_points,
                        'result' => $grade->status === 'passed' ? 'Passed' : ($grade->status === 'failed' ? 'Failed' : 'Pending'),
                        'remarks' => $grade->feedback ?? ($grade->status === 'pending' ? 'Not yet assessed' : ($grade->isPassed() ? 'Satisfactory performance' : 'Needs improvement')),
                        'gradedAt' => $grade->graded_at ? $grade->graded_at->format('Y-m-d H:i:s') : null,
                        'attemptNumber' => $grade->attempt_number ?? 1,
                    ];
                })->values();
                
                // Generate assessment code (use first grade ID as base)
                $assessmentCode = 'ASM-' . date('Y') . '-' . str_pad($firstGrade->id, 4, '0', STR_PAD_LEFT);
                
                return [
                    'id' => $firstGrade->id,
                    'assessmentCode' => $assessmentCode,
                    'title' => $firstGrade->assessment_title,
                    'program' => $program ? $program->title : 'N/A',
                    'programId' => $program ? $program->id : null,
                    'batch' => $batch ? $batch->batch_id : 'N/A',
                    'batchId' => $firstGrade->batch_id,
                    'assessmentType' => ucfirst($firstGrade->assessment_type),
                    'assessor' => $firstGrade->gradedBy ? trim(($firstGrade->gradedBy->first_name ?? '') . ' ' . ($firstGrade->gradedBy->last_name ?? '')) : 'System',
                    'date' => $firstGrade->graded_at ? $firstGrade->graded_at->format('Y-m-d') : $firstGrade->created_at->format('Y-m-d'),
                    'totalStudents' => $totalStudents,
                    'assessed' => $gradedStudents,
                    'pending' => $pendingCount,
                    'passingScore' => $firstGrade->passing_score,
                    'averageScore' => round($averageScore, 2),
                    'passRate' => round($passRate, 2),
                    'highestScore' => round($highestScore, 2),
                    'lowestScore' => $gradedStudents > 0 ? round($lowestScore, 2) : 0,
                    'status' => $status,
                    'results' => $results,
                ];
            })->values();
            
            // Get unique programs and batches for filters
            $programs = \App\Models\Program::select('id', 'title')->get();
            $batches = \App\Models\Batch::select('id', 'batch_id')->orderBy('batch_id', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $assessments,
                'programs' => $programs,
                'batches' => $batches,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch assessment results',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    // Program Routes
    Route::apiResource('programs', ProgramController::class);
    
    // Batch Routes
    Route::apiResource('batches', BatchController::class);
    Route::get('/batches/{id}/students', [BatchController::class, 'getEnrolledStudents']);
    
    // Voucher Routes
    Route::apiResource('vouchers', VoucherController::class);
    
    // Payment Routes
    Route::get('/payments', [PaymentController::class, 'getAllPayments']);
    Route::post('/payments/check-required', [PaymentController::class, 'checkPaymentRequired']);
    Route::post('/payments/intent', [PaymentController::class, 'createPaymentIntent']);
    Route::post('/payments/source', [PaymentController::class, 'createPaymentSource']);
    Route::post('/payments/manual', [PaymentController::class, 'manualPayment']);
    Route::get('/payments/{id}', [PaymentController::class, 'getPayment']);
    Route::get('/payments/{id}/verify', [PaymentController::class, 'verifyPayment']);
    Route::get('/users/{userId}/payments', [PaymentController::class, 'getUserPayments']);
    
    // User Routes
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/stats', [UserController::class, 'stats']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    
    // Document Routes
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::post('/documents/upload', [DocumentController::class, 'upload']);
    Route::delete('/documents/{type}', [DocumentController::class, 'delete']);
    Route::get('/documents/{type}/view', [DocumentController::class, 'view']);
    
    // Equipment Routes
    Route::get('/equipment', [EquipmentController::class, 'index']);
    Route::get('/equipment/statistics', [EquipmentController::class, 'statistics']);
    Route::get('/equipment/categories', [EquipmentController::class, 'categories']);
    Route::get('/equipment/locations', [EquipmentController::class, 'locations']);
    Route::post('/equipment', [EquipmentController::class, 'store']);
    Route::get('/equipment/{id}', [EquipmentController::class, 'show']);
    Route::put('/equipment/{id}', [EquipmentController::class, 'update']);
    Route::delete('/equipment/{id}', [EquipmentController::class, 'destroy']);
    Route::post('/equipment/{id}/maintenance', [EquipmentController::class, 'addMaintenanceHistory']);
    
    // Equipment Assignment Routes
    Route::post('/equipment/{id}/assign', [EquipmentController::class, 'assignEquipment']);
    Route::post('/equipment/assignments/{assignmentId}/return', [EquipmentController::class, 'returnEquipment']);
    Route::get('/equipment/{id}/assignments', [EquipmentController::class, 'getAssignments']);
    Route::get('/equipment/{id}/assignments/active', [EquipmentController::class, 'getActiveAssignments']);
    
    // Quiz/Exam Routes
    Route::get('/quizzes', [QuizController::class, 'index']);
    Route::post('/quizzes', [QuizController::class, 'store']);
    Route::get('/quizzes/{id}', [QuizController::class, 'show']);
    Route::put('/quizzes/{id}', [QuizController::class, 'update']);
    Route::delete('/quizzes/{id}', [QuizController::class, 'destroy']);
    
    // Get students for a quiz (with completion status)
    Route::get('/quizzes/{id}/students', function ($id) {
        $quiz = DB::table('quizzes')->where('id', $id)->first();
        
        if (!$quiz) {
            return response()->json([
                'success' => false,
                'message' => 'Quiz not found'
            ], 404);
        }
        
        if (!$quiz->batch_id) {
            return response()->json([
                'success' => true,
                'students' => []
            ]);
        }
        
        // Get all students in the quiz's batch
        $students = DB::table('users')
            ->where('batch_id', $quiz->batch_id)
            ->where('role', 'student')
            ->select('id', 'first_name', 'last_name', 'email')
            ->get();
        
        // Check each student's completion status
        $studentsWithStatus = $students->map(function ($student) use ($id) {
            $attempt = DB::table('quiz_attempts')
                ->where('quiz_id', $id)
                ->where('user_id', $student->id)
                ->where('status', 'completed')
                ->orderBy('completed_at', 'desc')
                ->first();
            
            return [
                'id' => $student->id,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'email' => $student->email,
                'has_taken' => $attempt !== null,
                'score' => $attempt ? $attempt->score : null,
                'completed_at' => $attempt ? $attempt->completed_at : null
            ];
        });
        
        return response()->json([
            'success' => true,
            'students' => $studentsWithStatus
        ]);
    });
    
    // Quiz Attempt Routes
    Route::post('/quiz-attempts/start', function (Request $request) {
        $user = $request->user();
        $quizId = $request->quiz_id;
        
        // Get quiz
        $quiz = \App\Models\Quiz::find($quizId);
        if (!$quiz) {
            return response()->json([
                'success' => false,
                'message' => 'Quiz not found'
            ], 404);
        }
        
        // Check for existing in-progress attempt
        $existingAttempt = \App\Models\QuizAttempt::where('quiz_id', $quizId)
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->first();
            
        if ($existingAttempt) {
            // Return existing attempt if already in progress
            return response()->json([
                'success' => true,
                'data' => $existingAttempt,
                'message' => 'Continuing existing attempt'
            ]);
        }
        
        // Check if user has exceeded attempt limit (only count completed attempts)
        $completedAttemptCount = \App\Models\QuizAttempt::where('quiz_id', $quizId)
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->count();
            
        if ($completedAttemptCount >= $quiz->retake_limit) {
            return response()->json([
                'success' => false,
                'message' => 'You have exceeded the maximum number of attempts for this quiz'
            ], 403);
        }
        
        // Create new attempt
        $attempt = \App\Models\QuizAttempt::create([
            'quiz_id' => $quizId,
            'user_id' => $user->id,
            'attempt_number' => $completedAttemptCount + 1,
            'status' => 'in_progress',
            'started_at' => now(),
            'total_points' => $quiz->total_points
        ]);
        
        return response()->json([
            'success' => true,
            'data' => $attempt
        ]);
    });
    
    Route::post('/quiz-attempts/{id}/submit', function (Request $request, $id) {
        $user = $request->user();
        $answers = $request->answers;
        
        // Get attempt
        $attempt = \App\Models\QuizAttempt::find($id);
        if (!$attempt) {
            return response()->json([
                'success' => false,
                'message' => 'Attempt not found'
            ], 404);
        }
        
        // Check if attempt belongs to user
        if ($attempt->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        // Check if already submitted
        if ($attempt->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Attempt already submitted'
            ], 400);
        }
        
        $totalScore = 0;
        
        // Process each answer
        foreach ($answers as $answerData) {
            $question = \App\Models\QuizQuestion::find($answerData['question_id']);
            if (!$question) continue;
            
            $isCorrect = false;
            $pointsEarned = 0;
            
            if ($question->type === 'multiple_choice' || $question->type === 'true_false') {
                // Check if selected option is correct
                $option = \App\Models\QuizQuestionOption::find($answerData['option_id']);
                if ($option && $option->is_correct) {
                    $isCorrect = true;
                    $pointsEarned = $question->points;
                    $totalScore += $pointsEarned;
                }
            }
            
            // Save answer
            \App\Models\QuizAnswer::create([
                'attempt_id' => $attempt->id,
                'question_id' => $question->id,
                'option_id' => $answerData['option_id'] ?? null,
                'answer_text' => $answerData['answer_text'] ?? null,
                'is_correct' => $isCorrect,
                'points_earned' => $pointsEarned
            ]);
        }
        
        // Calculate time taken
        $timeTaken = now()->diffInSeconds($attempt->started_at);
        
        // Get the quiz
        $quiz = $attempt->quiz;
        
        // Calculate percentage
        $percentage = $quiz->total_points > 0 
            ? round(($totalScore / $quiz->total_points) * 100, 2) 
            : 0;
        
        // Update attempt
        $attempt->update([
            'score' => $totalScore,
            'status' => 'completed',
            'completed_at' => now(),
            'time_taken' => $timeTaken
        ]);
        
        // Create Grade record for this written test
        \App\Models\Grade::create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'quiz_attempt_id' => $attempt->id,
            'assessment_type' => 'written',
            'assessment_title' => $quiz->title,
            'score' => $totalScore,
            'total_points' => $quiz->total_points,
            'percentage' => $percentage,
            'passing_score' => $quiz->passing_score,
            'status' => $percentage >= $quiz->passing_score ? 'passed' : 'failed',
            'graded_by' => null, // Auto-graded
            'graded_at' => now(),
            'attempt_number' => $attempt->attempt_number,
            'batch_id' => $user->batch_id,
            'program_id' => $quiz->program_id,
        ]);
        
        return response()->json([
            'success' => true,
            'data' => $attempt->fresh(),
            'message' => 'Quiz submitted successfully'
        ]);
    });
    
    // Get student's TESDA assessment results
    Route::get('/student/quiz-results', function (Request $request) {
        $user = $request->user();
        
        // Check if user is a student
        if ($user->role !== 'student') {
            return response()->json([
                'error' => 'Unauthorized. Only students can access this endpoint.'
            ], 403);
        }
        
        // Get all TESDA assessment records for this student
        $assessments = DB::table('tesda_assessments')
            ->where('student_id', $user->student_id)
            ->orderBy('assessment_date', 'desc')
            ->get();
        
        // Format the results
        $results = $assessments->map(function ($assessment) {
            // Get program info
            $program = $assessment->program_id ? \App\Models\Program::find($assessment->program_id) : null;
            
            // Get batch info
            $batch = $assessment->batch_id ? \App\Models\Batch::find($assessment->batch_id) : null;
            
            // Determine competency based on result
            $isCompetent = $assessment->result === 'competent';
            
            return [
                'id' => $assessment->id,
                'quiz_id' => $assessment->id, // Using assessment ID as quiz_id for compatibility
                'quiz_title' => 'TESDA Competency Assessment',
                'quiz_description' => $assessment->remarks ?? 'TESDA competency-based assessment',
                'quiz_type' => 'demonstration', // TESDA assessments are typically demonstrations
                'course_title' => $program ? $program->title : 'N/A',
                'course_code' => $program ? ($program->code ?? $program->title) : 'N/A',
                'date_taken' => $assessment->assessment_date,
                'time_taken' => 0, // Not tracked for TESDA assessments
                'total_marks' => 100, // Competency is pass/fail, represented as 100 points
                'obtained_marks' => $isCompetent ? 100 : 0, // 100 if competent, 0 if not
                'passing_marks' => 100, // Must be fully competent
                'percentage' => $isCompetent ? 100 : 0,
                'status' => $isCompetent ? 'passed' : 'failed',
                'attempt_number' => 1,
                'max_attempts' => 1,
                'total_questions' => 1,
                'correct_answers' => $isCompetent ? 1 : 0,
                'tesda_assessor' => $assessment->tesda_assessor,
                'batch_name' => $batch ? $batch->batch_id : 'N/A'
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $results
        ]);
    });
    
    // Get detailed result for a specific attempt
    Route::get('/student/quiz-results/{attemptId}', function (Request $request, $attemptId) {
        $user = $request->user();
        
        // Get attempt with relationships
        $attempt = \App\Models\QuizAttempt::with(['quiz.questions.options', 'answers'])
            ->find($attemptId);
            
        if (!$attempt) {
            return response()->json([
                'success' => false,
                'message' => 'Attempt not found'
            ], 404);
        }
        
        // Check if attempt belongs to user
        if ($attempt->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $quiz = $attempt->quiz;
        $batch = $quiz->batch_id ? \App\Models\Batch::where('batch_id', $quiz->batch_id)->first() : null;
        $program = $batch ? \App\Models\Program::find($batch->program_id) : null;
        
        // Get detailed question-by-question breakdown
        $questionBreakdown = $quiz->questions->map(function ($question) use ($attempt) {
            $answer = $attempt->answers->firstWhere('question_id', $question->id);
            
            return [
                'question_id' => $question->id,
                'question_text' => $question->question,
                'question_type' => $question->type,
                'points' => $question->points,
                'points_earned' => $answer ? $answer->points_earned : 0,
                'is_correct' => $answer ? $answer->is_correct : false,
                'student_answer' => $answer ? [
                    'option_id' => $answer->option_id,
                    'answer_text' => $answer->answer_text,
                ] : null,
                'correct_option_id' => $question->options->firstWhere('is_correct', true)?->id ?? null,
                'options' => $question->options->map(function ($option) {
                    return [
                        'id' => $option->id,
                        'text' => $option->option_text,
                        'is_correct' => $option->is_correct,
                    ];
                }),
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => [
                'attempt' => [
                    'id' => $attempt->id,
                    'attempt_number' => $attempt->attempt_number,
                    'status' => $attempt->status,
                    'score' => $attempt->score,
                    'total_points' => $attempt->total_points,
                    'percentage' => $attempt->percentage,
                    'time_taken' => $attempt->time_taken,
                    'started_at' => $attempt->started_at,
                    'completed_at' => $attempt->completed_at,
                ],
                'quiz' => [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'description' => $quiz->description,
                    'type' => $quiz->type,
                    'passing_score' => $quiz->passing_score,
                    'retake_limit' => $quiz->retake_limit,
                ],
                'course' => [
                    'title' => $program ? $program->title : 'N/A',
                    'code' => $program ? ($program->code ?? $program->title) : 'N/A',
                ],
                'questions' => $questionBreakdown,
                'statistics' => [
                    'total_questions' => $quiz->questions->count(),
                    'correct_answers' => $attempt->answers->where('is_correct', true)->count(),
                    'incorrect_answers' => $attempt->answers->where('is_correct', false)->count(),
                    'passed' => $attempt->percentage >= $quiz->passing_score,
                ]
            ]
        ]);
    });
    
    // Get student's certificates
    Route::get('/student/certificates', function (Request $request) {
        $user = $request->user();
        
        // Check if user is a student
        if ($user->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only students can access this endpoint.'
            ], 403);
        }
        
        // Get all certificates for this student with related data
        $certificates = DB::table('certificates')
            ->where('user_id', $user->id)
            ->orderBy('issued_date', 'desc')
            ->get();
        
        // Format certificates with program details
        $formattedCertificates = $certificates->map(function ($cert) use ($user) {
            // Get program details
            $program = $cert->program_id ? \App\Models\Program::find($cert->program_id) : null;
            
            // Get trainer/issuer details
            $trainer = $cert->issued_by ? DB::table('users')->find($cert->issued_by) : null;
            
            return [
                'id' => $cert->id,
                'certificate_number' => $cert->certificate_number,
                'issued_date' => $cert->issued_date,
                'status' => $cert->status,
                'grade' => $cert->grade,
                'attendance_rate' => $cert->attendance_rate,
                'notes' => $cert->notes,
                'program' => $program ? [
                    'id' => $program->id,
                    'title' => $program->title,
                    'code' => $program->code ?? 'N/A',
                    'description' => $program->description,
                ] : null,
                'issued_by' => $trainer ? [
                    'name' => $trainer->first_name . ' ' . $trainer->last_name,
                    'email' => $trainer->email,
                ] : null,
                'student' => [
                    'name' => $user->first_name . ' ' . $user->last_name,
                    'student_id' => $user->student_id ?? 'N/A',
                ],
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $formattedCertificates
        ]);
    });
    
    // Student Exams/Assessments Routes
    Route::get('/student/exams', function (Request $request) {
        $user = $request->user();
        
        // Check if user is a student
        if ($user->role !== 'student') {
            return response()->json([
                'error' => 'Unauthorized. Only students can access this endpoint.'
            ], 403);
        }
        
        // Check if student has a batch assigned
        if (!$user->batch_id) {
            return response()->json([
                'success' => true,
                'data' => [],
                'batch' => null,
                'program' => null,
                'message' => 'No batch assigned yet'
            ]);
        }
        
        // Get batch and program details
        $batch = \App\Models\Batch::where('batch_id', $user->batch_id)->first();
        $program = $batch ? \App\Models\Program::find($batch->program_id) : null;
        
        // Get active exams for the student's batch with relationships
        $exams = \App\Models\Quiz::where('batch_id', $user->batch_id)
            ->where('status', 'active')
            ->with(['questions', 'attempts' => function($query) use ($user) {
                $query->where('user_id', $user->id);
            }])
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Add additional info to each exam
        $exams->map(function ($exam) use ($program, $user) {
            $exam->course_title = $program ? $program->title : 'N/A';
            $exam->course_code = $program ? ($program->code ?? $program->title) : 'N/A';
            $exam->total_questions = $exam->questions->count();
            
            // Get student's attempts for this exam
            $userAttempts = $exam->attempts;
            $exam->attempts_taken = $userAttempts->count();
            $exam->attempts_remaining = max(0, $exam->retake_limit - $userAttempts->count());
            
            // Get latest attempt info
            $latestAttempt = $userAttempts->sortByDesc('created_at')->first();
            if ($latestAttempt) {
                $exam->latest_attempt_status = $latestAttempt->status;
                $exam->latest_score = $latestAttempt->score;
                $exam->latest_percentage = $latestAttempt->percentage;
            } else {
                $exam->latest_attempt_status = null;
                $exam->latest_score = null;
                $exam->latest_percentage = null;
            }
            
            // Remove the attempts relationship from response to keep it clean
            unset($exam->attempts);
            unset($exam->questions);
            
            return $exam;
        });
        
        return response()->json([
            'success' => true,
            'data' => $exams,
            'batch' => $batch,
            'program' => $program
        ]);
    });
    
    // Student Schedule Routes
    Route::get('/student/schedule', function (Request $request) {
        $user = $request->user();
        
        // Check if user is a student
        if ($user->role !== 'student') {
            return response()->json([
                'error' => 'Unauthorized. Only students can access this endpoint.'
            ], 403);
        }
        
        // Check if student has a batch assigned
        if (!$user->batch_id) {
            return response()->json([
                'schedule' => [],
                'batch' => null,
                'program' => null,
                'message' => 'No batch assigned yet'
            ]);
        }
        
        // Get batch details with program and trainer info
        $batch = \App\Models\Batch::where('batch_id', $user->batch_id)->first();
        
        if (!$batch) {
            return response()->json([
                'error' => 'Batch not found'
            ], 404);
        }
        
        // Get program details
        $program = \App\Models\Program::find($batch->program_id);
        
        // Get trainer assigned to this batch
        $trainer = \App\Models\User::where('role', 'trainer')
            ->where('batch_id', $user->batch_id)
            ->first();
        
        // Parse schedule days (stored as JSON array)
        $scheduleDays = is_string($batch->schedule_days) 
            ? json_decode($batch->schedule_days, true) 
            : $batch->schedule_days;
        
        // Map day names to day numbers (0 = Sunday, 1 = Monday, etc.)
        $dayMap = [
            'Sunday' => 0,
            'Monday' => 1,
            'Tuesday' => 2,
            'Wednesday' => 3,
            'Thursday' => 4,
            'Friday' => 5,
            'Saturday' => 6
        ];
        
        // Build schedule array
        $schedule = [];
        if (is_array($scheduleDays)) {
            foreach ($scheduleDays as $day) {
                if (isset($dayMap[$day])) {
                    $schedule[] = [
                        'id' => uniqid(),
                        'courseTitle' => $program ? $program->title : 'N/A',
                        'courseCode' => $program ? $program->code : 'N/A',
                        'instructor' => $trainer ? ($trainer->first_name . ' ' . $trainer->last_name) : 'TBA',
                        'dayOfWeek' => $dayMap[$day],
                        'dayName' => $day,
                        'startTime' => substr($batch->schedule_time_start, 0, 5), // Format: HH:MM
                        'endTime' => substr($batch->schedule_time_end, 0, 5),
                        'location' => 'Training Room', // You can add location field to batches table if needed
                        'description' => $program ? $program->description : '',
                        'color' => 'blue' // You can assign different colors based on program type
                    ];
                }
            }
        }
        
        return response()->json([
            'schedule' => $schedule,
            'batch' => [
                'batch_id' => $batch->batch_id,
                'status' => $batch->status,
                'start_date' => $batch->start_date,
                'end_date' => $batch->end_date,
                'schedule_days' => $scheduleDays,
                'schedule_time_start' => $batch->schedule_time_start,
                'schedule_time_end' => $batch->schedule_time_end,
                'max_students' => $batch->max_students
            ],
            'program' => $program ? [
                'id' => $program->id,
                'name' => $program->title,
                'code' => $program->code,
                'description' => $program->description,
                'duration' => $program->duration
            ] : null,
            'trainer' => $trainer ? [
                'name' => $trainer->first_name . ' ' . $trainer->last_name,
                'email' => $trainer->email,
                'phone_number' => $trainer->phone_number
            ] : null
        ]);
    });

    // Get student's own attendance records
    Route::get('/student/attendance', function (Request $request) {
        $user = $request->user();
        
        // Check if user is a student
        if ($user->role !== 'student') {
            return response()->json([
                'error' => 'Unauthorized. Only students can access this endpoint.'
            ], 403);
        }
        
        // Check if student has a batch assigned
        if (!$user->batch_id) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'No batch assigned yet'
            ]);
        }
        
        // Get batch details
        $batch = \App\Models\Batch::where('batch_id', $user->batch_id)->first();
        
        if (!$batch) {
            return response()->json([
                'error' => 'Batch not found'
            ], 404);
        }
        
        // Get program details
        $program = \App\Models\Program::find($batch->program_id);
        
        // Get trainer details
        $trainer = \App\Models\User::find($batch->trainer_id);
        
        // Get attendance records for this student
        $attendanceRecords = DB::table('attendances')
            ->where('user_id', $user->id)
            ->where('batch_id', $user->batch_id)
            ->orderBy('date', 'desc')
            ->get();
        
        // Transform the records
        $formattedRecords = $attendanceRecords->map(function ($record) use ($program, $trainer, $batch) {
            return [
                'id' => $record->id,
                'date' => $record->date,
                'status' => $record->status,
                'time_in' => $record->time_in,
                'time_out' => $record->time_out,
                'total_hours' => $record->total_hours,
                'remarks' => $record->remarks,
                'courseTitle' => $program ? $program->title : 'N/A',
                'courseCode' => $program ? $program->code : 'N/A',
                'instructor' => $trainer ? ($trainer->first_name . ' ' . $trainer->last_name) : 'TBA',
                'location' => 'Training Room',
                'startTime' => substr($batch->schedule_time_start, 0, 5),
                'endTime' => substr($batch->schedule_time_end, 0, 5),
            ];
        });
        
        // Calculate statistics
        $total = $attendanceRecords->count();
        $present = $attendanceRecords->where('status', 'present')->count();
        $late = $attendanceRecords->where('status', 'late')->count();
        $absent = $attendanceRecords->where('status', 'absent')->count();
        $excused = $attendanceRecords->where('status', 'excused')->count();
        $percentage = $total > 0 ? round((($present + $late) / $total) * 100, 1) : 0;
        
        return response()->json([
            'success' => true,
            'data' => $formattedRecords,
            'statistics' => [
                'total' => $total,
                'present' => $present,
                'late' => $late,
                'absent' => $absent,
                'excused' => $excused,
                'percentage' => $percentage
            ],
            'batch' => [
                'batch_id' => $batch->batch_id,
                'program_name' => $program ? $program->title : 'N/A',
                'start_date' => $batch->start_date,
                'end_date' => $batch->end_date
            ]
        ]);
    });

    // Enrollment Trends Analytics
    Route::get('/admin/enrollment-trends', function () {
        $csvPath = public_path('enrollment-data');
        $programs = [
            'BARTENDING_NC_II',
            'BARISTA_TRAINING_NC_II',
            'HOUSEKEEPING_NC_II',
            'FOOD_AND_BEVERAGE_SERVICES_NC_II',
            'BREAD_AND_PASTRY_PRODUCTION_NC_II',
            'EVENTS_MANAGEMENT_NC_III',
            'CHEFS_CATERING_SERVICES_NC_II',
            'COOKERY_NC_II'
        ];

        $allData = [];
        $programTotals = [];

        foreach ($programs as $program) {
            $filename = $csvPath . '/' . $program . '_HISTORICAL.csv';
            
            if (file_exists($filename)) {
                $file = fopen($filename, 'r');
                fgetcsv($file); // Skip title row (first line)
                fgetcsv($file); // Skip header row (second line)
                
                $programData = [];
                $total = 0;
                $programName = '';
                
                while (($row = fgetcsv($file)) !== false) {
                    // Skip empty rows
                    if (empty($row[0]) || empty($row[1]) || empty($row[2])) {
                        continue;
                    }
                    
                    $data = [
                        'date' => $row[0],
                        'enrollment' => (int)$row[1],
                        'program' => $row[2]
                    ];
                    $programData[] = $data;
                    $allData[] = $data;
                    $total += (int)$row[1];
                    $programName = $row[2];
                }
                
                fclose($file);
                
                if ($programName) {
                    $programTotals[$programName] = $total;
                }
            }
        }

        // Calculate quarterly aggregates
        $quarterlyData = [];
        foreach ($allData as $record) {
            $date = new \DateTime($record['date']);
            $year = $date->format('Y');
            $month = (int)$date->format('m');
            $quarter = ceil($month / 3);
            $key = "Q{$quarter} {$year}";
            
            if (!isset($quarterlyData[$key])) {
                $quarterlyData[$key] = 0;
            }
            $quarterlyData[$key] += $record['enrollment'];
        }

        // Sort quarterly data by date
        uksort($quarterlyData, function($a, $b) {
            preg_match('/Q(\d) (\d+)/', $a, $matchA);
            preg_match('/Q(\d) (\d+)/', $b, $matchB);
            $yearA = (int)$matchA[2];
            $yearB = (int)$matchB[2];
            $quarterA = (int)$matchA[1];
            $quarterB = (int)$matchB[1];
            
            if ($yearA != $yearB) {
                return $yearA - $yearB;
            }
            return $quarterA - $quarterB;
        });

        // Sort program totals
        arsort($programTotals);

        return response()->json([
            'success' => true,
            'quarterlyData' => $quarterlyData,
            'programTotals' => $programTotals,
            'allData' => $allData,
            'stats' => [
                'totalPrograms' => count($programTotals),
                'totalEnrollments' => array_sum($programTotals),
                'avgPerProgram' => count($programTotals) > 0 ? round(array_sum($programTotals) / count($programTotals)) : 0,
            ]
        ]);
    });

    // Admin Assessment Results
    Route::get('/admin/assessment-results', function (Request $request) {
        $user = $request->user();
        
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admins can access this endpoint.'
            ], 403);
        }
        
        // Get all grades with relationships
        $grades = \App\Models\Grade::with(['student', 'batch.program', 'quiz'])
            ->orderBy('graded_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Format the results
        $results = $grades->map(function ($grade) {
            $student = $grade->student;
            $batch = $grade->batch;
            $program = $batch ? $batch->program : ($grade->program ?? null);
            
            return [
                'id' => $grade->id,
                'student_id' => $student->student_id ?? $student->id,
                'student_name' => $student->first_name . ' ' . $student->last_name,
                'program_name' => $program ? $program->title : 'N/A',
                'program_id' => $program ? $program->id : null,
                'batch_id' => $grade->batch_id,
                'batch_name' => $batch ? $batch->batch_id : 'N/A',
                'assessment_type' => $grade->assessment_type,
                'assessment_title' => $grade->assessment_title,
                'score' => $grade->score,
                'total_points' => $grade->total_points,
                'percentage' => $grade->percentage,
                'passing_score' => $grade->passing_score,
                'status' => $grade->status,
                'competency_status' => $grade->percentage >= 85 ? 'Competent' : 'Not Competent',
                'graded_at' => $grade->graded_at,
                'feedback' => $grade->feedback,
                'attempt_number' => $grade->attempt_number,
            ];
        });
        
        // Calculate statistics
        $totalAssessments = $results->count();
        $passedAssessments = $results->where('status', 'passed')->count();
        $passRate = $totalAssessments > 0 ? round(($passedAssessments / $totalAssessments) * 100, 1) : 0;
        $averageScore = $results->avg('percentage') ?? 0;
        $pendingAssessments = $results->where('status', 'pending')->count();
        
        // Score distribution
        $scoreRanges = [
            '90-100' => $results->filter(fn($r) => $r['percentage'] >= 90 && $r['percentage'] <= 100)->count(),
            '80-89' => $results->filter(fn($r) => $r['percentage'] >= 80 && $r['percentage'] < 90)->count(),
            '70-79' => $results->filter(fn($r) => $r['percentage'] >= 70 && $r['percentage'] < 80)->count(),
            '60-69' => $results->filter(fn($r) => $r['percentage'] >= 60 && $r['percentage'] < 70)->count(),
            'Below 60' => $results->filter(fn($r) => $r['percentage'] < 60)->count(),
        ];
        
        // Program performance
        $programPerformance = $results->groupBy('program_name')->map(function ($programGrades, $programName) {
            return [
                'program' => $programName,
                'average_score' => round($programGrades->avg('percentage'), 1)
            ];
        })->values();
        
        // Get unique programs and batches for filtering
        $programs = $results->unique('program_id')->map(function ($item) {
            return [
                'id' => $item['program_id'],
                'name' => $item['program_name']
            ];
        })->values();
        
        $batches = $results->unique('batch_id')->map(function ($item) {
            return [
                'id' => $item['batch_id'],
                'name' => $item['batch_name']
            ];
        })->values();
        
        return response()->json([
            'success' => true,
            'data' => $results,
            'statistics' => [
                'totalAssessments' => $totalAssessments,
                'passRate' => $passRate,
                'averageScore' => round($averageScore, 1),
                'pendingAssessments' => $pendingAssessments,
            ],
            'scoreDistribution' => $scoreRanges,
            'programPerformance' => $programPerformance,
            'programs' => $programs,
            'batches' => $batches,
        ]);
    });

    // Get all students with their details
    Route::get('/admin/students', function (Request $request) {
        $user = $request->user();
        
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admins can access this endpoint.'
            ], 403);
        }

        // Fetch all users with role 'student' along with their batch and program
        $students = \App\Models\User::with(['batch.program', 'grades', 'payments' => function($query) {
                $query->where('payment_status', 'paid')->latest();
            }])
            ->where('role', 'student')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get all programs for filter dropdown
        $programs = \App\Models\Program::select('id', 'title')->get();
        
        // Get all batches for filter dropdown with program_id and student counts
        $batches = \App\Models\Batch::select('id', 'batch_id', 'program_id', 'max_students')->get();
        
        // Add student count to each batch
        $batches = $batches->map(function($batch) {
            $studentCount = \App\Models\User::where('batch_id', $batch->batch_id)
                ->where('role', 'student')
                ->count();
            $batch->current_students = $studentCount;
            return $batch;
        });

        // Format student data
        $formattedStudents = $students->map(function ($student) {
            // Calculate progress from grades
            $totalGrades = $student->grades->count();
            $completedGrades = $student->grades->where('status', 'passed')->count();
            $progress = $totalGrades > 0 ? round(($completedGrades / $totalGrades) * 100) : 0;

            // Calculate attendance percentage
            $totalAttendance = $student->attendances()->count();
            $presentCount = $student->attendances()->where('status', 'present')->count();
            $attendance = $totalAttendance > 0 ? round(($presentCount / $totalAttendance) * 100) : 0;

            // Get payment method from latest paid payment
            $latestPayment = $student->payments->first();
            $paymentMethod = null;
            if ($latestPayment && $latestPayment->payment_method) {
                // Format payment method for display
                $method = $latestPayment->payment_method;
                $methodMap = [
                    'cash' => 'Cash',
                    'gcash' => 'GCash',
                    'maya' => 'Maya',
                    'paymaya' => 'Maya',
                    'credit_card' => 'Credit Card',
                    'debit_card' => 'Debit Card',
                    'grab_pay' => 'GrabPay',
                ];
                $paymentMethod = $methodMap[$method] ?? ucwords(str_replace('_', ' ', $method));
            }

            return [
                'id' => $student->student_id ?? 'STU-' . str_pad($student->id, 4, '0', STR_PAD_LEFT),
                'user_id' => $student->id,
                'name' => $student->full_name,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'email' => $student->email,
                'phone' => $student->phone_number,
                'address' => $student->address,
                'program' => $student->batch && $student->batch->program ? $student->batch->program->title : 'N/A',
                'program_id' => $student->batch && $student->batch->program ? $student->batch->program->id : null,
                'batch' => $student->batch ? $student->batch->batch_id : 'N/A',
                'batch_id' => $student->batch_id,
                'enrollment_date' => $student->created_at ? $student->created_at->format('Y-m-d') : null,
                'status' => ucfirst($student->status ?? 'active'),
                'progress' => $progress,
                'attendance' => $attendance,
                'date_of_birth' => $student->date_of_birth ? $student->date_of_birth->format('Y-m-d') : null,
                'gender' => $student->gender,
                'voucher_eligible' => $student->voucher_eligible ?? false,
                'payment_method' => $paymentMethod,
            ];
        });

        return response()->json([
            'success' => true,
            'students' => $formattedStudents,
            'programs' => $programs->map(fn($p) => ['id' => $p->id, 'name' => $p->title]),
            'batches' => $batches->map(fn($b) => [
                'id' => $b->id, 
                'name' => $b->batch_id, 
                'program_id' => $b->program_id,
                'current_students' => $b->current_students,
                'max_students' => $b->max_students,
                'is_full' => $b->current_students >= $b->max_students
            ]),
            'total' => $formattedStudents->count(),
        ]);
    });

    // Update student enrollment
    Route::put('/admin/students/{userId}', function (Request $request, $userId) {
        $user = $request->user();
        
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admins can update enrollments.'
            ], 403);
        }

        // Validate the request
        $validated = $request->validate([
            'email' => 'sometimes|email|unique:users,email,' . $userId,
            'phone' => 'nullable|string',
            'status' => 'sometimes|string|in:active,inactive,completed,dropped',
            'program_id' => 'sometimes|integer|exists:programs,id',
            'batch_id' => 'nullable|integer',
            'voucher_eligible' => 'sometimes|boolean',
        ]);

        try {
            $student = \App\Models\User::findOrFail($userId);
            
            // If batch_id is provided, get the batch_id string (not the numeric id)
            if (isset($validated['batch_id']) && $validated['batch_id']) {
                $batch = \App\Models\Batch::find($validated['batch_id']);
                if ($batch) {
                    $student->batch_id = $batch->batch_id; // Use the string batch_id
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Batch not found.'
                    ], 404);
                }
            }
            
            // Update other fields
            if (isset($validated['email'])) {
                $student->email = $validated['email'];
            }
            if (isset($validated['phone'])) {
                $student->phone_number = $validated['phone'];
            }
            if (isset($validated['status'])) {
                $student->status = $validated['status'];
            }
            if (isset($validated['voucher_eligible'])) {
                $student->voucher_eligible = $validated['voucher_eligible'];
            }
            
            $student->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Student enrollment updated successfully.',
                'student' => $student
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update enrollment: ' . $e->getMessage()
            ], 500);
        }
    });

    // Delete student enrollment
    Route::delete('/admin/students/{userId}', function (Request $request, $userId) {
        $admin = $request->user();
        
        if ($admin->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admins can delete enrollments.'
            ], 403);
        }

        // Validate password
        $request->validate([
            'password' => 'required|string',
        ]);

        // Verify admin password
        if (!\Illuminate\Support\Facades\Hash::check($request->password, $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid password. Please check your password and try again.'
            ], 401);
        }

        try {
            $student = \App\Models\User::findOrFail($userId);
            
            // Check if user is a student
            if ($student->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only delete student accounts.'
                ], 400);
            }
            
            // Store student info for response
            $studentName = $student->first_name . ' ' . $student->last_name;
            $studentId = $student->student_id;
            
            // Delete the student (this will cascade delete related records if configured)
            $student->delete();
            
            return response()->json([
                'success' => true,
                'message' => "Student enrollment for {$studentName} ({$studentId}) has been deleted successfully."
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete enrollment: ' . $e->getMessage()
            ], 500);
        }
    });

    // ARIMA Forecast
    Route::post('/admin/arima-forecast', function (Request $request) {
        $program = $request->input('program', 'all');
        $periods = $request->input('periods', 6);
        
        $csvPath = public_path('enrollment-data');
        $historicalData = [];
        
        if ($program === 'all') {
            // Aggregate all programs
            $programs = [
                'BARTENDING_NC_II',
                'BARISTA_TRAINING_NC_II',
                'HOUSEKEEPING_NC_II',
                'FOOD_AND_BEVERAGE_SERVICES_NC_II',
                'BREAD_AND_PASTRY_PRODUCTION_NC_II',
                'EVENTS_MANAGEMENT_NC_III',
                'CHEFS_CATERING_SERVICES_NC_II',
                'COOKERY_NC_II'
            ];
            
            $aggregated = [];
            foreach ($programs as $prog) {
                $filename = $csvPath . '/' . $prog . '_HISTORICAL.csv';
                if (file_exists($filename)) {
                    $file = fopen($filename, 'r');
                    fgetcsv($file); // Skip header
                    
                    while (($row = fgetcsv($file)) !== false) {
                        $date = $row[0];
                        if (!isset($aggregated[$date])) {
                            $aggregated[$date] = 0;
                        }
                        $aggregated[$date] += (int)$row[1];
                    }
                    fclose($file);
                }
            }
            
            foreach ($aggregated as $date => $enrollment) {
                $historicalData[] = [
                    'date' => $date,
                    'enrollment' => $enrollment
                ];
            }
        } else {
            // Single program
            $programFile = str_replace(' ', '_', strtoupper($program));
            $programFile = str_replace("'", '', $programFile);
            $filename = $csvPath . '/' . $programFile . '_HISTORICAL.csv';
            
            if (file_exists($filename)) {
                $file = fopen($filename, 'r');
                fgetcsv($file); // Skip header
                
                while (($row = fgetcsv($file)) !== false) {
                    $historicalData[] = [
                        'date' => $row[0],
                        'enrollment' => (int)$row[1]
                    ];
                }
                fclose($file);
            }
        }
        
        // Sort by date
        usort($historicalData, function($a, $b) {
            return strtotime($a['date']) - strtotime($b['date']);
        });
        
        // Simple moving average forecast (replace with ARIMA library if available)
        $lastValues = array_slice($historicalData, -6);
        $avg = count($lastValues) > 0 ? array_sum(array_column($lastValues, 'enrollment')) / count($lastValues) : 0;
        
        // Calculate trend
        if (count($historicalData) >= 6) {
            $recentAvg = array_sum(array_column(array_slice($historicalData, -3), 'enrollment')) / 3;
            $olderAvg = array_sum(array_column(array_slice($historicalData, -6, 3), 'enrollment')) / 3;
            $trend = ($recentAvg - $olderAvg) / 3;
        } else {
            $trend = 0;
        }
        
        // Generate forecast
        $forecast = [];
        $lastDate = count($historicalData) > 0 ? end($historicalData)['date'] : date('Y-m-d');
        $currentValue = count($historicalData) > 0 ? end($historicalData)['enrollment'] : 0;
        
        for ($i = 1; $i <= $periods; $i++) {
            $nextDate = date('Y-m-d', strtotime($lastDate . " +3 months"));
            $predictedValue = round($currentValue + ($trend * $i));
            
            $forecast[] = [
                'date' => $nextDate,
                'enrollment' => max(0, $predictedValue),
                'upper_bound' => max(0, round($predictedValue * 1.15)),
                'lower_bound' => max(0, round($predictedValue * 0.85)),
                'confidence' => round(95 - ($i * 3)) // Decreasing confidence
            ];
            
            $lastDate = $nextDate;
        }
        
        // Calculate growth rate
        $growthRates = [];
        for ($i = 1; $i < count($historicalData); $i++) {
            $prev = $historicalData[$i - 1]['enrollment'];
            $curr = $historicalData[$i]['enrollment'];
            if ($prev > 0) {
                $growthRates[] = (($curr - $prev) / $prev) * 100;
            }
        }
        $avgGrowth = count($growthRates) > 0 ? array_sum($growthRates) / count($growthRates) : 0;
        
        return response()->json([
            'success' => true,
            'historical' => $historicalData,
            'forecast' => $forecast,
            'stats' => [
                'totalHistorical' => array_sum(array_column($historicalData, 'enrollment')),
                'avgGrowthRate' => round($avgGrowth, 2),
                'predictedNext' => count($forecast) > 0 ? $forecast[0]['enrollment'] : 0,
                'trend' => $avgGrowth > 0 ? 'increasing' : ($avgGrowth < 0 ? 'decreasing' : 'stable')
            ]
        ]);
    });
});

