<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;

class ApplicationController extends Controller
{
    /**
     * Submit a new application
     */
    public function submit(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'middleName' => 'nullable|string|max:255',
            'nationality' => 'required|string|max:255',
            'birthDate' => 'required|date',
            'address' => 'required|string',
            'placeOfBirth' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'gender' => 'required|in:male,female,other,prefer-not-to-say',
            'maritalStatus' => 'required|in:single,married,widowed,separated,divorced',
            'mobileNumber' => 'required|string|regex:/^9\d{9}$/|unique:users,phone_number',
            'education' => 'required|string|max:255',
            'school' => 'required|string|max:255',
            'courseProgram' => 'required|string|max:255',
            'employmentStatus' => 'required|in:employed,unemployed,student,self-employed,retired,ofw',
            'occupation' => 'required|string|max:255',
            'emergencyContact' => 'required|string|max:255',
            'emergencyRelationship' => 'required|in:parent,sibling,spouse,child,relative,friend,guardian,other',
            'emergencyPhone' => 'required|string|regex:/^9\d{9}$/',
            'validId' => 'required|file|mimes:pdf,jpg,jpeg,png|max:25600', // 25MB
            'transcript' => 'required|file|mimes:pdf,jpg,jpeg,png|max:25600', // 25MB
            'diploma' => 'required|file|mimes:pdf,jpg,jpeg,png|max:25600', // 25MB
            'passportPhoto' => 'required|file|mimes:jpg,jpeg,png|max:25600', // 25MB
        ], [
            'mobileNumber.regex' => 'Mobile number must be a valid Philippine mobile number (10 digits starting with 9)',
            'emergencyPhone.regex' => 'Emergency phone must be a valid Philippine mobile number (10 digits starting with 9)',
            'email.unique' => 'This email address is already registered',
            'mobileNumber.unique' => 'This mobile number is already registered',
            '*.max' => 'File size must not exceed 25MB',
        ]);

        if ($validator->fails()) {
            // Log validation failure
            DB::table('system_logs')->insert([
                'user_id' => null,
                'action' => 'application_validation_failed',
                'description' => 'Application submission failed validation for email: ' . $request->email,
                'log_level' => 'warning',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Create user account first
            $user = User::create([
                'first_name' => $request->firstName,
                'last_name' => $request->lastName,
                'email' => $request->email,
                'phone_number' => $request->mobileNumber,
                'marital_status' => $request->maritalStatus,
                'password' => Hash::make($request->password),
                'role' => 'applicant',
                'status' => 'active',
                'application_status' => 'pending',
                'course_program' => $request->courseProgram,
            ]);

            // Handle file uploads
            $validIdPath = null;
            $transcriptPath = null;
            $diplomaPath = null;
            $passportPhotoPath = null;

            if ($request->hasFile('validId')) {
                $validIdPath = $request->file('validId')->store('applications/valid-ids', 'public');
            }

            if ($request->hasFile('transcript')) {
                $transcriptPath = $request->file('transcript')->store('applications/transcripts', 'public');
            }

            if ($request->hasFile('diploma')) {
                $diplomaPath = $request->file('diploma')->store('applications/diplomas', 'public');
            }

            if ($request->hasFile('passportPhoto')) {
                $passportPhotoPath = $request->file('passportPhoto')->store('applications/passport-photos', 'public');
            }

            // Create application
            $application = Application::create([
                'user_id' => $user->id,
                'first_name' => $request->firstName,
                'last_name' => $request->lastName,
                'middle_name' => $request->middleName,
                'nationality' => $request->nationality,
                'birth_date' => $request->birthDate,
                'address' => $request->address,
                'place_of_birth' => $request->placeOfBirth,
                'email' => $request->email,
                'gender' => $request->gender,
                'mobile_number' => $request->mobileNumber,
                'education' => $request->education,
                'school' => $request->school,
                'course_program' => $request->courseProgram,
                'employment_status' => $request->employmentStatus,
                'occupation' => $request->occupation,
                'emergency_contact' => $request->emergencyContact,
                'emergency_relationship' => $request->emergencyRelationship,
                'emergency_phone' => $request->emergencyPhone,
                'valid_id_path' => $validIdPath,
                'transcript_path' => $transcriptPath,
                'diploma_path' => $diplomaPath,
                'passport_photo_path' => $passportPhotoPath,
                'status' => 'pending',
            ]);

            // Log successful application submission
            DB::table('system_logs')->insert([
                'user_id' => $user->id,
                'action' => 'application_submitted',
                'description' => 'New application submitted by: ' . $user->email . ' for program: ' . $request->courseProgram,
                'log_level' => 'info',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Application submitted successfully! You will receive an email with your login credentials.',
                'application_id' => $application->id,
                'user_id' => $user->id,
            ], 201);

        } catch (\Exception $e) {
            // Log application submission error
            DB::table('system_logs')->insert([
                'user_id' => null,
                'action' => 'application_submission_error',
                'description' => 'Application submission error for email: ' . $request->email . ' - Error: ' . $e->getMessage(),
                'log_level' => 'error',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Application submission failed. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
