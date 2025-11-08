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
        'permissions' => 'array',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'student_id',
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'password',
        'role',
        'status',
        'application_status',
        'batch_id',
        'voucher_eligibility',
        'voucher_id',
        'voucher_eligible',
        'approval_notes',
        'application_status_reason',
        'approved_at',
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
        'computer_literacy',
        'languages',
        'career_goals',
        'why_applying',
        'additional_info',
        'application_submitted_at',
        'application_reviewed_at',
        'application_notes',
        // Trainer fields
        'specialization',
        'certifications',
        'experience',
        'bio',
        'assigned_programs',
        // Staff permissions
        'permissions',
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
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'course_program_formatted',
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
            'certifications' => 'array',
            'assigned_programs' => 'array',
            'voucher_eligible' => 'boolean',
            'approved_at' => 'datetime',
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
        return $this->belongsTo(Batch::class, 'batch_id', 'batch_id');
    }
    
    /**
     * Get the program that the user is enrolled in.
     */
    public function program()
    {
        return $this->belongsTo(Program::class, 'course_program');
    }
    
    /**
     * Get the voucher assigned to the user.
     */
    public function voucher()
    {
        return $this->belongsTo(Voucher::class, 'voucher_id', 'voucher_id');
    }
    
    /**
     * Get all grades for the user (as student).
     */
    public function grades()
    {
        return $this->hasMany(Grade::class, 'user_id');
    }
    
    /**
     * Get all grades given by the user (as trainer).
     */
    public function gradedAssessments()
    {
        return $this->hasMany(Grade::class, 'graded_by');
    }
    
    /**
     * Get all attendance records for the user (as student).
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'user_id');
    }
    
    /**
     * Get all attendance records marked by the user (as trainer).
     */
    public function markedAttendances()
    {
        return $this->hasMany(Attendance::class, 'marked_by');
    }

    /**
     * Get formatted course program name.
     */
    public function getCourseProgramFormattedAttribute()
    {
        if (!$this->course_program) {
            return 'N/A';
        }

        // Map course codes to full names
        $programNames = [
            'CRS' => 'Computer Repair Servicing',
            'DM' => 'Digital Marketing',
            'FS' => 'Food Safety',
            'SMAW' => 'Shielded Metal Arc Welding',
            'HOUSEKEEPING' => 'Housekeeping',
            'COOKERY' => 'Cookery',
            'BARISTA' => 'Barista',
            'FOOD_BEVERAGE' => 'Food & Beverage Services',
            'BREAD_PASTRY' => 'Bread and Pastry Production',
            'EVENTS_MANAGEMENT' => 'Events Management',
        ];

        return $programNames[$this->course_program] ?? $this->course_program;
    }
}

