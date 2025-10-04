<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Define users to create
$users = [
    [
        'email' => 'staff@example.com',
        'password' => 'Staff123!',
        'role' => 'staff',
        'first_name' => 'Staff',
        'last_name' => 'Member'
    ],
    [
        'email' => 'student@example.com',
        'password' => 'Student123!',
        'role' => 'student',
        'first_name' => 'Student',
        'last_name' => 'User'
    ],
    [
        'email' => 'applicant@example.com',
        'password' => 'Applicant123!',
        'role' => 'applicant',
        'first_name' => 'Applicant',
        'last_name' => 'User'
    ],
    [
        'email' => 'instructor@example.com',
        'password' => 'Instructor123!',
        'role' => 'instructor',
        'first_name' => 'Instructor',
        'last_name' => 'User'
    ]
];

echo "Creating users for each role...\n\n";

foreach ($users as $userData) {
    // Check if user already exists
    $existingUser = User::where('email', $userData['email'])->first();
    
    if ($existingUser) {
        echo "Updating existing user: {$userData['email']}\n";
        $user = $existingUser;
    } else {
        echo "Creating new user: {$userData['email']}\n";
        $user = new User();
    }
    
    // Set user data
    $user->email = $userData['email'];
    $user->password = Hash::make($userData['password']);
    $user->role = $userData['role'];
    $user->first_name = $userData['first_name'];
    $user->last_name = $userData['last_name'];
    $user->phone_number = '0123456789'; // Required field
    $user->status = 'active';
    $user->application_status = ($userData['role'] === 'applicant') ? 'pending' : 'approved';
    $user->save();
    
    echo "✓ {$userData['role']}: {$userData['email']} (password: {$userData['password']})\n";
}

echo "\n=== LOGIN CREDENTIALS ===\n";
foreach ($users as $userData) {
    echo "{$userData['role']}: {$userData['email']} / {$userData['password']}\n";
}

echo "\nAll users created successfully!\n";