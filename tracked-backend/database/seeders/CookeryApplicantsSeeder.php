<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Batch;
use App\Models\Program;
use Illuminate\Support\Facades\Hash;

class CookeryApplicantsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get Cookery NC II program
        $cookeryProgram = Program::find(8);
        
        if (!$cookeryProgram) {
            $this->command->error('Cookery NC II program (ID: 8) not found!');
            return;
        }

        // Get the latest active batch
        $batch = Batch::where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$batch) {
            $this->command->warn('No active batch found. Applicants will be created without batch assignment.');
        }

        $this->command->info('Creating 10 test applicants for Cookery NC II...');

        $applicants = [
            [
                'first_name' => 'Carlos',
                'last_name' => 'Ramirez',
                'email' => 'carlos.ramirez@test.com',
                'phone_number' => '9171234567',
                'gender' => 'male',
                'date_of_birth' => '2000-03-15',
                'address' => '123 Main St, Manila',
                'application_status' => 'approved',
                'voucher_eligible' => false
            ],
            [
                'first_name' => 'Elena',
                'last_name' => 'Torres',
                'email' => 'elena.torres@test.com',
                'phone_number' => '9181234567',
                'gender' => 'female',
                'date_of_birth' => '1999-07-22',
                'address' => '456 Oak Ave, Quezon City',
                'application_status' => 'approved',
                'voucher_eligible' => false
            ],
            [
                'first_name' => 'Miguel',
                'last_name' => 'Santos',
                'email' => 'miguel.santos@test.com',
                'phone_number' => '9191234567',
                'gender' => 'male',
                'date_of_birth' => '2001-11-08',
                'address' => '789 Pine Rd, Makati',
                'application_status' => 'approved',
                'voucher_eligible' => false
            ],
            [
                'first_name' => 'Isabella',
                'last_name' => 'Cruz',
                'email' => 'isabella.cruz@test.com',
                'phone_number' => '9201234567',
                'gender' => 'female',
                'date_of_birth' => '2000-05-30',
                'address' => '321 Elm St, Pasig',
                'application_status' => 'approved',
                'voucher_eligible' => false
            ],
            [
                'first_name' => 'Diego',
                'last_name' => 'Fernandez',
                'email' => 'diego.fernandez@test.com',
                'phone_number' => '9211234567',
                'gender' => 'male',
                'date_of_birth' => '1998-12-25',
                'address' => '654 Maple Dr, Taguig',
                'application_status' => 'approved',
                'voucher_eligible' => false
            ],
            [
                'first_name' => 'Sofia',
                'last_name' => 'Lopez',
                'email' => 'sofia.lopez@test.com',
                'phone_number' => '9221234567',
                'gender' => 'female',
                'date_of_birth' => '2002-02-14',
                'address' => '987 Cedar Ln, Mandaluyong',
                'application_status' => 'approved',
                'voucher_eligible' => false
            ],
            [
                'first_name' => 'Gabriel',
                'last_name' => 'Reyes',
                'email' => 'gabriel.reyes@test.com',
                'phone_number' => '9231234567',
                'gender' => 'male',
                'date_of_birth' => '2001-09-03',
                'address' => '147 Birch St, Pasay',
                'application_status' => 'approved',
                'voucher_eligible' => false
            ],
            [
                'first_name' => 'Valentina',
                'last_name' => 'Garcia',
                'email' => 'valentina.garcia@test.com',
                'phone_number' => '9241234567',
                'gender' => 'female',
                'date_of_birth' => '2000-06-18',
                'address' => '258 Spruce Ave, Caloocan',
                'application_status' => 'approved',
                'voucher_eligible' => false
            ],
            [
                'first_name' => 'Lucas',
                'last_name' => 'Mendoza',
                'email' => 'lucas.mendoza@test.com',
                'phone_number' => '9251234567',
                'gender' => 'male',
                'date_of_birth' => '1999-04-27',
                'address' => '369 Willow Rd, Paranaque',
                'application_status' => 'approved',
                'voucher_eligible' => false
            ],
            [
                'first_name' => 'Camila',
                'last_name' => 'Morales',
                'email' => 'camila.morales@test.com',
                'phone_number' => '9261234567',
                'gender' => 'female',
                'date_of_birth' => '2001-08-12',
                'address' => '741 Aspen Ct, Las Pinas',
                'application_status' => 'approved',
                'voucher_eligible' => false
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
                'application_status' => $applicantData['application_status'],
                'voucher_eligible' => $applicantData['voucher_eligible'],
                'batch_id' => $batch ? $batch->batch_id : null,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $this->command->info("✓ Created applicant: {$applicantData['first_name']} {$applicantData['last_name']}");
        }

        $this->command->info('');
        $this->command->info('Successfully created 10 test applicants for Cookery NC II!');
        $this->command->info('All applicants:');
        $this->command->info('- Status: APPROVED');
        $this->command->info('- Voucher Eligible: NO (ready for payment testing)');
        $this->command->info('- Password: password123');
        $this->command->info('');
        $this->command->info('Emails:');
        foreach ($applicants as $applicant) {
            $this->command->info("  • {$applicant['email']}");
        }
    }
}
