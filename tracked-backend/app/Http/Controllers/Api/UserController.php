<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Get all users with pagination and filtering
     */
    public function index(Request $request)
    {
        $query = User::with(['program', 'batch', 'voucher']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'LIKE', "%{$search}%")
                  ->orWhere('last_name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('phone_number', 'LIKE', "%{$search}%");
            });
        }

        // Role filter
        if ($request->has('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        // Status filter
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Get all users without pagination if per_page is 'all'
        if ($request->has('per_page') && $request->per_page === 'all') {
            $users = $query->latest()->get();
            return response()->json([
                'success' => true,
                'users' => $users
            ]);
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $users = $query->latest()->paginate($perPage);

        // Transform the data to match frontend expectations
        $transformedUsers = $users->getCollection()->map(function ($user) {
            return [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'middle_name' => $user->middle_name,
                'last_name' => $user->last_name,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'phone_number' => $user->phone_number ?? 'N/A',
                'phone' => $user->phone_number ?? 'N/A',
                'role' => $user->role,
                'status' => $user->status,
                'application_status' => $user->application_status ?? null,
                'address' => $user->address ?? 'Philippines',
                'location' => $user->address ?? 'Philippines', // Default location
                'joinDate' => $user->created_at->format('Y-m-d'),
                'created_at' => $user->created_at->format('Y-m-d'),
                'program' => $user->course_program ?? $this->getProgramByRole($user->role),
                'course_program' => $user->course_program ?? null,
                'avatar' => null, // No avatar system yet
                'permissions' => $user->permissions ?? null,
                // Document paths for applicants
                'valid_id_path' => $user->valid_id_path ?? null,
                'transcript_path' => $user->transcript_path ?? null,
                'diploma_path' => $user->diploma_path ?? null,
                'passport_photo_path' => $user->passport_photo_path ?? null,
                // Additional applicant fields
                'date_of_birth' => $user->date_of_birth ?? null,
                'place_of_birth' => $user->place_of_birth ?? null,
                'gender' => $user->gender ?? null,
                'nationality' => $user->nationality ?? null,
                'marital_status' => $user->marital_status ?? null,
                'education_level' => $user->education_level ?? null,
                'institution_name' => $user->institution_name ?? null,
                'employment_status' => $user->employment_status ?? null,
                'occupation' => $user->occupation ?? null,
                'emergency_contact' => $user->emergency_contact ?? null,
                'emergency_phone' => $user->emergency_phone ?? null,
                'emergency_relationship' => $user->emergency_relationship ?? null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $transformedUsers,
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem()
            ]
        ]);
    }

    /**
     * Get user statistics
     */
    public function stats()
    {
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'active')->count();
        $applicants = User::where('role', 'applicant')->count();
        $students = User::where('role', 'student')->count();

        return response()->json([
            'success' => true,
            'stats' => [
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'pending_users' => $applicants, // Applicants count
                'students' => $students // Actual students count
            ]
        ]);
    }

    /**
     * Show specific user
     */
    public function show(User $user)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'middle_name' => $user->middle_name,
                'email' => $user->email,
                'phone' => $user->phone_number,
                'phone_number' => $user->phone_number,
                'role' => $user->role,
                'status' => $user->status,
                'application_status' => $user->application_status,
                'address' => $user->address,
                'gender' => $user->gender,
                'date_of_birth' => $user->date_of_birth,
                'birth_date' => $user->birth_date,
                'place_of_birth' => $user->place_of_birth,
                'nationality' => $user->nationality,
                'marital_status' => $user->marital_status,
                'education_level' => $user->education_level,
                'institution_name' => $user->institution_name,
                'employment_status' => $user->employment_status,
                'occupation' => $user->occupation,
                'course_program' => $user->course_program,
                'emergency_contact' => $user->emergency_contact,
                'emergency_phone' => $user->emergency_phone,
                'emergency_relationship' => $user->emergency_relationship,
                'joinDate' => $user->created_at->format('Y-m-d'),
                'last_login' => $user->last_login,
                'program' => $this->getProgramByRole($user->role),
                // Document paths
                'valid_id_path' => $user->valid_id_path,
                'transcript_path' => $user->transcript_path,
                'diploma_path' => $user->diploma_path,
                'passport_photo_path' => $user->passport_photo_path,
            ]
        ]);
    }

    /**
     * Store a new user
     */
    public function store(Request $request)
    {
        // Handle permissions that might come as JSON string from FormData
        if ($request->has('permissions') && is_string($request->input('permissions'))) {
            $request->merge([
                'permissions' => json_decode($request->input('permissions'), true)
            ]);
        }
        
        // Log incoming request for debugging
        Log::info('User creation request received', [
            'role' => $request->role,
            'has_validId' => $request->hasFile('validId'),
            'has_transcript' => $request->hasFile('transcript'),
            'has_diploma' => $request->hasFile('diploma'),
            'has_passportPhoto' => $request->hasFile('passportPhoto'),
        ]);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone_number' => 'required|string|max:20',
            'password' => 'required|string|min:6',
            'role' => 'required|in:applicant,student,trainer,staff,admin',
            'status' => 'required|in:active,inactive,suspended,pending',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'place_of_birth' => 'nullable|string|max:255',
            'gender' => 'nullable|in:male,female,other',
            'nationality' => 'nullable|string|max:255',
            'marital_status' => 'nullable|in:single,married,divorced,widowed',
            'education_level' => 'nullable|string|max:255',
            'field_of_study' => 'nullable|string|max:255',
            'institution_name' => 'nullable|string|max:255',
            'graduation_year' => 'nullable|integer|min:1950|max:2030',
            'gpa' => 'nullable|numeric|min:0|max:4',
            'employment_status' => 'nullable|in:employed,unemployed,self_employed,student',
            'occupation' => 'nullable|string|max:255',
            'work_experience' => 'nullable|string',
            'course_program' => 'nullable|string|max:255',
            'emergency_contact' => 'nullable|string|max:255',
            'emergency_phone' => 'nullable|string|max:20',
            'emergency_relationship' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
            // Document validation
            'validId' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'transcript' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'diploma' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'passportPhoto' => 'nullable|file|mimes:jpg,jpeg,png|max:10240',
        ]);

        // Handle document file uploads
        $validIdPath = null;
        $transcriptPath = null;
        $diplomaPath = null;
        $passportPhotoPath = null;

        try {
            // Handle Valid ID
            if ($request->hasFile('validId')) {
                $file = $request->file('validId');
                $extension = $file->getClientOriginalExtension();
                $filename = 'validId_' . uniqid() . '.' . $extension;
                
                // Use Storage facade with public disk
                $storedPath = Storage::disk('public')->putFileAs(
                    'applications/documents/validId',
                    $file,
                    $filename
                );
                
                if ($storedPath) {
                    $validIdPath = $storedPath;
                    $fullPath = storage_path('app/public/' . $storedPath);
                    Log::info('Valid ID uploaded', [
                        'path' => $validIdPath,
                        'full_path' => $fullPath,
                        'file_exists' => file_exists($fullPath)
                    ]);
                } else {
                    Log::error('Failed to store Valid ID file');
                }
            }

            // Handle Transcript
            if ($request->hasFile('transcript')) {
                $file = $request->file('transcript');
                $extension = $file->getClientOriginalExtension();
                $filename = 'transcript_' . uniqid() . '.' . $extension;
                
                // Use Storage facade with public disk
                $storedPath = Storage::disk('public')->putFileAs(
                    'applications/documents/transcript',
                    $file,
                    $filename
                );
                
                if ($storedPath) {
                    $transcriptPath = $storedPath;
                    $fullPath = storage_path('app/public/' . $storedPath);
                    Log::info('Transcript uploaded', [
                        'path' => $transcriptPath,
                        'file_exists' => file_exists($fullPath)
                    ]);
                } else {
                    Log::error('Failed to store Transcript file');
                }
            }

            // Handle Diploma
            if ($request->hasFile('diploma')) {
                $file = $request->file('diploma');
                $extension = $file->getClientOriginalExtension();
                $filename = 'diploma_' . uniqid() . '.' . $extension;
                
                // Use Storage facade with public disk
                $storedPath = Storage::disk('public')->putFileAs(
                    'applications/documents/diploma',
                    $file,
                    $filename
                );
                
                if ($storedPath) {
                    $diplomaPath = $storedPath;
                    $fullPath = storage_path('app/public/' . $storedPath);
                    Log::info('Diploma uploaded', [
                        'path' => $diplomaPath,
                        'file_exists' => file_exists($fullPath)
                    ]);
                } else {
                    Log::error('Failed to store Diploma file');
                }
            }

            // Handle Passport Photo
            if ($request->hasFile('passportPhoto')) {
                $file = $request->file('passportPhoto');
                $extension = $file->getClientOriginalExtension();
                $filename = 'passportPhoto_' . uniqid() . '.' . $extension;
                
                // Use Storage facade with public disk
                $storedPath = Storage::disk('public')->putFileAs(
                    'applications/documents/passportPhoto',
                    $file,
                    $filename
                );
                
                if ($storedPath) {
                    $passportPhotoPath = $storedPath;
                    $fullPath = storage_path('app/public/' . $storedPath);
                    Log::info('Passport photo uploaded', [
                        'path' => $passportPhotoPath,
                        'file_exists' => file_exists($fullPath)
                    ]);
                } else {
                    Log::error('Failed to store Passport Photo file');
                }
            }

            // Hash the password
            $validated['password'] = bcrypt($validated['password']);

            // Add document paths to validated data
            $validated['valid_id_path'] = $validIdPath;
            $validated['transcript_path'] = $transcriptPath;
            $validated['diploma_path'] = $diplomaPath;
            $validated['passport_photo_path'] = $passportPhotoPath;

            // Set application_status for applicants
            if ($validated['role'] === 'applicant') {
                $validated['application_status'] = 'pending';
            }

            // Create the user
            $user = User::create($validated);

            Log::info('User created successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
                'valid_id_path' => $user->valid_id_path,
                'transcript_path' => $user->transcript_path,
                'diploma_path' => $user->diploma_path,
                'passport_photo_path' => $user->passport_photo_path,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'user' => $user,
                'data' => $user
            ], 201);

        } catch (\Exception $e) {
            // Delete uploaded files if user creation fails
            if ($validIdPath) {
                Storage::disk('public')->delete($validIdPath);
            }
            if ($transcriptPath) {
                Storage::disk('public')->delete($transcriptPath);
            }
            if ($diplomaPath) {
                Storage::disk('public')->delete($diplomaPath);
            }
            if ($passportPhotoPath) {
                Storage::disk('public')->delete($passportPhotoPath);
            }

            Log::error('User creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user
     */
    public function update(Request $request, User $user)
    {
        // Handle permissions that might come as JSON string from FormData
        if ($request->has('permissions') && is_string($request->input('permissions'))) {
            $request->merge([
                'permissions' => json_decode($request->input('permissions'), true)
            ]);
        }
        
        $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'middle_name' => 'sometimes|nullable|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'phone_number' => 'sometimes|nullable|string|max:20',
            'role' => 'sometimes|required|in:applicant,student,trainer,staff,admin',
            'status' => 'sometimes|required|in:active,inactive,suspended',
            'address' => 'sometimes|nullable|string',
            'gender' => 'sometimes|nullable|in:male,female,other',
            'date_of_birth' => 'sometimes|nullable|date',
            'place_of_birth' => 'sometimes|nullable|string|max:255',
            'nationality' => 'sometimes|nullable|string|max:255',
            'marital_status' => 'sometimes|nullable|in:single,married,divorced,widowed,separated',
            'education_level' => 'sometimes|nullable|string|max:255',
            'field_of_study' => 'sometimes|nullable|string|max:255',
            'institution_name' => 'sometimes|nullable|string|max:255',
            'graduation_year' => 'sometimes|nullable|integer|min:1950|max:2030',
            'gpa' => 'sometimes|nullable|numeric|min:0|max:4',
            'employment_status' => 'sometimes|nullable|string|max:255',
            'occupation' => 'sometimes|nullable|string|max:255',
            'work_experience' => 'sometimes|nullable|string',
            'course_program' => 'sometimes|nullable|string|max:255',
            'emergency_contact' => 'sometimes|nullable|string|max:255',
            'emergency_phone' => 'sometimes|nullable|string|max:20',
            'emergency_relationship' => 'sometimes|nullable|string|max:255',
            'permissions' => 'sometimes|nullable|array',
        ]);

        // Get update data
        $updateData = $request->only([
            'first_name', 'last_name', 'middle_name', 'email', 'phone_number',
            'role', 'status', 'address', 'gender', 'date_of_birth', 'place_of_birth', 
            'nationality', 'marital_status', 'education_level', 'field_of_study',
            'institution_name', 'graduation_year', 'gpa', 'employment_status',
            'occupation', 'work_experience', 'course_program', 'emergency_contact',
            'emergency_phone', 'emergency_relationship'
        ]);

        // Handle permissions separately to prevent double-encoding
        if ($request->has('permissions')) {
            $permissions = $request->input('permissions');
            // If it's already an array, use it directly
            // The 'json' cast in the model will handle the encoding properly
            $updateData['permissions'] = $permissions;
        }

        $user->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user->fresh()
        ]);
    }

    /**
     * Delete user
     */
    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Get program name based on user role
     */
    private function getProgramByRole(string $role): string
    {
        switch ($role) {
            case 'applicant':
                return 'Program Application';
            case 'student':
                return 'Active Student';
            case 'trainer':
                return 'Training Staff';
            case 'staff':
                return 'Administrative Staff';
            case 'admin':
                return 'System Administrator';
            default:
                return 'General User';
        }
    }
}
