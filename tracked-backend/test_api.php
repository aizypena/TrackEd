<?php

use Illuminate\Http\Request;
use App\Http\Controllers\Api\UserController;

// Test the UserController API
$controller = new UserController();
$request = new Request();

echo "Testing UserController::index()\n";
echo "=================================\n";

$response = $controller->index($request);
$data = json_decode($response->getContent(), true);

echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";
echo "Total Users: " . count($data['data']) . "\n";
echo "Pagination Total: " . $data['pagination']['total'] . "\n";

echo "\nFirst 3 users:\n";
foreach (array_slice($data['data'], 0, 3) as $user) {
    echo "- {$user['name']} ({$user['email']}) - {$user['role']}\n";
}

echo "\n\nTesting UserController::stats()\n";
echo "================================\n";

$statsResponse = $controller->stats();
$statsData = json_decode($statsResponse->getContent(), true);

echo "Total Users: " . $statsData['stats']['total_users'] . "\n";
echo "Active Users: " . $statsData['stats']['active_users'] . "\n";
echo "Pending Users: " . $statsData['stats']['pending_users'] . "\n";
echo "Students: " . $statsData['stats']['students'] . "\n";

echo "\nTest completed successfully!\n";