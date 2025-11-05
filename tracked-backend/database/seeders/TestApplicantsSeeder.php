<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class TestApplicantsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        // Get available programs and batches
        $programs = DB::table('programs')->get();
        $batches = DB::table('batches')->get();

        if ($programs->isEmpty() || $batches->isEmpty()) {
            $this->command->error('Please create programs and batches first!');
            return;
        }

        $cookeryProgram = $programs->where('title', 'Cookery NC II')->first();
        $housekeepingProgram = $programs->where('title', 'Housekeeping NC II')->first();
        
        $batch = $batches->first();

        $applicants = [
            [
                'email' => 'juan.delacruz@test.com',
                'password' => Hash::make('password123'),
                'role' => 'applicant',
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'phone_number' => '9171234567',
                'gender' => 'male',
                'date_of_birth' => '1998-05-15',
                'place_of_birth' => 'Manila, Philippines',
                'nationality' => 'Filipino',
                'marital_status' => 'single',
                'address' => '123 Rizal Street, Brgy. San Juan, Manila, NCR 1000',
                'emergency_contact' => 'Maria Dela Cruz',
                'emergency_phone' => '9171234568',
                'emergency_relationship' => 'Mother',
                'education_level' => 'Senior High School',
                'institution_name' => 'Manila Senior High School',
                'graduation_year' => 2016,
                'course_program' => $cookeryProgram ? $cookeryProgram->id : '1',
                'application_status' => 'approved',
                'approved_at' => $now,
                'voucher_eligible' => false,
                'batch_id' => $batch->batch_id,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'email' => 'maria.santos@test.com',
                'password' => Hash::make('password123'),
                'role' => 'applicant',
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'phone_number' => '9182345678',
                'gender' => 'female',
                'date_of_birth' => '1999-08-20',
                'place_of_birth' => 'Quezon City, Philippines',
                'nationality' => 'Filipino',
                'marital_status' => 'single',
                'address' => '456 Quezon Avenue, Brgy. Commonwealth, Quezon City, NCR 1121',
                'emergency_contact' => 'Ana Santos',
                'emergency_phone' => '9182345679',
                'emergency_relationship' => 'Mother',
                'education_level' => 'Senior High School',
                'institution_name' => 'QC Senior High',
                'graduation_year' => 2017,
                'course_program' => $housekeepingProgram ? $housekeepingProgram->id : '2',
                'application_status' => 'approved',
                'approved_at' => $now,
                'voucher_eligible' => true,
                'batch_id' => $batch->batch_id,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'email' => 'pedro.reyes@test.com',
                'password' => Hash::make('password123'),
                'role' => 'applicant',
                'first_name' => 'Pedro',
                'last_name' => 'Reyes Jr.',
                'phone_number' => '9193456789',
                'gender' => 'male',
                'date_of_birth' => '1997-03-10',
                'place_of_birth' => 'Caloocan, Philippines',
                'nationality' => 'Filipino',
                'marital_status' => 'married',
                'address' => '789 Rizal Avenue, Brgy. 10, Caloocan, NCR 1400',
                'emergency_contact' => 'Rosa Reyes',
                'emergency_phone' => '9193456788',
                'emergency_relationship' => 'Mother',
                'education_level' => 'Senior High School',
                'institution_name' => 'Caloocan Senior High',
                'graduation_year' => 2015,
                'course_program' => $cookeryProgram ? $cookeryProgram->id : '1',
                'application_status' => 'approved',
                'approved_at' => $now,
                'voucher_eligible' => false,
                'batch_id' => $batch->batch_id,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'email' => 'ana.garcia@test.com',
                'password' => Hash::make('password123'),
                'role' => 'applicant',
                'first_name' => 'Ana',
                'last_name' => 'Garcia',
                'phone_number' => '9204567890',
                'gender' => 'female',
                'date_of_birth' => '2000-11-25',
                'place_of_birth' => 'Makati, Philippines',
                'nationality' => 'Filipino',
                'marital_status' => 'single',
                'address' => '321 Ayala Avenue, Brgy. Poblacion, Makati, NCR 1200',
                'emergency_contact' => 'Elena Garcia',
                'emergency_phone' => '9204567891',
                'emergency_relationship' => 'Mother',
                'education_level' => 'Senior High School',
                'institution_name' => 'Makati Senior High',
                'graduation_year' => 2018,
                'course_program' => $cookeryProgram ? $cookeryProgram->id : '1',
                'application_status' => 'pending',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'email' => 'rosa.mendoza@test.com',
                'password' => Hash::make('password123'),
                'role' => 'applicant',
                'first_name' => 'Rosa',
                'last_name' => 'Mendoza',
                'phone_number' => '9215678901',
                'gender' => 'female',
                'date_of_birth' => '1996-07-30',
                'place_of_birth' => 'Pasig, Philippines',
                'nationality' => 'Filipino',
                'marital_status' => 'single',
                'address' => '654 Ortigas Avenue, Brgy. Kapitolyo, Pasig, NCR 1600',
                'emergency_contact' => 'Luz Mendoza',
                'emergency_phone' => '9215678902',
                'emergency_relationship' => 'Mother',
                'education_level' => 'Senior High School',
                'institution_name' => 'Pasig Senior High',
                'graduation_year' => 2014,
                'course_program' => $housekeepingProgram ? $housekeepingProgram->id : '2',
                'application_status' => 'under_review',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($applicants as $applicant) {
            DB::table('users')->insert($applicant);
        }

        $this->command->info('✅ Successfully created 5 test applicants!');
        $this->command->info('');
        $this->command->info('📋 Test Applicants Created:');
        $this->command->info('1. Juan Dela Cruz (juan.delacruz@test.com) - APPROVED, Not Voucher Eligible - READY FOR PAYMENT');
        $this->command->info('2. Maria Santos (maria.santos@test.com) - APPROVED, Voucher Eligible - READY FOR ENROLLMENT');
        $this->command->info('3. Pedro Reyes Jr. (pedro.reyes@test.com) - APPROVED, Not Voucher Eligible - READY FOR PAYMENT');
        $this->command->info('4. Ana Garcia (ana.garcia@test.com) - PENDING - Can approve');
        $this->command->info('5. Rosa Mendoza (rosa.mendoza@test.com) - UNDER REVIEW - Can approve');
        $this->command->info('');
        $this->command->info('🔑 All passwords: password123');
    }
}
