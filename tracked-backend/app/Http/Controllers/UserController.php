<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function store(Request $request)
    {
        try {
            // Log incoming request for debugging
            Log::info('User creation request received', [
                'role' => $request->role,
                'has_validId' => $request->hasFile('validId'),
                'has_transcript' => $request->hasFile('transcript'),
                'has_diploma' => $request->hasFile('diploma'),
                'has_passportPhoto' => $request->hasFile('passportPhoto'),
            ]);

            // Validate request
            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'phone_number' => ['required', 'string', 'regex:/^9\d{9}$/'],
                'emergency_phone' => ['nullable', 'string', 'regex:/^9\d{9}$/'],
                'role' => 'required|string|in:student,applicant,admin,instructor,staff,trainer',
                'status' => 'required|string|in:active,inactive',
                'course_program' => 'required_if:role,student,applicant',
                // Individual document uploads
                'validId' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB max
                'transcript' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB max
                'diploma' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB max
                'passportPhoto' => 'nullable|file|mimes:jpg,jpeg,png|max:10240', // 10MB max
                'profile_picture' => 'nullable|file|mimes:jpg,jpeg,png|max:2048', // 2MB max
            ]);

            // Handle file uploads for each document type
            $validIdPath = null;
            $transcriptPath = null;
            $diplomaPath = null;
            $passportPhotoPath = null;

            // Handle Valid ID
            if ($request->hasFile('validId')) {
                $file = $request->file('validId');
                $extension = $file->getClientOriginalExtension();
                $filename = 'validId_' . uniqid() . '.' . $extension;
                $path = 'applications/documents/validId/' . $filename;
                $file->storeAs('public/applications/documents/validId', $filename);
                $validIdPath = $path;
                Log::info('Valid ID uploaded', ['path' => $validIdPath]);
            }

            // Handle Transcript
            if ($request->hasFile('transcript')) {
                $file = $request->file('transcript');
                $extension = $file->getClientOriginalExtension();
                $filename = 'transcript_' . uniqid() . '.' . $extension;
                $path = 'applications/documents/transcript/' . $filename;
                $file->storeAs('public/applications/documents/transcript', $filename);
                $transcriptPath = $path;
                Log::info('Transcript uploaded', ['path' => $transcriptPath]);
            }

            // Handle Diploma
            if ($request->hasFile('diploma')) {
                $file = $request->file('diploma');
                $extension = $file->getClientOriginalExtension();
                $filename = 'diploma_' . uniqid() . '.' . $extension;
                $path = 'applications/documents/diploma/' . $filename;
                $file->storeAs('public/applications/documents/diploma', $filename);
                $diplomaPath = $path;
                Log::info('Diploma uploaded', ['path' => $diplomaPath]);
            }

            // Handle Passport Photo
            if ($request->hasFile('passportPhoto')) {
                $file = $request->file('passportPhoto');
                $extension = $file->getClientOriginalExtension();
                $filename = 'passportPhoto_' . uniqid() . '.' . $extension;
                $path = 'applications/documents/passportPhoto/' . $filename;
                $file->storeAs('public/applications/documents/passportPhoto', $filename);
                $passportPhotoPath = $path;
                Log::info('Passport photo uploaded', ['path' => $passportPhotoPath]);
            }

            // Create user
            $user = User::create([
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'password' => bcrypt($request->password),
                'phone_number' => $request->phone_number,
                'role' => $request->role,
                'status' => $request->status,
                'application_status' => $request->role === 'applicant' ? 'pending' : null,
                'address' => $request->address,
                'date_of_birth' => $request->date_of_birth,
                'place_of_birth' => $request->place_of_birth,
                'gender' => $request->gender,
                'nationality' => $request->nationality,
                'marital_status' => $request->marital_status,
                'education_level' => $request->education,
                'field_of_study' => $request->field_of_study,
                'institution_name' => $request->school,
                'graduation_year' => $request->graduation_year,
                'gpa' => $request->gpa,
                'employment_status' => $request->employment_status,
                'occupation' => $request->occupation,
                'work_experience' => $request->work_experience,
                'course_program' => $request->course_program,
                'emergency_contact' => $request->emergency_contact,
                'emergency_phone' => $request->emergency_phone,
                'emergency_relationship' => $request->emergency_relationship,
                'valid_id_path' => $validIdPath,
                'transcript_path' => $transcriptPath,
                'diploma_path' => $diplomaPath,
                'passport_photo_path' => $passportPhotoPath
            ]);

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
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            // Delete uploaded files if user creation fails
            if (isset($validIdPath)) {
                Storage::disk('public')->delete($validIdPath);
            }
            if (isset($transcriptPath)) {
                Storage::disk('public')->delete($transcriptPath);
            }
            if (isset($diplomaPath)) {
                Storage::disk('public')->delete($diplomaPath);
            }
            if (isset($passportPhotoPath)) {
                Storage::disk('public')->delete($passportPhotoPath);
            }

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function index(Request $request)
    {
        $query = User::with(['program', 'batch', 'voucher']);
        
        // Apply search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%")
                  ->orWhere('course_program', 'like', "%{$search}%");
            });
        }

        // Apply role filter
        if ($request->has('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        // Apply status filter
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('application_status', $request->status);
        }

        // Get all users without pagination if per_page is 'all'
        if ($request->has('per_page') && $request->per_page === 'all') {
            $users = $query->get();
            return response()->json([
                'success' => true,
                'users' => $users
            ]);
        }

        // Paginate results
        $perPage = $request->per_page ?? 10;
        $users = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'users' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem(),
                'total' => $users->total(),
            ]
        ]);
    }

    public function getStats()
    {
        $stats = [
            'total_users' => User::count(),
            'active_users' => User::where('status', 'active')->count(),
            'pending_applications' => User::where('application_status', 'pending')->count(),
            'total_applicants' => User::where('role', 'applicant')->count()
        ];

        return response()->json([
            'success' => true,
            'stats' => $stats
        ]);
    }
}