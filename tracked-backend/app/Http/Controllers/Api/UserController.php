<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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
                'last_name' => $user->last_name,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'phone_number' => $user->phone_number ?? 'N/A',
                'phone' => $user->phone_number ?? 'N/A',
                'role' => $user->role,
                'status' => $user->status,
                'address' => $user->address ?? 'Philippines',
                'location' => $user->address ?? 'Philippines', // Default location
                'joinDate' => $user->created_at->format('Y-m-d'),
                'created_at' => $user->created_at->format('Y-m-d'),
                'program' => $user->course_program ?? $this->getProgramByRole($user->role),
                'course_program' => $user->course_program ?? null,
                'avatar' => null, // No avatar system yet
                'permissions' => $user->permissions ?? null
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
                'role' => $user->role,
                'status' => $user->status,
                'address' => $user->address,
                'gender' => $user->gender,
                'birth_date' => $user->birth_date,
                'place_of_birth' => $user->place_of_birth,
                'nationality' => $user->nationality,
                'joinDate' => $user->created_at->format('Y-m-d'),
                'last_login' => $user->last_login,
                'program' => $this->getProgramByRole($user->role)
            ]
        ]);
    }

    /**
     * Store a new user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
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
        ]);

        // Hash the password
        $validated['password'] = bcrypt($validated['password']);

        // Create the user
        $user = User::create($validated);

        // Handle file uploads if present
        if ($request->hasFile('profile_picture')) {
            $path = $request->file('profile_picture')->store('profile_pictures', 'public');
            $user->profile_picture = $path;
            $user->save();
        }

        // Handle documents if present
        // You can add document handling logic here if needed

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'user' => $user,
            'data' => $user
        ], 201);
    }

    /**
     * Update user
     */
    public function update(Request $request, User $user)
    {
        // Log permissions for debugging
        \Log::info('Update user permissions received', [
            'user_id' => $user->id,
            'permissions_raw' => $request->input('permissions'),
            'permissions_type' => gettype($request->input('permissions'))
        ]);

        $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'middle_name' => 'sometimes|nullable|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'phone_number' => 'sometimes|nullable|string|max:20',
            'role' => 'sometimes|required|in:applicant,student,trainer,staff,admin',
            'status' => 'sometimes|required|in:active,inactive,suspended',
            'address' => 'sometimes|nullable|string',
            'gender' => 'sometimes|nullable|in:male,female',
            'birth_date' => 'sometimes|nullable|date',
            'place_of_birth' => 'sometimes|nullable|string|max:255',
            'nationality' => 'sometimes|nullable|string|max:255',
            'permissions' => 'sometimes|nullable|array',
        ]);

        $user->update($request->only([
            'first_name', 'last_name', 'middle_name', 'email', 'phone_number',
            'role', 'status', 'address', 'gender', 'birth_date', 'place_of_birth', 'nationality', 'permissions'
        ]));
        
        \Log::info('User updated', ['permissions_after' => $user->fresh()->permissions]);

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
