<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Laravel Database Configuration:\n";
echo "Database: " . config('database.connections.mysql.database') . "\n";
echo "Host: " . config('database.connections.mysql.host') . "\n";
echo "Username: " . config('database.connections.mysql.username') . "\n";

try {
    echo "\nTesting connection...\n";
    $result = DB::select('SELECT DATABASE() as current_db');
    echo "Connected to database: " . $result[0]->current_db . "\n";
    
    echo "\nUsers table query:\n";
    $users = DB::select('SELECT COUNT(*) as count FROM users');
    echo "Total users in Laravel DB: " . $users[0]->count . "\n";
    
    $adminUsers = DB::select("SELECT email, role FROM users WHERE email = 'admin2@example.com'");
    if (count($adminUsers) > 0) {
        echo "admin2@example.com found in Laravel DB - Role: " . $adminUsers[0]->role . "\n";
    } else {
        echo "admin2@example.com NOT found in Laravel DB\n";
    }
    
} catch (Exception $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}