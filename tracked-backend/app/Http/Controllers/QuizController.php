<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\QuizQuestionOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class QuizController extends Controller
{
    /**
     * Display a listing of quizzes for the authenticated trainer
     */
    public function index(Request $request)
    {
        $query = Quiz::with(['questions'])
            ->select('quizzes.*')
            ->selectRaw('(SELECT COUNT(*) FROM quiz_questions WHERE quiz_questions.quiz_id = quizzes.id) as total_questions');

        // Filter by type if provided
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Search by title
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $quizzes = $query->orderBy('created_at', 'desc')->get();

        // Add computed fields
        $quizzes->map(function ($quiz) {
            $quiz->assigned_students = 0; // TODO: Implement when student assignment is ready
            $quiz->completed_count = 0; // TODO: Implement from quiz_attempts
            return $quiz;
        });

        return response()->json([
            'success' => true,
            'data' => $quizzes
        ]);
    }

    /**
     * Store a newly created quiz
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:written,oral,demonstration,observation',
            'program' => 'required|string',
            'batch_id' => 'nullable|integer',
            'program_id' => 'nullable|integer',
            'duration' => 'required|integer|min:1',
            'passing_score' => 'required|integer|min:0|max:100',
            'retake_limit' => 'required|integer|min:1',
            'status' => 'required|in:active,draft,archived',
            'questions' => 'required|array|min:1',
            'questions.*.question' => 'required|string',
            'questions.*.type' => 'required|in:multiple_choice,true_false,short_answer',
            'questions.*.points' => 'required|integer|min:1',
            'questions.*.options' => 'required_if:questions.*.type,multiple_choice,true_false|array|min:2',
            'questions.*.options.*.option_text' => 'required|string',
            'questions.*.options.*.is_correct' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Calculate total points from questions
            $totalPoints = collect($request->questions)->sum('points');

            // Create the quiz
            $quiz = Quiz::create([
                'title' => $request->title,
                'description' => $request->description,
                'type' => $request->type,
                'program' => $request->program,
                'batch_id' => $request->batch_id,
                'program_id' => $request->program_id,
                'total_points' => $totalPoints,
                'time_limit' => $request->duration,
                'retake_limit' => $request->retake_limit,
                'passing_score' => $request->passing_score,
                'status' => $request->status,
            ]);

            // Create questions and options
            foreach ($request->questions as $index => $questionData) {
                $question = QuizQuestion::create([
                    'quiz_id' => $quiz->id,
                    'question' => $questionData['question'],
                    'type' => $questionData['type'],
                    'points' => $questionData['points'],
                    'order' => $index + 1,
                ]);

                // Create options if provided
                if (isset($questionData['options']) && is_array($questionData['options'])) {
                    foreach ($questionData['options'] as $optionIndex => $optionData) {
                        QuizQuestionOption::create([
                            'question_id' => $question->id,
                            'option_text' => $optionData['option_text'],
                            'is_correct' => $optionData['is_correct'],
                            'order' => $optionIndex + 1,
                        ]);
                    }
                }
            }

            DB::commit();

            // Load relationships for response
            $quiz->load(['questions.options']);

            return response()->json([
                'success' => true,
                'message' => 'Quiz created successfully',
                'data' => $quiz
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create quiz',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified quiz
     */
    public function show($id)
    {
        $quiz = Quiz::with(['questions.options'])->find($id);

        if (!$quiz) {
            return response()->json([
                'success' => false,
                'message' => 'Quiz not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $quiz
        ]);
    }

    /**
     * Update the specified quiz
     */
    public function update(Request $request, $id)
    {
        $quiz = Quiz::find($id);

        if (!$quiz) {
            return response()->json([
                'success' => false,
                'message' => 'Quiz not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|required|in:written,oral,demonstration,observation',
            'program' => 'sometimes|required|string',
            'duration' => 'sometimes|required|integer|min:1',
            'passing_score' => 'sometimes|required|integer|min:0|max:100',
            'retake_limit' => 'sometimes|required|integer|min:1',
            'status' => 'sometimes|required|in:active,draft,archived',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $quiz->update($request->only([
                'title',
                'description',
                'type',
                'program',
                'time_limit',
                'retake_limit',
                'passing_score',
                'status'
            ]));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Quiz updated successfully',
                'data' => $quiz
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update quiz',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified quiz
     */
    public function destroy($id)
    {
        $quiz = Quiz::find($id);

        if (!$quiz) {
            return response()->json([
                'success' => false,
                'message' => 'Quiz not found'
            ], 404);
        }

        try {
            $quiz->delete();

            return response()->json([
                'success' => true,
                'message' => 'Quiz deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete quiz',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
