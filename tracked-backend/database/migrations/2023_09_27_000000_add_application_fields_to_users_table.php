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
            // Add columns only if they don't exist
            if (!Schema::hasColumn('users', 'course_program')) {
                $table->string('course_program')->nullable();
            }
            if (!Schema::hasColumn('users', 'education_level')) {
                $table->string('education_level')->nullable();
            }
            if (!Schema::hasColumn('users', 'institution_name')) {
                $table->string('institution_name')->nullable();
            }
            if (!Schema::hasColumn('users', 'nationality')) {
                $table->string('nationality')->nullable();
            }
            if (!Schema::hasColumn('users', 'place_of_birth')) {
                $table->string('place_of_birth')->nullable();
            }
            if (!Schema::hasColumn('users', 'emergency_relationship')) {
                $table->string('emergency_relationship')->nullable();
            }
            if (!Schema::hasColumn('users', 'employment_status')) {
                $table->string('employment_status')->nullable();
            }
            if (!Schema::hasColumn('users', 'occupation')) {
                $table->string('occupation')->nullable();
            }
            if (!Schema::hasColumn('users', 'valid_id_path')) {
                $table->string('valid_id_path')->nullable();
            }
            if (!Schema::hasColumn('users', 'transcript_path')) {
                $table->string('transcript_path')->nullable();
            }
            if (!Schema::hasColumn('users', 'diploma_path')) {
                $table->string('diploma_path')->nullable();
            }
            if (!Schema::hasColumn('users', 'passport_photo_path')) {
                $table->string('passport_photo_path')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = [
                'course_program',
                'education_level',
                'institution_name',
                'nationality',
                'place_of_birth',
                'emergency_relationship',
                'employment_status',
                'occupation',
                'valid_id_path',
                'transcript_path',
                'diploma_path',
                'passport_photo_path'
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};