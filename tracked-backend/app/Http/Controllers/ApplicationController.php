<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Application;
use App\Models\Course;
use App\Models\Role;
use App\Models\DocumentUpload;

class ApplicationController extends Controller
{
    public function index()
    {
        $applications = Application::with(['user', 'course', 'documentUploads'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $applications
        ]);
    }

    public function show($id)
    {
        $application = Application::with(['user', 'course', 'documentUploads'])
            ->findOrFail($id);
            
        return response()->json([
            'success' => true,
            'data' => $application
        ]);
    }

    public function store(Request $request)
    {
        try {
            // Map frontend course program values to database course codes
            $courseProgramMapping = [
                'barista-nc-ii' => 'BARISTA-NC2',
                'bartending-nc-ii' => 'BARTEND-NC2',
                'bread-pastry-production-nc-ii' => 'BREAD-PASTRY-NC2',
                'food-beverage-services-nc-ii' => 'FOOD-BEV-NC2',
                'housekeeping-nc-ii' => 'HOUSEKEEP-NC2',
                'events-management-nc-iii' => 'EVENTS-MGT-NC3',
                'ships-catering-services-nc-ii' => 'SHIPS-CATER-NC2',
                'cookery-nc-ii' => 'COOKERY-NC2'
            ];

            // Validate the request
            $validated = $request->validate([
                'firstName' => 'required|string|max:255',
                'lastName' => 'required|string|max:255',
                'middleName' => 'nullable|string|max:255',
                'nationality' => 'required|string|max:255',
                'birthDate' => 'required|date',
                'address' => 'required|string',
                'placeOfBirth' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email',
                'gender' => 'required|in:male,female',
                'mobileNumber' => 'required|string|max:20',
                'education' => 'required|string|max:255',
                'school' => 'required|string|max:255',
                'courseProgram' => 'required|string',
                'employmentStatus' => 'required|string|max:255',
                'occupation' => 'required|string|max:255',
                'emergencyContact' => 'required|string|max:255',
                'emergencyRelationship' => 'required|string|max:255',
                'emergencyPhone' => 'required|string|max:20',
                'tesdaVoucherEligibility' => 'required|string|max:255',
                'validId' => 'required|file|mimes:pdf,jpg,jpeg,png|max:25600',
                'transcript' => 'required|file|mimes:pdf,jpg,jpeg,png|max:25600',
                'diploma' => 'required|file|mimes:pdf,jpg,jpeg,png|max:25600',
                'passportPhoto' => 'required|file|mimes:jpg,jpeg,png|max:25600',
            ]);

            // Get the course code from mapping
            $courseCode = $courseProgramMapping[$validated['courseProgram']] ?? null;
            
            if (!$courseCode) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid course program selected',
                    'errors' => ['courseProgram' => ['Please select a valid course program']]
                ], 422);
            }

            // Find the course in the database
            $course = Course::where('code', $courseCode)->first();
            
            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course not found in database',
                    'errors' => ['courseProgram' => ['Selected course is not available']]
                ], 422);
            }

            // Start database transaction
            DB::beginTransaction();

            try {
                // Get the student role
                $studentRole = Role::where('name', 'student')->first();
                if (!$studentRole) {
                    throw new \Exception('Student role not found');
                }

                // Create user record in USERS table
                $user = User::create([
                    'role_id' => $studentRole->id,
                    'first_name' => $validated['firstName'],
                    'last_name' => $validated['lastName'],
                    'middle_name' => $validated['middleName'],
                    'email' => $validated['email'],
                    'password' => bcrypt('temporary_password_123'),
                    'gender' => $validated['gender'],
                    'birth_date' => $validated['birthDate'],
                    'birth_place' => $validated['placeOfBirth'],
                    'nationality' => $validated['nationality'],
                    'address' => $validated['address'],
                    'mobile_number' => $validated['mobileNumber'],
                    'emergency_contact_name' => $validated['emergencyContact'],
                    'emergency_contact_relationship' => $validated['emergencyRelationship'],
                    'emergency_contact_number' => $validated['emergencyPhone'],
                    'highest_education' => $validated['education'],
                    'school_name' => $validated['school'],
                    'employment_status' => $validated['employmentStatus'],
                    'account_status' => 'pending',
                ]);

                // Generate application number
                $applicationNumber = 'APP-' . date('Y') . '-' . str_pad($user->id, 6, '0', STR_PAD_LEFT);

                // Create application record in APPLICATIONS table
                $application = Application::create([
                    'application_number' => $applicationNumber,
                    'user_id' => $user->id,
                    'course_id' => $course->id,
                    'status' => 'pending',
                    'voucher_eligibility_status' => $validated['tesdaVoucherEligibility'],
                    'submitted_at' => now(),
                    'documents_submitted' => true,
                    'documents_complete' => false,
                ]);

                // Handle file uploads and save to DOCUMENT_UPLOADS table
                $documentTypes = ['validId', 'transcript', 'diploma', 'passportPhoto'];
                
                foreach ($documentTypes as $docType) {
                    if ($request->hasFile($docType)) {
                        $file = $request->file($docType);
                        
                        // Store file
                        $directory = "applications/{$user->id}/{$docType}";
                        $path = $file->store($directory, 'public');
                        
                        // Create document upload record
                        DocumentUpload::create([
                            'user_id' => $user->id,
                            'application_id' => $application->id,
                            'document_type' => $docType,
                            'document_name' => $this->getDocumentName($docType),
                            'original_filename' => $file->getClientOriginalName(),
                            'stored_filename' => basename($path),
                            'file_path' => $path,
                            'file_size' => $file->getSize(),
                            'mime_type' => $file->getMimeType(),
                            'verification_status' => 'pending',
                            'is_required' => true,
                        ]);
                    }
                }

                // Commit transaction
                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Application submitted successfully',
                    'data' => [
                        'application_number' => $applicationNumber,
                        'application_id' => $application->id,
                        'user_id' => $user->id,
                        'course' => $course->name,
                        'status' => 'pending'
                    ]
                ], 201);

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing your application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getDocumentName($docType)
    {
        $names = [
            'validId' => 'Valid ID',
            'transcript' => 'Transcript of Record',
            'diploma' => 'Diploma',
            'passportPhoto' => 'Passport Size Picture'
        ];
        
        return $names[$docType] ?? $docType;
    }
}
