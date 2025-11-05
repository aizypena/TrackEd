<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Program;
use Illuminate\Support\Facades\Hash;

class PendingApplicantsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating 5 pending applicants...');

        // Get Cookery NC II program (ID 8)
        $cookeryProgram = Program::find(8);
        
        if (!$cookeryProgram) {
            $this->command->error('Cookery NC II program (ID: 8) not found!');
            return;
        }

        $applicants = [
            [
                'first_name' => 'Patricia',
                'last_name' => 'Rodriguez',
                'email' => 'patricia.rodriguez@test.com',
                'phone_number' => '9321234506',
                'gender' => 'female',
                'date_of_birth' => '2001-02-18',
                'address' => '606 Cedar Ave, Quezon City'
            ],
            [
                'first_name' => 'Roberto',
                'last_name' => 'Aquino',
                'email' => 'roberto.aquino@test.com',
                'phone_number' => '9331234507',
                'gender' => 'male',
                'date_of_birth' => '1999-06-22',
                'address' => '707 Pine St, Manila'
            ],
            [
                'first_name' => 'Jessica',
                'last_name' => 'Navarro',
                'email' => 'jessica.navarro@test.com',
                'phone_number' => '9341234508',
                'gender' => 'female',
                'date_of_birth' => '2000-09-15',
                'address' => '808 Oak Rd, Makati'
            ],
            [
                'first_name' => 'Andrew',
                'last_name' => 'Castillo',
                'email' => 'andrew.castillo@test.com',
                'phone_number' => '9351234509',
                'gender' => 'male',
                'date_of_birth' => '1998-12-03',
                'address' => '909 Maple Dr, Pasig'
            ],
            [
                'first_name' => 'Michelle',
                'last_name' => 'Salazar',
                'email' => 'michelle.salazar@test.com',
                'phone_number' => '9361234510',
                'gender' => 'female',
                'date_of_birth' => '2002-04-28',
                'address' => '1010 Elm Blvd, Taguig'
            ]
        ];

        foreach ($applicants as $applicantData) {
            User::create([
                'first_name' => $applicantData['first_name'],
                'last_name' => $applicantData['last_name'],
                'email' => $applicantData['email'],
                'password' => Hash::make('password123'),
                'phone_number' => $applicantData['phone_number'],
                'gender' => $applicantData['gender'],
                'date_of_birth' => $applicantData['date_of_birth'],
                'address' => $applicantData['address'],
                'role' => 'applicant',
                'course_program' => $cookeryProgram->id,
                'application_status' => 'pending',
                'voucher_eligible' => false,
                'batch_id' => null,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $this->command->info("✓ Created: {$applicantData['first_name']} {$applicantData['last_name']} ({$applicantData['email']})");
        }

        $this->command->info('');
        $this->command->info('✅ Successfully created 5 pending applicants!');
        $this->command->info('');
        $this->command->info('Details:');
        $this->command->info('- Program: Cookery NC II');
        $this->command->info('- Status: PENDING');
        $this->command->info('- Voucher Eligible: NO');
        $this->command->info('- Password: password123');
        $this->command->info('');
        $this->command->info('Pending Applicants:');
        foreach ($applicants as $applicant) {
            $this->command->info("  📋 {$applicant['first_name']} {$applicant['last_name']} - {$applicant['email']}");
        }
    }
}
