<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin already exists
        $existingAdmin = User::where('email', 'admin@smi.edu.ph')
                            ->orWhere('role', 'admin')
                            ->first();

        if (!$existingAdmin) {
            User::create([
                'first_name' => 'System',
                'last_name' => 'Administrator',
                'email' => 'admin@smi.edu.ph',
                'phone_number' => '+63 9XX XXX XXXX',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'status' => 'active',
                'application_status' => null, // Not applicable for admin
                'email_verified_at' => now(),
                'profile_picture' => null,
                'address' => 'SMI Institute Inc., Philippines',
                'date_of_birth' => '1990-01-01',
                'gender' => 'other',
                'nationality' => 'filipino',
                'marital_status' => null,
                'education_level' => 'college_graduate',
                'field_of_study' => 'Information Technology',
                'institution_name' => 'SMI Institute Inc.',
                'graduation_year' => null,
                'gpa' => null,
                'computer_literacy' => 'advanced',
                'languages' => 'English, Filipino',
                'work_experience' => 'System Administration and Management',
                'career_goals' => 'Manage TrackEd system efficiently',
                'why_applying' => null, // Not applicable for admin
                'additional_info' => 'System Administrator for TrackEd Platform',
                'valid_id_path' => null,
                'transcript_path' => null,
                'diploma_path' => null,
                'passport_photo_path' => null,
                'application_submitted_at' => null,
                'application_reviewed_at' => null,
                'application_notes' => 'System Administrator Account',
                'emergency_contact' => 'SMI Institute HR Department',
                'emergency_phone' => '+63 XXX XXX XXXX',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->command->info('Admin user created successfully!');
            $this->command->info('Email: admin@smi.edu.ph');
            $this->command->info('Password: admin123');
        } else {
            $this->command->info('Admin user already exists!');
        }
    }
}