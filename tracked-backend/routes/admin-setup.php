<?php

use Illuminate\Support\Facades\Route;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

Route::get('/create-admin', function () {
    try {
        // Check if admin already exists
        $existingAdmin = User::where('email', 'admin@smi.edu.ph')->first();
        
        if ($existingAdmin) {
            return response()->json([
                'success' => true,
                'message' => 'Admin user already exists',
                'admin' => [
                    'email' => $existingAdmin->email,
                    'name' => $existingAdmin->first_name . ' ' . $existingAdmin->last_name,
                    'role' => $existingAdmin->role
                ]
            ]);
        }

        // Create new admin user
        $admin = User::create([
            'first_name' => 'System',
            'last_name' => 'Administrator',
            'email' => 'admin@smi.edu.ph',
            'phone_number' => '9123456789',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'status' => 'active',
            'application_status' => null,
            'email_verified_at' => now(),
            'nationality' => 'filipino',
            'gender' => 'other',
            'address' => 'SMI Institute Inc., Philippines',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Admin user created successfully!',
            'admin' => [
                'id' => $admin->id,
                'email' => $admin->email,
                'name' => $admin->first_name . ' ' . $admin->last_name,
                'role' => $admin->role
            ],
            'credentials' => [
                'email' => 'admin@smi.edu.ph',
                'password' => 'admin123'
            ]
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error creating admin user: ' . $e->getMessage()
        ], 500);
    }
});