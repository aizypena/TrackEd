<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProgramController extends Controller
{
    /**
     * Display a listing of programs.
     */
    public function index(Request $request)
    {
        $query = Program::query();

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }

        // Filter by availability
        if ($request->has('availability') && $request->availability !== 'all') {
            $query->where('availability', $request->availability);
        }

        // Order by created_at desc
        $programs = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $programs
        ]);
    }

    /**
     * Store a newly created program.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'career_opportunities' => 'nullable|array|max:5',
            'career_opportunities.*' => 'string',
            'core_competencies' => 'nullable|array|max:5',
            'core_competencies.*' => 'string',
            'duration' => 'required|integer|min:1',
            'pricing' => 'nullable|numeric|min:0',
            'availability' => 'required|in:available,unavailable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $program = Program::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Program created successfully',
                'data' => $program
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create program',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified program.
     */
    public function show($id)
    {
        $program = Program::find($id);

        if (!$program) {
            return response()->json([
                'success' => false,
                'message' => 'Program not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $program
        ]);
    }

    /**
     * Update the specified program.
     */
    public function update(Request $request, $id)
    {
        $program = Program::find($id);

        if (!$program) {
            return response()->json([
                'success' => false,
                'message' => 'Program not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'career_opportunities' => 'nullable|array|max:5',
            'career_opportunities.*' => 'string',
            'core_competencies' => 'nullable|array|max:5',
            'core_competencies.*' => 'string',
            'duration' => 'sometimes|required|integer|min:1',
            'pricing' => 'nullable|numeric|min:0',
            'availability' => 'sometimes|required|in:available,unavailable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $program->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Program updated successfully',
                'data' => $program
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update program',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified program.
     */
    public function destroy($id)
    {
        $program = Program::find($id);

        if (!$program) {
            return response()->json([
                'success' => false,
                'message' => 'Program not found'
            ], 404);
        }

        try {
            $program->delete();

            return response()->json([
                'success' => true,
                'message' => 'Program deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete program',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}