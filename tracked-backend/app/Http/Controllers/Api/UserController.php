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
        $query = User::query();

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

        // Pagination
        $perPage = $request->get('per_page', 10);
        $users = $query->latest()->paginate($perPage);

        // Transform the data to match frontend expectations
        $transformedUsers = $users->getCollection()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone_number ?? 'N/A',
                'role' => $user->role,
                'status' => $user->status,
                'location' => $user->address ?? 'Philippines', // Default location
                'joinDate' => $user->created_at->format('Y-m-d'),
                'program' => $user->course_program ?? $this->getProgramByRole($user->role),
                'course_program' => $user->course_program ?? null,
                'avatar' => null // No avatar system yet
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
        $pendingUsers = User::where('status', 'inactive')->count(); // Treating inactive as pending
        $students = User::where('role', 'applicant')->count(); // Treating applicants as students

        return response()->json([
            'success' => true,
            'stats' => [
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'pending_users' => $pendingUsers,
                'students' => $students
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
     * Update user
     */
    public function update(Request $request, User $user)
    {
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
        ]);

        $user->update($request->only([
            'first_name', 'last_name', 'middle_name', 'email', 'phone_number',
            'role', 'status', 'address', 'gender', 'birth_date', 'place_of_birth', 'nationality'
        ]));

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
