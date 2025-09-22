<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Application extends Model
{
    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'middle_name',
        'nationality',
        'birth_date',
        'address',
        'place_of_birth',
        'email',
        'gender',
        'mobile_number',
        'education',
        'school',
        'course_program',
        'employment_status',
        'occupation',
        'emergency_contact',
        'emergency_relationship',
        'emergency_phone',
        'tesda_voucher_eligibility',
        'valid_id_path',
        'transcript_path',
        'resume_path',
        'medical_certificate_path',
        'status'
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    /**
     * Get the user that owns the application.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the full name of the applicant.
     */
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->middle_name} {$this->last_name}");
    }
}
