<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Models\User;

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
                'email' => 'required|email|max:255',
                'mobileNumber' => 'required|string|max:20',
                'birthDate' => 'required|date',
                'gender' => 'required|in:male,female,other',
                'address' => 'required|string',
                'placeOfBirth' => 'nullable|string|max:255',
                'nationality' => 'required|string|max:255',
                'emergencyContact' => 'required|string|max:255',
                'emergencyRelationship' => 'nullable|string|max:255',
                'emergencyPhone' => 'required|string|max:20',
                
                // Education fields
                'education' => 'required|string|max:255',
                'school' => 'required|string|max:255',
                'courseProgram' => 'nullable|string|max:255',
                
                // Additional info
                'employmentStatus' => 'nullable|string|max:255',
                'occupation' => 'nullable|string|max:255',
                
                // Documents
                'validId' => 'required|file|mimes:pdf,jpg,jpeg,png|max:25600',
                'transcript' => 'required|file|mimes:pdf,jpg,jpeg,png|max:25600',
                'diploma' => 'required|file|mimes:pdf,jpg,jpeg,png|max:25600',
                'passportPhoto' => 'required|file|mimes:jpg,jpeg,png|max:25600',
            ]);

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
            
            foreach ($documentTypes as $docType) {
                if ($request->hasFile($docType)) {
                    $file = $request->file($docType);
                    $directory = "applications/documents/{$docType}";
                    $path = $file->store($directory, 'public');
                    $documentPaths[$docType . '_path'] = $path;
                }
            }

            // Create user with application data
            $user = User::create([
                'first_name' => $validated['firstName'],
                'last_name' => $validated['lastName'],
                'email' => $validated['email'],
                'phone_number' => $validated['mobileNumber'],
                'password' => bcrypt('temporary_password_123'), // You might want to generate a random password
                'role' => 'applicant',
                'status' => 'active',
                'application_status' => 'pending',
                'date_of_birth' => $validated['birthDate'],
                'gender' => $validated['gender'],
                'address' => $validated['address'],
                'nationality' => $validated['nationality'],
                'emergency_contact' => $validated['emergencyContact'],
                'emergency_phone' => $validated['emergencyPhone'],
                
                // Education fields
                'education_level' => $validated['education'],
                'institution_name' => $validated['school'],
                
                // Document paths
                'valid_id_path' => $documentPaths['validId_path'] ?? null,
                'transcript_path' => $documentPaths['transcript_path'] ?? null,
                'diploma_path' => $documentPaths['diploma_path'] ?? null,
                'passport_photo_path' => $documentPaths['passportPhoto_path'] ?? null,
                
                // Application metadata
                'application_submitted_at' => now(),
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
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
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
}
