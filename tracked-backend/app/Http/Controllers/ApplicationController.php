<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use App\Mail\ApplicationSubmittedNotification;

class ApplicationController extends Controller
{
    public function submit(Request $request)
    {
        try {
            // Debug: Log all request data
            Log::info('Application submission data:', $request->all());
            
            // Validate the request
            $validated = $request->validate([
                'firstName' => 'required|string|max:255',
                'lastName' => 'required|string|max:255',
                'middleName' => 'nullable|string|max:255',
                'email' => 'required|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'mobileNumber' => 'required|string|max:20',
                'birthDate' => 'required|date',
                'gender' => 'required|in:male,female,other',
                'maritalStatus' => 'nullable|in:single,married,widowed,separated,divorced',
                'address' => 'required|string',
                'placeOfBirth' => 'nullable|string|max:255',
                'nationality' => 'required|string|max:255',
                'emergencyContact' => 'required|string|max:255',
                'emergencyRelationship' => 'nullable|string|max:255',
                'emergencyPhone' => 'required|string|max:20',
                
                // Education fields
                'education' => 'required|string|max:255',
                'school' => 'required|string|max:255',
                'courseProgram' => 'required|string|max:255',
                
                // Additional info
                'employmentStatus' => 'nullable|string|max:255',
                'occupation' => 'nullable|string|max:255',
                
                // Documents
                'validId' => 'required|file|mimes:pdf,jpg,jpeg,png|max:25600',
                'transcript' => 'required|file|mimes:pdf,jpg,jpeg,png|max:25600',
                'diploma' => 'required|file|mimes:pdf,jpg,jpeg,png|max:25600',
                'passportPhoto' => 'required|file|mimes:jpg,jpeg,png|max:25600',
            ]);
            
            // Determine voucher eligibility and waitlist status based on available vouchers
            $programId = $validated['courseProgram'];
            $voucherEligible = 0; // Default: not eligible
            $isWaitlisted = false;
            
            // Get all batches for this program
            $batches = \App\Models\Batch::where('program_id', $programId)
                ->whereIn('status', ['active', 'ongoing'])
                ->get();
            
            if ($batches->isEmpty()) {
                // No batches available - waitlist
                $isWaitlisted = true;
                $voucherEligible = 2; // Waitlisted
            } else {
                // Check for available vouchers across all batches
                $totalAvailableVouchers = 0;
                
                foreach ($batches as $batch) {
                    // Get vouchers for this batch
                    $vouchers = DB::table('vouchers')
                        ->where('batch_id', $batch->batch_id)
                        ->whereIn('status', ['active', 'pending'])
                        ->get();
                    
                    foreach ($vouchers as $voucher) {
                        $available = $voucher->quantity - $voucher->used_count;
                        if ($available > 0) {
                            $totalAvailableVouchers += $available;
                        }
                    }
                }
                
                // Set eligibility based on voucher availability
                if ($totalAvailableVouchers > 0) {
                    $voucherEligible = 1; // Eligible - vouchers available
                    $isWaitlisted = false;
                } else {
                    // No vouchers available - waitlist
                    $voucherEligible = 2; // Waitlisted - no vouchers
                    $isWaitlisted = true;
                }
            }

            // Check if user with this email already exists
            $existingUser = User::where('email', $validated['email'])->first();
            if ($existingUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'An application with this email already exists.',
                    'errors' => ['email' => ['This email is already registered.']]
                ], 422);
            }

            // Handle file uploads
            $documentPaths = [];
            $documentTypes = ['validId', 'transcript', 'diploma', 'passportPhoto'];
            
            Log::info('Checking for uploaded files', [
                'has_validId' => $request->hasFile('validId'),
                'has_transcript' => $request->hasFile('transcript'),
                'has_diploma' => $request->hasFile('diploma'),
                'has_passportPhoto' => $request->hasFile('passportPhoto'),
            ]);
            
            foreach ($documentTypes as $docType) {
                if ($request->hasFile($docType)) {
                    $file = $request->file($docType);
                    $directory = "applications/documents/{$docType}";
                    
                    // Store the file
                    $path = $file->store($directory, 'public');
                    $documentPaths[$docType . '_path'] = $path;
                    
                    Log::info("Uploaded {$docType}", [
                        'path' => $path,
                        'size' => $file->getSize(),
                        'mime' => $file->getMimeType()
                    ]);
                } else {
                    Log::warning("File {$docType} not found in request");
                }
            }
            
            Log::info('Document paths to be saved', $documentPaths);

