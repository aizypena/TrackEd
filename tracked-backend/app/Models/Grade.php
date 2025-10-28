<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'quiz_id',
        'assessment_type',
        'assessment_title',
        'score',
        'total_points',
        'percentage',
        'passing_score',
        'status',
        'graded_by',
        'graded_at',
        'feedback',
        'attempt_number',
        'quiz_attempt_id',
        'batch_id',
        'program_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'score' => 'float',
        'total_points' => 'float',
        'percentage' => 'float',
        'passing_score' => 'float',
        'attempt_number' => 'integer',
        'graded_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the student that owns the grade.
     */
    public function student()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the trainer who graded this assessment.
     */
    public function gradedBy()
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    /**
     * Get the quiz associated with this grade (if written test).
     */
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Get the quiz attempt associated with this grade (if written test).
     */
    public function quizAttempt()
    {
        return $this->belongsTo(QuizAttempt::class, 'quiz_attempt_id');
    }

    /**
     * Get the batch associated with this grade.
     */
    public function batch()
    {
        return $this->belongsTo(Batch::class, 'batch_id', 'batch_id');
    }

    /**
     * Get the program associated with this grade.
     */
    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    /**
     * Scope a query to only include passed grades.
     */
    public function scopePassed($query)
    {
        return $query->where('status', 'passed');
    }

    /**
     * Scope a query to only include failed grades.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope a query to only include pending grades.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to filter by assessment type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('assessment_type', $type);
    }

    /**
     * Scope a query to filter by student.
     */
    public function scopeByStudent($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Check if the grade is passing.
     */
    public function isPassed()
    {
        return $this->percentage >= $this->passing_score;
    }

    /**
     * Check if the grade is failing.
     */
    public function isFailed()
    {
        return $this->percentage < $this->passing_score;
    }

    /**
     * Calculate and update the percentage.
     */
    public function calculatePercentage()
    {
        if ($this->total_points > 0) {
            $percentage = round(($this->score / $this->total_points) * 100, 2);
            $this->percentage = $percentage;
            $this->status = $percentage >= $this->passing_score ? 'passed' : 'failed';
            $this->save();
        }
    }

    /**
     * Get letter grade based on percentage.
     */
    public function getLetterGradeAttribute()
    {
        if ($this->percentage >= 95) return 'A+';
        if ($this->percentage >= 90) return 'A';
        if ($this->percentage >= 85) return 'B+';
        if ($this->percentage >= 80) return 'B';
        if ($this->percentage >= 75) return 'C+';
        if ($this->percentage >= 70) return 'C';
        if ($this->percentage >= 65) return 'D';
        return 'F';
    }
}
