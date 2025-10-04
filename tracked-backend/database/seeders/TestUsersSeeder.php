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

        // Create instructors (migration expects 'instructor')
        User::factory()->count(1)->create([
            'role' => 'instructor',
            'application_status' => 'approved',
            'status' => 'active'
        ]);

        // Create staff
        User::factory()->count(1)->create([
            'role' => 'staff',
            'application_status' => 'approved',
            'status' => 'active'
        ]);

        // Ensure an explicit administrator user exists (in addition to AdminSeeder)
        // This will only create a record if none exists with the admin email used by AdminSeeder
        if (!User::where('email', 'admin@smi.edu.ph')->exists()) {
            User::create([
                'first_name' => 'System',
                'last_name' => 'Administrator',
                'email' => 'admin@smi.edu.ph',
                'phone_number' => '9999999999',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'status' => 'active',
                'application_status' => 'pending',
            ]);
        }

        $this->command->info('Test users created successfully!');
    }
}