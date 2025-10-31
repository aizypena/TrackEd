<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class BatchController extends Controller
{
    /**
     * Display a listing of batches.
     */
    public function index(Request $request)
    {
        $query = Batch::with(['program', 'trainer', 'students']);

        // Filter by program
        if ($request->has('program_id') && $request->program_id !== 'all') {
            $query->where('program_id', $request->program_id);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by batch_id
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('batch_id', 'like', "%{$search}%");
        }

        $batches = $query->orderBy('created_at', 'desc')->get();

        // Add enrolled students count and voucher info to each batch
        $batches = $batches->map(function ($batch) {
            $batch->enrolled_students_count = $batch->students()->count();
            
            // Get voucher information for this batch
            $voucher = \App\Models\Voucher::where('batch_id', $batch->batch_id)->first();
            if ($voucher) {
                $batch->voucher_quantity = $voucher->quantity;
                $batch->voucher_used_count = $voucher->used_count;
                $batch->voucher_available = $voucher->quantity - $voucher->used_count;
                $batch->voucher_status = $voucher->status;
            } else {
                $batch->voucher_quantity = 0;
                $batch->voucher_used_count = 0;
                $batch->voucher_available = 0;
                $batch->voucher_status = null;
            }
            
            return $batch;
        });

        return response()->json([
            'success' => true,
            'data' => $batches
        ]);
    }

    /**
     * Store a newly created batch.
     */
    public function store(Request $request)
    {
        // Log incoming request data
        Log::info('Batch creation request:', $request->all());

        $validator = Validator::make($request->all(), [
            'program_id' => 'required|exists:programs,id',
            'trainer_id' => 'nullable|exists:users,id',
            'schedule_days' => 'required|array|min:1',
            'schedule_days.*' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'schedule_time_start' => 'required|date_format:H:i',
            'schedule_time_end' => 'required|date_format:H:i|after:schedule_time_start',
            'status' => 'required|in:not started,ongoing,finished',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'max_students' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            Log::error('Batch validation failed:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if program is available
        $program = Program::find($request->program_id);
        if (!$program) {
            return response()->json([
                'success' => false,
                'message' => 'Program not found'
            ], 404);
        }
        
        if ($program->availability !== 'available') {
            return response()->json([
                'success' => false,
                'message' => 'Selected program is not available'
            ], 422);
        }

        try {
            $batch = new Batch();
            $batch->batch_id = Batch::generateBatchId();
            $batch->program_id = $request->program_id;
            $batch->trainer_id = $request->trainer_id;
            $batch->schedule_days = $request->schedule_days;
            $batch->schedule_time_start = $request->schedule_time_start;
            $batch->schedule_time_end = $request->schedule_time_end;
            $batch->status = $request->status;
            $batch->start_date = $request->start_date;
            $batch->end_date = $request->end_date;
            $batch->max_students = $request->max_students;
            $batch->save();

            // Load relationships
            $batch->load(['program', 'trainer', 'students']);
            $batch->enrolled_students_count = $batch->students()->count();

            return response()->json([
                'success' => true,
                'message' => 'Batch created successfully',
                'data' => $batch
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create batch',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified batch.
     */
    public function show($id)
    {
        $batch = Batch::with(['program', 'trainer', 'students'])->find($id);

        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'Batch not found'
            ], 404);
        }

        $batch->enrolled_students_count = $batch->students()->count();
        
        // Get voucher information for this batch
        $voucher = \App\Models\Voucher::where('batch_id', $batch->batch_id)->first();
        if ($voucher) {
            $batch->voucher_quantity = $voucher->quantity;
            $batch->voucher_used_count = $voucher->used_count;
            $batch->voucher_available = $voucher->quantity - $voucher->used_count;
            $batch->voucher_status = $voucher->status;
        } else {
            $batch->voucher_quantity = 0;
            $batch->voucher_used_count = 0;
            $batch->voucher_available = 0;
            $batch->voucher_status = null;
        }

        return response()->json([
            'success' => true,
            'data' => $batch
        ]);
    }

    /**
     * Update the specified batch.
     */
    public function update(Request $request, $id)
    {
        $batch = Batch::find($id);

        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'Batch not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'program_id' => 'sometimes|required|exists:programs,id',
            'trainer_id' => 'nullable|exists:users,id',
            'schedule_days' => 'sometimes|required|array|min:1',
            'schedule_days.*' => 'sometimes|required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'schedule_time_start' => 'sometimes|required|date_format:H:i',
            'schedule_time_end' => 'sometimes|required|date_format:H:i|after:schedule_time_start',
            'status' => 'sometimes|required|in:not started,ongoing,finished',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'max_students' => 'sometimes|required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if program is available (if program_id is being updated)
        if ($request->has('program_id')) {
            $program = Program::find($request->program_id);
            if ($program->availability !== 'available') {
                return response()->json([
                    'success' => false,
                    'message' => 'Selected program is not available'
                ], 422);
            }
        }

        try {
            $batch->update($request->all());
            $batch->load(['program', 'trainer', 'students']);
            $batch->enrolled_students_count = $batch->students()->count();

            return response()->json([
                'success' => true,
                'message' => 'Batch updated successfully',
                'data' => $batch
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update batch',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified batch.
     */
    public function destroy($id)
    {
        $batch = Batch::find($id);

        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'Batch not found'
            ], 404);
        }

        // Check if there are enrolled students
        if ($batch->students()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete batch with enrolled students'
            ], 422);
        }

        try {
            $batch->delete();

            return response()->json([
                'success' => true,
                'message' => 'Batch deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete batch',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get enrolled students for a specific batch.
     */
    public function getEnrolledStudents($id)
    {
        $batch = Batch::with(['program', 'students'])->find($id);

        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'Batch not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'batch' => $batch,
                'students' => $batch->students
            ]
        ]);
    }
}
