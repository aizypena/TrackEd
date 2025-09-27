<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Create applicants
        User::factory()->count(3)->create([
            'role' => 'applicant',
            'application_status' => 'pending',
            'status' => 'active'
        ]);

        // Create students
        User::factory()->count(2)->create([
            'role' => 'student',
            'application_status' => 'approved',
            'status' => 'active'
        ]);

        // Create trainers
        User::factory()->count(1)->create([
            'role' => 'trainer',
            'application_status' => 'approved',
            'status' => 'active'
        ]);

        // Create staff
        User::factory()->count(1)->create([
            'role' => 'staff',
            'application_status' => 'approved',
            'status' => 'active'
        ]);

        $this->command->info('Test users created successfully!');
    }
}