<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\ApplicationController;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Admin authentication
Route::post('/admin/login', function (Request $request) {
    $request->validate([
        'email' => 'required|string',
        'password' => 'required|string',
    ]);

    // Find admin user (check both email and username formats)
    $admin = User::where('role', 'admin')
                 ->where(function($query) use ($request) {
                     $query->where('email', $request->email)
                           ->orWhere('email', 'admin'); // Support admin username
                 })
                 ->first();

    // Check if admin exists and password is correct
    if (!$admin || !Hash::check($request->password, $admin->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials'
        ], 401);
    }

    // Create token for admin
    $token = $admin->createToken('admin-token')->plainTextToken;

    return response()->json([
        'success' => true,
        'message' => 'Login successful',
        'token' => $token,
        'admin' => [
            'id' => $admin->id,
            'email' => $admin->email,
            'name' => $admin->first_name . ' ' . $admin->last_name,
            'role' => $admin->role
        ]
    ]);
});
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

// User management routes (admin only)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/users', [App\Http\Controllers\Api\UserController::class, 'index']);
    Route::get('/users/stats', [App\Http\Controllers\Api\UserController::class, 'stats']);
    Route::get('/users/{user}', [App\Http\Controllers\Api\UserController::class, 'show']);
    Route::put('/users/{user}', [App\Http\Controllers\Api\UserController::class, 'update']);
    Route::delete('/users/{user}', [App\Http\Controllers\Api\UserController::class, 'destroy']);
});

// Application routes
Route::post('/applications/submit', [ApplicationController::class, 'submit']);
Route::middleware(['auth:sanctum'])->get('/applications', [ApplicationController::class, 'list']);
