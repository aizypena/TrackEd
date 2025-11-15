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
                'generate_student_id' => $request->generate_student_id,
                'send_credentials_email' => $request->send_credentials_email,
                'batch_id' => $request->batch_id,
                'voucher_id' => $request->voucher_id,
                'voucher_eligible' => $request->voucher_eligible,
                'application_status' => $request->application_status,
                'approved_at' => $request->approved_at,
                'emergency_contact' => $request->emergency_contact,
                'has_validId' => $request->hasFile('validId'),
                'has_transcript' => $request->hasFile('transcript'),
                'has_diploma' => $request->hasFile('diploma'),
                'has_passportPhoto' => $request->hasFile('passportPhoto'),
            ]);

            // Validate request
            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'phone_number' => ['required', 'string', 'regex:/^9\d{9}$/'],
                'emergency_phone' => ['nullable', 'string', 'regex:/^9\d{9}$/'],
                'emergency_contact' => 'nullable|string|max:255',
                'emergency_relationship' => 'nullable|string|max:255',
                'role' => 'required|string|in:student,applicant,admin,instructor,staff,trainer',
                'status' => 'required|string|in:active,inactive',
                'course_program' => 'required_if:role,student,applicant',
                'batch_id' => 'nullable|string|max:255',
                'voucher_id' => 'nullable|string|max:255',
                'voucher_eligible' => 'nullable|string',
                'voucher_eligibility' => 'nullable|string',
                'application_status' => 'nullable|string',
                'approved_at' => 'nullable|string',
                'application_submitted_at' => 'nullable|string',
                'place_of_birth' => 'nullable|string|max:255',
                'employment_status' => 'nullable|string|max:255',
                'address' => 'nullable|string',
                'date_of_birth' => 'nullable|date',
                'gender' => 'nullable|string',
                'nationality' => 'nullable|string',
                'marital_status' => 'nullable|string',
                'education' => 'nullable|string',
                'education_level' => 'nullable|string',
                'school' => 'nullable|string',
                'institution_name' => 'nullable|string',
                'field_of_study' => 'nullable|string',
                'graduation_year' => 'nullable|string',
                'gpa' => 'nullable|string',
                'occupation' => 'nullable|string',
                'work_experience' => 'nullable|string',
                'generate_student_id' => 'nullable|string',
                'send_credentials_email' => 'nullable|string',
                'auto_generated' => 'nullable|string',
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

            // Generate student_id if this is a student and flag is set
            $studentId = null;
            if ($request->role === 'student' && $request->generate_student_id === 'true') {
                $year = date('Y');
                $lastStudent = User::where('role', 'student')
                    ->where('student_id', 'like', "STU-{$year}-%")
                    ->orderBy('student_id', 'desc')
                    ->first();

                if ($lastStudent && $lastStudent->student_id) {
                    // Extract the number from the last student ID
                    $lastNumber = (int) substr($lastStudent->student_id, -4);
                    $newNumber = $lastNumber + 1;
                } else {
                    $newNumber = 1;
                }

                $studentId = sprintf("STU-%s-%04d", $year, $newNumber);
                Log::info('Generated student_id', ['student_id' => $studentId]);
            }

            // Store plain password for email before hashing
            $plainPassword = $request->password;

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
                'student_id' => $studentId,
                'application_status' => $request->application_status ?? ($request->role === 'applicant' ? 'pending' : null),
                'approved_at' => $request->approved_at,
                'application_submitted_at' => $request->application_submitted_at,
                'batch_id' => $request->batch_id,
                'voucher_id' => $request->voucher_id,
                'voucher_eligibility' => $request->voucher_eligibility,
                'voucher_eligible' => $request->voucher_eligible,
                'address' => $request->address,
                'date_of_birth' => $request->date_of_birth,
                'place_of_birth' => $request->place_of_birth,
                'gender' => $request->gender,
                'nationality' => $request->nationality,
                'marital_status' => $request->marital_status,
                'education_level' => $request->education_level ?? $request->education,
                'field_of_study' => $request->field_of_study,
                'institution_name' => $request->institution_name ?? $request->school,
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

            // Increment voucher used count if student has voucher
            if ($request->role === 'student' && $request->voucher_id && $request->batch_id) {
                $voucher = \App\Models\Voucher::where('id', $request->voucher_id)
                    ->where('batch_id', $request->batch_id)
                    ->first();
                
                if ($voucher) {
                    $voucher->used_count = $voucher->used_count + 1;
                    $voucher->save();
                    Log::info("Voucher used count incremented for batch {$request->batch_id}. New count: {$voucher->used_count}/{$voucher->quantity}");
                } else {
                    Log::warning("No voucher found with ID {$request->voucher_id} for batch {$request->batch_id} when enrolling student {$studentId}");
                }
            }

            // Send credentials email if requested
            if ($request->role === 'student' && $request->send_credentials_email === 'true') {
                try {
                    \Illuminate\Support\Facades\Mail::send('emails.student-credentials', [
                        'student' => $user,
                        'password' => $plainPassword,
                        'loginUrl' => env('FRONTEND_URL', 'http://localhost:5173') . '/student/login'
                    ], function ($message) use ($user) {
                        $message->to($user->email)
                                ->subject('Student Credentials - TrackEd System');
                    });
                    
                    Log::info('Student credentials email sent', ['user_id' => $user->id, 'email' => $user->email]);
                } catch (\Exception $e) {
                    Log::error('Failed to send student credentials email', [
                        'user_id' => $user->id,
                        'error' => $e->getMessage()
                    ]);
                    // Don't fail the whole request if email fails
                }
            }

            Log::info('User created successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
                'student_id' => $user->student_id ?? null,
                'batch_id' => $user->batch_id ?? null,
                'voucher_id' => $user->voucher_id ?? null,
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