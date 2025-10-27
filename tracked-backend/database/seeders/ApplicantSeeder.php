<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ApplicantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $applicants = [
            [
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'email' => 'maria.santos@example.com',
                'phone_number' => '9171234567',
                'address' => '123 Rizal Street, Manila',
                'date_of_birth' => '2000-05-15',
                'gender' => 'female',
                'course_program' => '1', // Bartending NC II
                'emergency_contact' => 'Juan Santos',
                'emergency_phone' => '9181234567',
                'emergency_relationship' => 'Father',
            ],
            [
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'email' => 'juan.delacruz@example.com',
                'phone_number' => '9171234568',
                'address' => '456 Bonifacio Avenue, Quezon City',
                'date_of_birth' => '1999-08-20',
                'gender' => 'male',
                'course_program' => '2', // Barista Training NC II
                'emergency_contact' => 'Rosa Dela Cruz',
                'emergency_phone' => '9181234568',
                'emergency_relationship' => 'Mother',
            ],
            [
                'first_name' => 'Ana',
                'last_name' => 'Reyes',
                'email' => 'ana.reyes@example.com',
                'phone_number' => '9171234569',
                'address' => '789 Luna Street, Makati City',
                'date_of_birth' => '2001-03-12',
                'gender' => 'female',
                'course_program' => '3', // Housekeeping NC II
                'emergency_contact' => 'Pedro Reyes',
                'emergency_phone' => '9181234569',
                'emergency_relationship' => 'Father',
            ],
            [
                'first_name' => 'Carlos',
                'last_name' => 'Garcia',
                'email' => 'carlos.garcia@example.com',
                'phone_number' => '9171234570',
                'address' => '321 Mabini Street, Pasig City',
                'date_of_birth' => '2000-11-30',
                'gender' => 'male',
                'course_program' => '4', // Food and Beverage Services NC II
                'emergency_contact' => 'Linda Garcia',
                'emergency_phone' => '9181234570',
                'emergency_relationship' => 'Mother',
            ],
            [
                'first_name' => 'Isabel',
                'last_name' => 'Mendoza',
                'email' => 'isabel.mendoza@example.com',
                'phone_number' => '9171234571',
                'address' => '654 Aguinaldo Street, Taguig City',
                'date_of_birth' => '1998-07-25',
                'gender' => 'female',
                'course_program' => '5', // Bread and Pastry Production NC II
                'emergency_contact' => 'Ricardo Mendoza',
                'emergency_phone' => '9181234571',
                'emergency_relationship' => 'Father',
            ],
            [
                'first_name' => 'Miguel',
                'last_name' => 'Torres',
                'email' => 'miguel.torres@example.com',
                'phone_number' => '9171234572',
                'address' => '987 Del Pilar Street, Mandaluyong City',
                'date_of_birth' => '2002-01-18',
                'gender' => 'male',
                'course_program' => '6', // Events Management NC III
                'emergency_contact' => 'Carmen Torres',
                'emergency_phone' => '9181234572',
                'emergency_relationship' => 'Mother',
            ],
            [
                'first_name' => 'Sofia',
                'last_name' => 'Ramos',
                'email' => 'sofia.ramos@example.com',
                'phone_number' => '9171234573',
                'address' => '147 Roxas Boulevard, Parañaque City',
                'date_of_birth' => '1999-12-05',
                'gender' => 'female',
                'course_program' => '7', // Chef\'s Catering Services NC II
                'emergency_contact' => 'Antonio Ramos',
                'emergency_phone' => '9181234573',
                'emergency_relationship' => 'Father',
            ],
            [
                'first_name' => 'Rafael',
                'last_name' => 'Cruz',
                'email' => 'rafael.cruz@example.com',
                'phone_number' => '9171234574',
                'address' => '258 EDSA, Caloocan City',
                'date_of_birth' => '2001-09-14',
                'gender' => 'male',
                'course_program' => '8', // Cookery NC II
                'emergency_contact' => 'Elena Cruz',
                'emergency_phone' => '9181234574',
                'emergency_relationship' => 'Mother',
            ],
            [
                'first_name' => 'Katrina',
                'last_name' => 'Lopez',
                'email' => 'katrina.lopez@example.com',
                'phone_number' => '9171234575',
                'address' => '369 Quezon Avenue, Quezon City',
                'date_of_birth' => '2000-04-22',
                'gender' => 'female',
                'course_program' => '1', // Bartending NC II
                'emergency_contact' => 'Roberto Lopez',
                'emergency_phone' => '9181234575',
                'emergency_relationship' => 'Father',
            ],
            [
                'first_name' => 'Daniel',
                'last_name' => 'Bautista',
                'email' => 'daniel.bautista@example.com',
                'phone_number' => '9171234576',
                'address' => '741 Commonwealth Avenue, Quezon City',
                'date_of_birth' => '1999-06-08',
                'gender' => 'male',
                'course_program' => '2', // Barista Training NC II
                'emergency_contact' => 'Marissa Bautista',
                'emergency_phone' => '9181234576',
                'emergency_relationship' => 'Mother',
            ],
        ];

        foreach ($applicants as $applicantData) {
            User::create(array_merge($applicantData, [
                'password' => Hash::make('password123'),
                'role' => 'applicant',
                'status' => 'active',
                'application_status' => 'pending',
            ]));
        }

        $this->command->info('10 applicant users created successfully!');
    }
}
