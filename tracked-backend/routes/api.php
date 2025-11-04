<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
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
        ]
    ]);
});

Route::post('/student/login', function (Request $request) {
    $request->validate([
        'email' => 'required|string|email',
        'password' => 'required|string',
    ]);

    // Find student user
    $user = User::where('email', $request->email)
                ->where('role', 'student')
                ->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        // Log failed student login attempt
        DB::table('system_logs')->insert([
            'user_id' => $user ? $user->id : null,
            'action' => 'student_login_failed',
            'description' => 'Failed student login attempt for email: ' . $request->email,
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
        // Log inactive student account login attempt
        DB::table('system_logs')->insert([
            'user_id' => $user->id,
            'action' => 'student_login_blocked',
            'description' => 'Student login attempt blocked for inactive account: ' . $user->email,
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
        'description' => 'Student logged in successfully: ' . $user->email,
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
            
            return $batch;
        });
        
        return response()->json([
            'success' => true,
            'data' => $batches
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
                ->select('attendance_date')
                ->distinct()
                ->count();
            
            $attendedClasses = \App\Models\Attendance::where('user_id', $student->id)
                ->where('status', 'present')
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
                'progress' => [
                    'attendance' => round($attendancePercentage, 2),
                    'overall_grade' => round($overallGrade, 2),
                    'practical_assessments' => round($gradesByType['practical'], 2),
                    'theoretical_assessments' => round($gradesByType['theoretical'], 2),
                    'completed_modules' => $completedModules,
                    'total_modules' => $totalModules,
                ],
                'grades' => $gradesList,
                'certification' => [
                    'status' => $status,
                    'remarks' => $remarks,
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
            ->select('attendance_date')
            ->distinct()
            ->count();
        
        $attendedClasses = \App\Models\Attendance::where('user_id', $student->id)
            ->where('status', 'present')
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
            'application_status' => 'required|in:pending,under_review,approved,rejected'
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
        
        // Handle rejection - free up voucher slot if applicant was eligible
        if ($request->application_status === 'rejected') {
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
        
        $applicant->application_status = $request->application_status;
        $applicant->save();
        
        return response()->json([
            'message' => 'Application status updated successfully',
            'applicant' => $applicant
        ]);
    });
    
    // Approve applicant and convert to student
    Route::post('/staff/applicants/{id}/approve', function (Request $request, $id) {
        $request->validate([
            'batch_id' => 'required|exists:batches,batch_id',
            'payment_id' => 'nullable|exists:payments,id'
        ]);

        $applicant = \App\Models\User::where('role', 'applicant')
            ->where('id', $id)
            ->first();
        
        if (!$applicant) {
            return response()->json(['error' => 'Applicant not found'], 404);
        }
        
        if ($applicant->application_status === 'approved' && $applicant->role === 'student') {
            return response()->json(['error' => 'Applicant has already been approved and converted to student'], 400);
        }
        
        // Get batch details
        $batch = \App\Models\Batch::where('batch_id', $request->batch_id)->first();
        if (!$batch) {
            return response()->json(['error' => 'Batch not found'], 404);
        }
        
        // Check batch capacity
        $currentEnrollment = \App\Models\User::where('batch_id', $request->batch_id)
            ->where('role', 'student')
            ->count();
        
        if ($currentEnrollment >= $batch->max_students) {
            return response()->json([
                'error' => 'Batch has reached maximum capacity',
                'current_enrollment' => $currentEnrollment,
                'max_students' => $batch->max_students
            ], 400);
        }
        
        // Generate unique student ID
        $year = date('Y');
        $lastStudent = \App\Models\User::where('student_id', 'like', "STU-{$year}-%")
            ->orderBy('student_id', 'desc')
            ->first();
        
        if ($lastStudent) {
            $lastNumber = (int) substr($lastStudent->student_id, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }
        
        $studentId = "STU-{$year}-{$newNumber}";
        
        // Check voucher availability at approval time FOR ALL APPLICANTS
        $voucherStatus = 'not_eligible';
        $assignedVoucherId = null;
        $voucherConsumed = false;
        
        // Find available voucher for the batch they're being assigned to
        $voucher = \App\Models\Voucher::where('batch_id', $request->batch_id)
            ->whereRaw('used_count < quantity')
            ->whereIn('status', ['pending', 'issued', 'active'])
            ->first();
        
        if ($voucher) {
            // Voucher available - assign it
            $voucherStatus = 'eligible';
            $assignedVoucherId = $voucher->voucher_id;
            
            // Increment used_count
            $voucher->increment('used_count');
            $voucherConsumed = true;
            
            // Update voucher status if all vouchers are used
            if ($voucher->used_count >= $voucher->quantity) {
                $voucher->update(['status' => 'used']);
            }
        } else {
            // No vouchers available - PAYMENT REQUIRED
            $voucherStatus = 'not_eligible';
            
            // Check if payment_id was provided
            if (!$request->payment_id) {
                return response()->json([
                    'success' => false,
                    'error' => 'No vouchers available. Payment required before enrollment.',
                    'payment_required' => true,
                    'enrollment_fee' => config('paymongo.enrollment_fee', 5000.00),
                    'vouchers_exhausted' => true
                ], 422);
            }
            
            // Verify payment exists and is paid
            $payment = \App\Models\Payment::where('id', $request->payment_id)
                ->where('user_id', $applicant->id)
                ->first();
            
            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'error' => 'Payment not found for this applicant'
                ], 422);
            }
            
            if ($payment->payment_status !== 'paid') {
                return response()->json([
                    'success' => false,
                    'error' => 'Payment has not been completed yet',
                    'payment_status' => $payment->payment_status
                ], 422);
            }
            
            // Payment verified, link it to the batch
            $payment->update(['batch_id' => $request->batch_id]);
        }
        
        $program = \App\Models\Program::find($batch->program_id);
        
        // Update applicant to student
        $applicant->update([
            'student_id' => $studentId,
            'role' => 'student',
            'application_status' => 'approved',
            'batch_id' => $request->batch_id,
            'voucher_eligibility' => $voucherStatus,
            'voucher_id' => $assignedVoucherId,
        ]);
        
        // Send approval email
        try {
            $applicantName = ucwords(strtolower($applicant->first_name)) . ' ' . ucwords(strtolower($applicant->last_name));
            $programName = $program ? $program->name : 'N/A';
            
            $emailBody = "Dear {$applicantName},\n\n";
            $emailBody .= "Congratulations! We are pleased to inform you that your application for the {$programName} program at SMI Institute Inc. has been APPROVED.\n\n";
            $emailBody .= "NEXT STEPS - ONSITE DOCUMENT VERIFICATION REQUIRED\n\n";
            $emailBody .= "To complete your enrollment, you are required to visit our office for document verification and enrollment confirmation. Please bring the following:\n\n";
            $emailBody .= "REQUIRED DOCUMENTS (Original and Photocopies):\n";
            $emailBody .= "✓ Valid Government-Issued ID\n";
            $emailBody .= "✓ Official Transcript of Records\n";
            $emailBody .= "✓ Diploma/Certificate of Completion\n";
            $emailBody .= "✓ Two (2) pieces of 2x2 ID Photos\n\n";
            $emailBody .= "OFFICE VISIT SCHEDULE:\n";
            $emailBody .= "Please visit our office within 3 WORKING DAYS from receipt of this email.\n\n";
            $emailBody .= "Office Hours:\n";
            $emailBody .= "• Monday to Friday: 8:00 AM - 5:00 PM\n";
            $emailBody .= "• Saturday & Sunday: CLOSED\n\n";
            $emailBody .= "IMPORTANT NOTE ON WORKING DAYS:\n";
            $emailBody .= "Saturdays and Sundays are NOT counted as working days.\n\n";
            $emailBody .= "Example: If you receive this email on Friday, your 3 working days are:\n";
            $emailBody .= "- Day 1: Monday\n";
            $emailBody .= "- Day 2: Tuesday\n";
            $emailBody .= "- Day 3: Wednesday\n\n";
            $emailBody .= "OFFICE LOCATION:\n";
            $emailBody .= "SMI Institute Inc.\n";
            $emailBody .= "1991 Wardley Bldg., San Juan St., Cor. Taft Ave.\n";
            $emailBody .= "Brgy. 36, Pasay City, Metro Manila\n\n";
            $emailBody .= "Contact Number: 09177990724\n\n";
            $emailBody .= "IMPORTANT REMINDERS:\n";
            $emailBody .= "1. Enrollment slots are limited and will be confirmed on a first-come, first-served basis\n";
            $emailBody .= "2. Training vouchers (if available) will be given on a first-come, first-served basis\n";
            $emailBody .= "3. Failure to visit within 3 working days may result in forfeiture of your slot\n";
            $emailBody .= "4. Please bring sufficient amount for enrollment fees and other charges (if self-funded)\n";
            $emailBody .= "5. Walk-in applicants are welcome, but scheduled appointments are prioritized\n\n";
            $emailBody .= "ENROLLMENT FEES:\n";
            $emailBody .= "Our staff will provide you with a detailed breakdown of fees during your visit. We accept cash and major credit/debit cards.\n\n";
            $emailBody .= "Payment may be waived if you qualify for available training vouchers (subject to availability and eligibility).\n\n";
            $emailBody .= "WHAT TO EXPECT DURING YOUR VISIT:\n";
            $emailBody .= "1. Document verification (15-20 minutes)\n";
            $emailBody .= "2. Interview with enrollment officer (10-15 minutes)\n";
            $emailBody .= "3. Voucher eligibility assessment (if applicable)\n";
            $emailBody .= "4. Payment processing and issuance of official receipt (for self-funded students)\n";
            $emailBody .= "5. Schedule assignment and batch confirmation\n";
            $emailBody .= "6. Orientation on LMS (Learning Management System) access\n\n";
            $emailBody .= "Once your enrollment is confirmed, you will receive:\n";
            $emailBody .= "• Official enrollment receipt\n";
            $emailBody .= "• Student ID number\n";
            $emailBody .= "• LMS login credentials\n";
            $emailBody .= "• Class schedule\n";
            $emailBody .= "• Training program guidelines\n\n";
            $emailBody .= "Should you have any questions or need to schedule a specific appointment time, please contact us at 09177990724 or reply to this email.\n\n";
            $emailBody .= "We look forward to welcoming you to the SMI Institute Inc. family!\n\n";
            $emailBody .= "Warm regards,\n\n";
            $emailBody .= "Enrollment Team\n";
            $emailBody .= "SMI Institute Inc.\n";
            $emailBody .= "TESDA-Accredited Training Center\n\n";
            $emailBody .= "---\n";
            $emailBody .= "This is an automated message. Please do not reply directly to this email.\n";
            $emailBody .= "For inquiries, contact: 09177990724";
            
            \Illuminate\Support\Facades\Mail::raw($emailBody, function ($message) use ($applicant) {
                $message->to($applicant->email)
                        ->subject('SMI Institute Inc. - Application Approved: Next Steps for Enrollment');
            });
        } catch (\Exception $e) {
            // Log error but don't fail the approval
            \Illuminate\Support\Facades\Log::error('Failed to send approval email: ' . $e->getMessage());
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Applicant approved and converted to student successfully',
            'voucher_consumed' => $voucherConsumed,
            'voucher_status' => $voucherStatus,
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
    
    // Get student's quiz results/attempts
    Route::get('/student/quiz-results', function (Request $request) {
        $user = $request->user();
        
        // Check if user is a student
        if ($user->role !== 'student') {
            return response()->json([
                'error' => 'Unauthorized. Only students can access this endpoint.'
            ], 403);
        }
        
        // Get all completed attempts for this student with quiz details
        $attempts = \App\Models\QuizAttempt::where('user_id', $user->id)
            ->where('status', 'completed')
            ->with(['quiz', 'answers.question'])
            ->orderBy('completed_at', 'desc')
            ->get();
        
        // Format the results
        $results = $attempts->map(function ($attempt) use ($user) {
            $quiz = $attempt->quiz;
            
            // Get batch and program info
            $batch = $quiz->batch_id ? \App\Models\Batch::where('batch_id', $quiz->batch_id)->first() : null;
            $program = $batch ? \App\Models\Program::find($batch->program_id) : null;
            
            return [
                'id' => $attempt->id,
                'quiz_id' => $quiz->id,
                'quiz_title' => $quiz->title,
                'quiz_description' => $quiz->description,
                'quiz_type' => $quiz->type,
                'course_title' => $program ? $program->title : 'N/A',
                'course_code' => $program ? ($program->code ?? $program->title) : 'N/A',
                'date_taken' => $attempt->completed_at->toDateString(),
                'time_taken' => $attempt->time_taken, // in seconds
                'total_marks' => $attempt->total_points,
                'obtained_marks' => $attempt->score,
                'passing_marks' => $quiz->passing_score,
                'percentage' => $attempt->percentage,
                'status' => $attempt->percentage >= $quiz->passing_score ? 'passed' : 'failed',
                'attempt_number' => $attempt->attempt_number,
                'max_attempts' => $quiz->retake_limit,
                'total_questions' => $quiz->questions()->count(),
                'correct_answers' => $attempt->answers()->where('is_correct', true)->count(),
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
                $headers = fgetcsv($file); // Skip header row
                
                $programData = [];
                $total = 0;
                $programName = '';
                
                while (($row = fgetcsv($file)) !== false) {
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
        $students = \App\Models\User::with(['batch.program', 'grades'])
            ->where('role', 'student')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get all programs for filter dropdown
        $programs = \App\Models\Program::select('id', 'title')->get();
        
        // Get all batches for filter dropdown
        $batches = \App\Models\Batch::select('batch_id')->get();

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
            ];
        });

        return response()->json([
            'success' => true,
            'students' => $formattedStudents,
            'programs' => $programs->map(fn($p) => ['id' => $p->id, 'name' => $p->title]),
            'batches' => $batches->map(fn($b) => ['id' => $b->batch_id, 'name' => $b->batch_id]),
            'total' => $formattedStudents->count(),
        ]);
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

