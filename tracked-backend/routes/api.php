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
        
        // Update applicant to student
        $applicant->update([
            'student_id' => $studentId,
            'role' => 'student',
            'application_status' => 'approved',
            'batch_id' => $request->batch_id,
            'voucher_eligibility' => $voucherStatus,
            'voucher_id' => $assignedVoucherId,
        ]);
        
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
});
