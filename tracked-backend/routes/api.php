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

    // Admin Applications Routes
    Route::get('/admin/applications', function (Request $request) {
        // Get all applicants (users with role 'applicant')
        $applications = \App\Models\User::where('role', 'applicant')
            ->orderBy('created_at', 'desc')
            ->select('id', 'first_name', 'last_name', 'email', 'phone_number', 'course_program', 'application_status', 'status', 'created_at', 'valid_id_path', 'transcript_path', 'diploma_path', 'passport_photo_path')
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
                    $formatted = ucwords($formatted);
                    $formatted = preg_replace('/\bNc\b/', 'NC', $formatted);
                    $formatted = preg_replace('/\bIi\b/', 'II', $formatted);
                    $formatted = preg_replace('/\bIii\b/', 'III', $formatted);
                    $formatted = preg_replace('/\bIv\b/', 'IV', $formatted);
                    $app->course_program_formatted = $formatted;
                }
            } else {
                $app->course_program_formatted = 'Not specified';
            }
            $app->course_program = $app->course_program_formatted;
            $app->phone = $app->phone_number;
            return $app;
        });
        
        return response()->json([
            'applications' => $applications
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
            ->select('programs.id', 'programs.name', 'programs.code')
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

    // Get single applicant details
    Route::get('/staff/applicants/{id}', function (Request $request, $id) {
        $applicant = \App\Models\User::where('role', 'applicant')
            ->where('id', $id)
            ->first();
        
        if (!$applicant) {
            return response()->json(['error' => 'Applicant not found'], 404);
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
            'applicant' => $applicant
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
        
        if (!$applicant) {
            return response()->json(['error' => 'Applicant not found'], 404);
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
            'batch_id' => 'required|exists:batches,batch_id'
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
            ->whereIn('status', ['pending', 'issued'])
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
            // No vouchers available - mark as not eligible
            $voucherStatus = 'not_eligible';
        }
        
        // Get batch details for email
        $batch = \App\Models\Batch::where('batch_id', $request->batch_id)->first();
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
});
