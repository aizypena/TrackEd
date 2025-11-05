<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Program;
use Illuminate\Support\Facades\Hash;

class PayMongoTestApplicantsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating 5 test applicants for PayMongo testing...');

        // Get Cookery NC II program (ID 8)
        $cookeryProgram = Program::find(8);
        
        if (!$cookeryProgram) {
            $this->command->error('Cookery NC II program (ID: 8) not found!');
            return;
        }

        $applicants = [
            [
                'first_name' => 'Marco',
                'last_name' => 'Villanueva',
                'email' => 'marco.villanueva@test.com',
                'phone_number' => '9271234501',
                'gender' => 'male',
                'date_of_birth' => '2000-01-10',
                'address' => '101 Sunrise Ave, Manila'
            ],
            [
                'first_name' => 'Angela',
                'last_name' => 'Domingo',
                'email' => 'angela.domingo@test.com',
                'phone_number' => '9281234502',
                'gender' => 'female',
                'date_of_birth' => '1999-03-25',
                'address' => '202 Moonlight St, Quezon City'
            ],
            [
                'first_name' => 'Rafael',
                'last_name' => 'Bautista',
                'email' => 'rafael.bautista@test.com',
                'phone_number' => '9291234503',
                'gender' => 'male',
                'date_of_birth' => '2001-07-14',
                'address' => '303 Starlight Rd, Makati'
            ],
            [
                'first_name' => 'Kristina',
                'last_name' => 'Alvarez',
                'email' => 'kristina.alvarez@test.com',
                'phone_number' => '9301234504',
                'gender' => 'female',
                'date_of_birth' => '2000-11-30',
                'address' => '404 Twilight Ln, Pasig'
            ],
            [
                'first_name' => 'Benjamin',
                'last_name' => 'Soriano',
                'email' => 'benjamin.soriano@test.com',
                'phone_number' => '9311234505',
                'gender' => 'male',
                'date_of_birth' => '1998-09-05',
                'address' => '505 Dawn Blvd, Taguig'
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
                'application_status' => 'approved',
                'voucher_eligible' => false,
                'batch_id' => null,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $this->command->info("✓ Created: {$applicantData['first_name']} {$applicantData['last_name']} ({$applicantData['email']})");
        }

        $this->command->info('');
        $this->command->info('✅ Successfully created 5 test applicants for PayMongo testing!');
        $this->command->info('');
        $this->command->info('Details:');
        $this->command->info('- Program: Cookery NC II');
        $this->command->info('- Status: APPROVED');
        $this->command->info('- Voucher Eligible: NO (ready for payment)');
        $this->command->info('- Password: password123');
        $this->command->info('');
        $this->command->info('Test Applicants:');
        foreach ($applicants as $applicant) {
            $this->command->info("  📧 {$applicant['first_name']} {$applicant['last_name']} - {$applicant['email']}");
        }
    }
}
