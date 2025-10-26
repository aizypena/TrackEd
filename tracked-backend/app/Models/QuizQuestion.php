<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizQuestion extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'quiz_id',
        'question',
        'type',
        'points',
        'order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'points' => 'integer',
        'order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the quiz that owns the question.
     */
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Get the options for the question.
     */
    public function options()
    {
        return $this->hasMany(QuizQuestionOption::class, 'question_id');
    }

    /**
     * Get the answers for the question.
     */
    public function answers()
    {
        return $this->hasMany(QuizAnswer::class, 'question_id');
    }

    /**
     * Get the correct option(s) for the question.
     */
    public function correctOptions()
    {
        return $this->options()->where('is_correct', true);
    }

    /**
     * Check if the question is multiple choice.
     */
    public function isMultipleChoice()
    {
        return $this->type === 'multiple_choice';
    }

    /**
     * Check if the question is true/false.
     */
    public function isTrueFalse()
    {
        return $this->type === 'true_false';
    }

    /**
     * Check if the question is short answer.
     */
    public function isShortAnswer()
    {
        return $this->type === 'short_answer';
    }
}