            // Log the exact data being sent to User::create()
            $userData = [
                'first_name' => $validated['firstName'],
                'last_name' => $validated['lastName'],
                'middle_name' => $validated['middleName'] ?? null,
                'email' => $validated['email'],
                'phone_number' => $validated['mobileNumber'],
                'password' => bcrypt($validated['password']),
                'role' => 'applicant',
                'status' => 'active',
                'application_status' => 'pending', // Always set to pending; waitlist status tracked via voucher_eligible
                'voucher_eligible' => $voucherEligible,
                'date_of_birth' => $validated['birthDate'],
                'place_of_birth' => $validated['placeOfBirth'] ?? null,
                'gender' => $validated['gender'],
                'marital_status' => $validated['maritalStatus'] ?? null,
                'address' => $validated['address'],
                'nationality' => $validated['nationality'],
                'emergency_contact' => $validated['emergencyContact'],
                'emergency_relationship' => $validated['emergencyRelationship'] ?? null,
                'emergency_phone' => $validated['emergencyPhone'],
                'education_level' => $validated['education'],
                'institution_name' => $validated['school'],
                'course_program' => $validated['courseProgram'],
                'employment_status' => $validated['employmentStatus'] ?? null,
                'occupation' => $validated['occupation'] ?? null,
                'valid_id_path' => $documentPaths['validId_path'] ?? null,
                'transcript_path' => $documentPaths['transcript_path'] ?? null,
                'diploma_path' => $documentPaths['diploma_path'] ?? null,
                'passport_photo_path' => $documentPaths['passportPhoto_path'] ?? null,
                'application_submitted_at' => now(),
            ];
            
            Log::info('Attempting to create user with data:', array_keys($userData));

            // Create user with application data
            $user = User::create($userData);

            // Send application confirmation email
            try {
                $program = \App\Models\Program::find($validated['courseProgram']);
                $programName = $program ? $program->title : 'Unknown Program';
                
                Mail::to($user->email)->send(new ApplicationSubmittedNotification($user, $programName));
                
                Log::info('Application submitted email sent', [
                    'applicant_id' => $user->id,
                    'applicant_email' => $user->email,
                    'program' => $programName
                ]);
            } catch (\Exception $mailError) {
                // Don't fail application submission if email fails
                Log::error('Failed to send application submitted email', [
                    'applicant_id' => $user->id,
                    'applicant_email' => $user->email,
                    'error' => $mailError->getMessage()
                ]);
            }

            // Log successful application submission
            $eligibilityStatus = $voucherEligible === 1 ? 'eligible (vouchers available)' : 
                                ($voucherEligible === 2 ? 'waitlisted (no vouchers available)' : 'not eligible');
            $statusMessage = $isWaitlisted ? "waitlisted - {$eligibilityStatus}" : "pending - {$eligibilityStatus}";
            DB::table('system_logs')->insert([
                'user_id' => $user->id,
                'action' => 'application_submitted',
                'description' => 'New application submitted by: ' . $user->email . ' for program: ' . $validated['courseProgram'] . ' - Status: ' . $statusMessage,
                'log_level' => 'info',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Application submitted successfully!',
                'data' => [
                    'user_id' => $user->id,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'application_status' => $user->application_status,
                    'submitted_at' => $user->application_submitted_at,
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log validation failure
            DB::table('system_logs')->insert([
                'user_id' => null,
                'action' => 'application_validation_failed',
                'description' => 'Application submission failed validation for email: ' . ($request->email ?? 'unknown'),
                'log_level' => 'warning',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            // Log application submission error
            DB::table('system_logs')->insert([
                'user_id' => null,
                'action' => 'application_submission_error',
                'description' => 'Application submission error for email: ' . ($request->email ?? 'unknown') . ' - Error: ' . $e->getMessage(),
                'log_level' => 'error',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
            ]);
            
            // Clean up uploaded files if user creation failed
            if (isset($documentPaths)) {
                foreach ($documentPaths as $path) {
                    if ($path && Storage::disk('public')->exists($path)) {
                        Storage::disk('public')->delete($path);
                    }
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing your application. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function list(Request $request)
    {
        // Show all users with role 'applicant' as applications.
        $applications = User::where('role', 'applicant')->orderByDesc('application_submitted_at')->get();
        $data = $applications->map(function($user) {
            return [
                'id' => $user->id,
                'applicant_name' => $user->first_name . ' ' . $user->last_name,
                'program' => $user->course_program ?? 'N/A',
                'status' => $user->application_status ?? $user->status,
                'submitted_at' => $user->application_submitted_at,
                'email' => $user->email,
            ];
        });
        return response()->json(['success' => true, 'data' => $data]);
    }

}
