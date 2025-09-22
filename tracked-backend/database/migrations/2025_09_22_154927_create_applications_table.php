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
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Personal Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('nationality');
            $table->date('birth_date');
            $table->text('address');
            $table->string('place_of_birth');
            $table->string('email');
            $table->enum('gender', ['male', 'female', 'other', 'prefer-not-to-say']);
            $table->string('mobile_number');
            
            // Educational Background
            $table->enum('education', [
                'elementary', 
                'high-school', 
                'vocational', 
                'college-undergraduate', 
                'college-graduate', 
                'masters', 
                'doctorate'
            ]);
            $table->string('school');
            $table->enum('course_program', [
                'automotive-technology',
                'electrical-installation',
                'welding-fabrication',
                'plumbing-technology',
                'electronics-technology',
                'hvac-technology',
                'computer-programming',
                'digital-marketing',
                'culinary-arts',
                'hospitality-management',
                'healthcare-assistant',
                'caregiving'
            ]);
            
            // Additional Information
            $table->enum('employment_status', [
                'employed', 
                'unemployed', 
                'student', 
                'self-employed', 
                'retired', 
                'ofw'
            ]);
            $table->string('occupation');
            $table->string('emergency_contact');
            $table->enum('emergency_relationship', [
                'parent', 
                'sibling', 
                'spouse', 
                'child', 
                'relative', 
                'friend', 
                'guardian', 
                'other'
            ]);
            $table->string('emergency_phone');
            $table->enum('tesda_voucher_eligibility', [
                '4ps-beneficiary',
                'pwd',
                'senior-citizen',
                'solo-parent',
                'ofw-dependent',
                'displaced-worker',
                'rebel-returnee',
                'student',
                'unemployed-graduate',
                'currently-employed',
                'not-eligible'
            ]);
            
            // Document paths
            $table->string('valid_id_path')->nullable();
            $table->string('transcript_path')->nullable();
            $table->string('resume_path')->nullable();
            $table->string('medical_certificate_path')->nullable();
            
            // Application status
            $table->enum('status', ['pending', 'under_review', 'approved', 'rejected'])->default('pending');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
