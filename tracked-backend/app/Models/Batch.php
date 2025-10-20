<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Batch extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'batch_id',
        'program_id',
        'trainer_id',
        'schedule_days',
        'schedule_time_start',
        'schedule_time_end',
        'status',
        'start_date',
        'end_date',
        'max_students',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'schedule_days' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['enrolled_students_count'];

    /**
     * Get the program that owns the batch.
     */
    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    /**
     * Get the trainer assigned to the batch.
     */
    public function trainer()
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    /**
     * Get the enrolled students for the batch.
     */
    public function students()
    {
        return $this->hasMany(User::class, 'batch_id', 'batch_id')->where('role', 'student');
    }

    /**
     * Get the count of enrolled students.
     */
    public function getEnrolledStudentsCountAttribute()
    {
        return $this->students()->count();
    }

    /**
     * Generate a unique batch ID.
     */
    public static function generateBatchId()
    {
        $year = date('Y');
        $lastBatch = self::whereYear('created_at', $year)
            ->orderBy('created_at', 'desc')
            ->first();

        if ($lastBatch) {
            $lastNumber = (int) substr($lastBatch->batch_id, -3);
            $newNumber = str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '001';
        }

        return "BATCH-{$year}-{$newNumber}";
    }
}
