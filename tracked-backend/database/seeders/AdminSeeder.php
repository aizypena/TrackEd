<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Delete all existing users (this will cascade to related records)
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        User::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // Create admin user with minimum required fields
        User::create([
            'first_name' => 'System',
            'last_name' => 'Administrator',
            'email' => 'admin@smi.edu.ph',
            'phone_number' => '9999999999',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'status' => 'active',
            'application_status' => 'pending',
            'address' => 'SMI Institute Inc., Philippines',
            'date_of_birth' => '1990-01-01',
            'gender' => 'other',
            'nationality' => 'filipino',
            'education_level' => 'college_graduate',
            'emergency_contact' => 'SMI Institute HR Department',
            'emergency_phone' => '9999999999'
        ]);

        $this->command->info('Admin user created successfully!');
        $this->command->info('Email: admin@smi.edu.ph');
        $this->command->info('Password: admin123');
    }
}
