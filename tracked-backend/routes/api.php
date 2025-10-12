<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\BatchController;
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

// Admin authentication
// User management routes
Route::post('/users', [UserController::class, 'store']);

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

// Protected Routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Admin Routes
    Route::get('/applications', [ApplicationController::class, 'list']);
    
    // Program Routes
    Route::apiResource('programs', ProgramController::class);
    
    // Batch Routes
    Route::apiResource('batches', BatchController::class);
    Route::get('/batches/{id}/students', [BatchController::class, 'getEnrolledStudents']);
    
    // User Routes
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/stats', [UserController::class, 'getStats']);
    
    // Document Routes
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::post('/documents/upload', [DocumentController::class, 'upload']);
    Route::delete('/documents/{type}', [DocumentController::class, 'delete']);
    Route::get('/documents/{type}/view', [DocumentController::class, 'view']);
});
