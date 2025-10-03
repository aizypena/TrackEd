<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function store(Request $request)
    {
        try {
            // Validate request
            $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'phone_number' => ['required', 'string', 'regex:/^9\d{9}$/'],
                'emergency_phone' => ['nullable', 'string', 'regex:/^9\d{9}$/'],
                'role' => 'required|string|in:student,applicant,admin,instructor,staff',
                'status' => 'required|string|in:active,inactive',
                'course_program' => 'required_if:role,student,applicant',
                'documents.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
                'profile_picture' => 'nullable|file|mimes:jpg,jpeg,png|max:2048', // 2MB max
            ]);

            // Handle file uploads
            $validIdPath = null;
            $transcriptPath = null;
            $diplomaPath = null;
            $passportPhotoPath = null;

            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $type => $file) {
                    $extension = $file->getClientOriginalExtension();
                    $filename = uniqid() . '.' . $extension;
                    $path = 'applications/documents/' . $type . '/' . $filename;
                    
                    // Store file and save path
                    $file->storeAs('public/' . dirname($path), $filename);
                    
                    switch($type) {
                        case 'validId':
                            $validIdPath = $path;
                            break;
                        case 'transcript':
                            $transcriptPath = $path;
                            break;
                        case 'diploma':
                            $diplomaPath = $path;
                            break;
                        case 'passportPhoto':
                            $passportPhotoPath = $path;
                            break;
                    }
                }
            }

            // Create user
            $user = User::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'password' => bcrypt($request->password),
                'phone_number' => $request->phone_number,
                'role' => $request->role,
                'status' => $request->status,
                'application_status' => 'pending',
                'address' => $request->address,
                'date_of_birth' => $request->date_of_birth,
                'place_of_birth' => $request->place_of_birth,
                'gender' => $request->gender,
                'nationality' => $request->nationality,
                'marital_status' => $request->marital_status,
                'education_level' => $request->education_level,
                'field_of_study' => $request->field_of_study,
                'institution_name' => $request->institution_name,
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

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            // Delete uploaded files if user creation fails
            if (isset($documentPaths)) {
                foreach ($documentPaths as $path) {
                    Storage::disk('public')->delete($path);
                }
            }
            if (isset($profilePicturePath)) {
                Storage::disk('public')->delete($profilePicturePath);
            }

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function index(Request $request)
    {
        $query = User::query();
        
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

        // Paginate results
        $perPage = $request->per_page ?? 10;
        $users = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $users->items(),
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