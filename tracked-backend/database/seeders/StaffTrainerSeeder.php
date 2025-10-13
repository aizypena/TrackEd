<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StaffTrainerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test staff user with known credentials
        if (!User::where('email', 'staff@smi.edu.ph')->exists()) {
            User::create([
                'first_name' => 'Test',
                'last_name' => 'Staff',
                'email' => 'staff@smi.edu.ph',
                'phone_number' => '0912345678',
                'password' => Hash::make('staff123'),
                'role' => 'staff',
                'status' => 'active',
                'application_status' => 'approved',
            ]);
            $this->command->info('Staff user created: staff@smi.edu.ph / staff123');
        }

        // Create a test trainer user with known credentials
        if (!User::where('email', 'trainer@smi.edu.ph')->exists()) {
            User::create([
                'first_name' => 'Test',
                'last_name' => 'Trainer',
                'email' => 'trainer@smi.edu.ph',
                'phone_number' => '0912345679',
                'password' => Hash::make('trainer123'),
                'role' => 'trainer',
                'status' => 'active',
                'application_status' => 'approved',
            ]);
            $this->command->info('Trainer user created: trainer@smi.edu.ph / trainer123');
        }

        // Create a test student user with known credentials
        if (!User::where('email', 'student@smi.edu.ph')->exists()) {
            User::create([
                'first_name' => 'Test',
                'last_name' => 'Student',
                'email' => 'student@smi.edu.ph',
                'phone_number' => '0912345680',
                'password' => Hash::make('student123'),
                'role' => 'student',
                'status' => 'active',
                'application_status' => 'approved',
            ]);
            $this->command->info('Student user created: student@smi.edu.ph / student123');
        }

        $this->command->info('Staff, Trainer, and Student test users created successfully!');
    }
}
