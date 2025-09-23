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
        Schema::table('users', function (Blueprint $table) {
            // Personal information
            $table->string('nationality')->nullable()->after('gender');
            $table->string('marital_status')->nullable()->after('nationality');
            
            // Educational background
            $table->string('education_level')->nullable()->after('marital_status');
            $table->string('field_of_study')->nullable()->after('education_level');
            $table->string('institution_name')->nullable()->after('field_of_study');
            $table->year('graduation_year')->nullable()->after('institution_name');
            $table->decimal('gpa', 3, 2)->nullable()->after('graduation_year');
            
            // Additional information
            $table->string('computer_literacy')->nullable()->after('gpa');
            $table->json('languages')->nullable()->after('computer_literacy');
            $table->text('work_experience')->nullable()->after('languages');
            $table->text('career_goals')->nullable()->after('work_experience');
            $table->text('why_applying')->nullable()->after('career_goals');
            $table->text('additional_info')->nullable()->after('why_applying');
            
            // Document paths
            $table->string('valid_id_path')->nullable()->after('additional_info');
            $table->string('transcript_path')->nullable()->after('valid_id_path');
            $table->string('diploma_path')->nullable()->after('transcript_path');
            $table->string('passport_photo_path')->nullable()->after('diploma_path');
            
            // Application metadata
            $table->timestamp('application_submitted_at')->nullable()->after('passport_photo_path');
            $table->timestamp('application_reviewed_at')->nullable()->after('application_submitted_at');
            $table->text('application_notes')->nullable()->after('application_reviewed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
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
                'application_notes'
            ]);
        });
    }
};
