<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\BatchController;
use App\Http\Controllers\VoucherController;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Application routes
Route::post('/application', [ApplicationController::class, 'submit']);

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
        return response()->json([
            'message' => 'Invalid credentials'
        ], 401);
    }

    // Delete existing tokens and create new one
    $user->tokens()->delete();
    $token = $user->createToken('admin-token')->plainTextToken;

    return response()->json([
        'token' => $token,
        'user' => $user
    ]);
});

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
        return response()->json([
            'message' => 'Invalid credentials. Please check your email and password.'
        ], 401);
    }

    // Check if user account is active
    if ($user->status !== 'active') {
        return response()->json([
            'message' => 'Your account is not active. Please contact the administrator.'
        ], 403);
    }

    // Delete existing tokens and create new one
    $user->tokens()->delete();
    $token = $user->createToken('trainer-token')->plainTextToken;

    return response()->json([
        'token' => $token,
        'user' => [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
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
        return response()->json([
            'message' => 'Invalid credentials. Please check your email and password.'
        ], 401);
    }

    // Check if user account is active
    if ($user->status !== 'active') {
        return response()->json([
            'message' => 'Your account is not active. Please contact the administrator.'
        ], 403);
    }

    // Delete existing tokens and create new one
    $user->tokens()->delete();
    $token = $user->createToken('staff-token')->plainTextToken;

    return response()->json([
        'token' => $token,
        'user' => [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
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
        return response()->json([
            'message' => 'Invalid credentials. Please check your email and password.'
        ], 401);
    }

    // Check if user account is active
    if ($user->status !== 'active') {
        return response()->json([
            'message' => 'Your account is not active. Please contact the administrator.'
        ], 403);
    }

    // Delete existing tokens and create new one
    $user->tokens()->delete();
    $token = $user->createToken('student-token')->plainTextToken;

    return response()->json([
        'token' => $token,
        'user' => [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
        ]
    ]);
});

// Protected Routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Admin Routes
    Route::get('/admin/dashboard-stats', function (Request $request) {
        // Query users with role 'applicant'
        $totalApplicants = \App\Models\User::where('role', 'applicant')->count();
        $activeApplications = \App\Models\User::where('role', 'applicant')->where('status', 'active')->count();
        $approvedApplications = \App\Models\User::where('role', 'applicant')->where('application_status', 'approved')->count();
        $pendingApplications = \App\Models\User::where('role', 'applicant')->where('application_status', 'pending')->count();
        $rejectedApplications = \App\Models\User::where('role', 'applicant')->where('application_status', 'rejected')->count();
        
        return response()->json([
            'totalApplicants' => $totalApplicants,
            'activeApplications' => $activeApplications,
            'approvedApplications' => $approvedApplications,
            'pendingApplications' => $pendingApplications,
            'rejectedApplications' => $rejectedApplications,
            'waitlistedApplicants' => 0, // Add logic if you have waitlisted status
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
            ->select('programs.id', 'programs.name', 'programs.code')
            ->distinct()
            ->get();
        
        return response()->json([
            'programs' => $programs
        ]);
    });
    
    // Staff Routes
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
    
    // Program Routes
    Route::apiResource('programs', ProgramController::class);
    
    // Batch Routes
    Route::apiResource('batches', BatchController::class);
    Route::get('/batches/{id}/students', [BatchController::class, 'getEnrolledStudents']);
    
    // Voucher Routes
    Route::apiResource('vouchers', VoucherController::class);
    
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
});
