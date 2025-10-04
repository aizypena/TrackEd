<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = 'admin2@example.com';
$password = 'Admin123!';

echo "Testing login logic for: $email\n";

// Step 1: Find user by email
$user = User::where('email', $email)->first();
echo "User found: " . ($user ? 'YES' : 'NO') . "\n";

if ($user) {
    echo "User role: " . $user->role . "\n";
    
    // Step 2: Check if role matches admin route logic
    $adminUser = User::where('email', $email)->whereIn('role', ['admin', 'administrator'])->first();
    echo "Admin role check: " . ($adminUser ? 'PASS' : 'FAIL') . "\n";
    
    // Step 3: Test password
    $passwordMatch = Hash::check($password, $user->password);
    echo "Password check: " . ($passwordMatch ? 'MATCH' : 'NO_MATCH') . "\n";
    
    // Step 4: Full login logic
    if ($adminUser && $passwordMatch) {
        echo "LOGIN: SUCCESS\n";
    } else {
        echo "LOGIN: FAILED\n";
    }
} else {
    echo "Cannot test further - user not found\n";
}