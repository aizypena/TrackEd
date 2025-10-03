<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the table if it exists
        Schema::dropIfExists('users');
        
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('phone_number', 10);
            $table->string('password');
            $table->enum('role', ['applicant', 'student', 'instructor', 'staff', 'admin'])->default('applicant');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->enum('application_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('address')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('place_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->string('nationality')->nullable();
            $table->string('marital_status')->nullable();
            
            // Educational Background
            $table->string('education_level')->nullable();
            $table->string('field_of_study')->nullable();
            $table->string('institution_name')->nullable();
            $table->year('graduation_year')->nullable();
            $table->decimal('gpa', 3, 2)->nullable();
            
            // Employment Information
            $table->string('employment_status')->nullable();
            $table->string('occupation')->nullable();
            $table->text('work_experience')->nullable();
            
            // Course Information
            $table->string('course_program')->nullable();
            
            // Document Paths
            $table->string('valid_id_path')->nullable();
            $table->string('transcript_path')->nullable();
            $table->string('diploma_path')->nullable();
            $table->string('passport_photo_path')->nullable();
            
            // Emergency Contact
            $table->string('emergency_contact')->nullable();
            $table->string('emergency_phone', 10)->nullable();
            $table->string('emergency_relationship')->nullable();
            
            $table->rememberToken();
            $table->timestamps();
            
            $table->index('email');
            $table->index('role');
            $table->index('status');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
