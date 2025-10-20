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
            'gender' => 'required|in:male,female,other,prefer-not-to-say',
            'maritalStatus' => 'required|in:single,married,widowed,separated,divorced',
            'mobileNumber' => 'required|string|regex:/^9\d{9}$/|unique:users,phone_number',
            'education' => 'required|in:elementary,high-school,vocational,college-undergraduate,college-graduate,masters,doctorate',
            'school' => 'required|string|max:255',
            'courseProgram' => 'required|in:automotive-technology,electrical-installation,welding-fabrication,plumbing-technology,electronics-technology,hvac-technology,computer-programming,digital-marketing,culinary-arts,hospitality-management,healthcare-assistant,caregiving',
            'employmentStatus' => 'required|in:employed,unemployed,student,self-employed,retired,ofw',
            'occupation' => 'required|string|max:255',
            'emergencyContact' => 'required|string|max:255',
            'emergencyRelationship' => 'required|in:parent,sibling,spouse,child,relative,friend,guardian,other',
            'emergencyPhone' => 'required|string',
            'tesdaVoucherEligibility' => 'required|in:4ps-beneficiary,pwd,senior-citizen,solo-parent,ofw-dependent,displaced-worker,rebel-returnee,student,unemployed-graduate,currently-employed,not-eligible',
            'validId' => 'required|file|mimes:pdf,jpg,jpeg,png|max:25600', // 25MB
            'transcript' => 'required|file|mimes:pdf,jpg,jpeg,png|max:25600', // 25MB
            'resume' => 'nullable|file|mimes:pdf,doc,docx|max:25600', // 25MB
            'medicalCertificate' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:25600', // 25MB
        ], [
            'mobileNumber.regex' => 'Mobile number must be a valid Philippine mobile number (10 digits starting with 9)',
            'email.unique' => 'This email address is already registered',
            'mobileNumber.unique' => 'This mobile number is already registered',
            '*.max' => 'File size must not exceed 25MB',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Determine potential voucher eligibility based on category
            // Will be finalized at approval time when checking voucher availability
            $tesdaCategory = $request->tesdaVoucherEligibility;
            
            $eligibleCategories = [
                '4ps-beneficiary', 'pwd', 'senior-citizen', 'solo-parent', 
                'ofw-dependent', 'displaced-worker', 'rebel-returnee', 
                'student', 'unemployed-graduate'
            ];
            
            // Set initial eligibility status - will be confirmed at approval
            $initialVoucherStatus = in_array($tesdaCategory, $eligibleCategories) 
                ? 'pending'  // Potentially eligible, pending approval and voucher availability
                : 'not_eligible';  // Not in eligible category
            
            // Create user account first
            $user = User::create([
                'first_name' => $request->firstName,
                'last_name' => $request->lastName,
                'email' => $request->email,
                'phone_number' => $request->mobileNumber,
                'marital_status' => $request->maritalStatus,
                'password' => Hash::make('password123'), // Default password
                'role' => 'applicant',
                'status' => 'active',
                'application_status' => 'pending',
                'course_program' => $request->courseProgram,
                'voucher_eligibility' => $initialVoucherStatus,
                'voucher_id' => null,  // Will be assigned at approval if available
            ]);

            // Handle file uploads
            $validIdPath = null;
            $transcriptPath = null;
            $resumePath = null;
            $medicalCertificatePath = null;

            if ($request->hasFile('validId')) {
                $validIdPath = $request->file('validId')->store('applications/valid-ids', 'public');
            }

            if ($request->hasFile('transcript')) {
                $transcriptPath = $request->file('transcript')->store('applications/transcripts', 'public');
            }

            if ($request->hasFile('resume')) {
                $resumePath = $request->file('resume')->store('applications/resumes', 'public');
            }

            if ($request->hasFile('medicalCertificate')) {
                $medicalCertificatePath = $request->file('medicalCertificate')->store('applications/medical-certificates', 'public');
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
                'tesda_voucher_eligibility' => $request->tesdaVoucherEligibility,
                'valid_id_path' => $validIdPath,
                'transcript_path' => $transcriptPath,
                'resume_path' => $resumePath,
                'medical_certificate_path' => $medicalCertificatePath,
                'status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Application submitted successfully! You will receive an email with your login credentials.',
                'application_id' => $application->id,
                'user_id' => $user->id,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Application submission failed. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
