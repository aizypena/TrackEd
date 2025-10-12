<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    protected $casts = [
        'documents' => 'array',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'password',
        'role',
        'status',
        'application_status',
        'batch_id',
        'address',
        'date_of_birth',
        'place_of_birth',
        'gender',
        'nationality',
        'marital_status',
        'education_level',
        'field_of_study',
        'institution_name',
        'graduation_year',
        'gpa',
        'employment_status',
        'occupation',
        'work_experience',
        'course_program',
        'valid_id_path',
        'transcript_path',
        'diploma_path',
        'passport_photo_path',
        'birth_certificate_path',
        'medical_cert_path',
        'emergency_contact',
        'emergency_phone',
        'emergency_relationship',
        // Application fields
        'nationality',
        'marital_status',
        'education_level',
        'field_of_study',
        'institution_name',
        'graduation_year',
        'gpa',
        'computer_literacy',
        'languages',
        'work_experience',
        'career_goals',
        'why_applying',
        'additional_info',
        'valid_id_path',
        'transcript_path',
        'diploma_path',
        'passport_photo_path',
        'application_submitted_at',
        'application_reviewed_at',
        'application_notes',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'date_of_birth' => 'date',
            'password' => 'hashed',
            'languages' => 'array',
            'application_submitted_at' => 'datetime',
            'application_reviewed_at' => 'datetime',
        ];
    }
    
    /**
     * Get the user's full name.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
    
    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }
    
    /**
     * Check if user is an applicant.
     */
    public function isApplicant(): bool
    {
        return $this->role === 'applicant';
    }
    
    /**
     * Get the batch that the user belongs to.
     */
    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }
}
