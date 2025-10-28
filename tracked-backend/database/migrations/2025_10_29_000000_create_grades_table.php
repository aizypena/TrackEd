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
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Student
            $table->foreignId('quiz_id')->nullable()->constrained()->onDelete('cascade'); // For written tests
            $table->foreignId('quiz_attempt_id')->nullable()->constrained()->onDelete('cascade'); // Link to quiz attempt
            
            // Assessment Type: written, oral, demonstration, observation
            $table->enum('assessment_type', ['written', 'oral', 'demonstration', 'observation']);
            $table->string('assessment_title'); // e.g., "Bartending Skills Assessment"
            
            // Scoring
            $table->decimal('score', 8, 2); // Points earned
            $table->decimal('total_points', 8, 2); // Maximum possible points
            $table->decimal('percentage', 5, 2)->nullable(); // Calculated percentage
            $table->decimal('passing_score', 5, 2)->default(75); // Required percentage to pass
            
            // Status: passed, failed, pending
            $table->enum('status', ['passed', 'failed', 'pending'])->default('pending');
            
            // Grading information
            $table->foreignId('graded_by')->nullable()->constrained('users')->onDelete('set null'); // Trainer who graded
            $table->timestamp('graded_at')->nullable();
            $table->text('feedback')->nullable(); // Trainer's feedback/comments
            
            // Attempt tracking
            $table->integer('attempt_number')->default(1);
            
            // Relationships
            $table->string('batch_id')->nullable();
            $table->foreign('batch_id')->references('batch_id')->on('batches')->onDelete('set null');
            $table->foreignId('program_id')->nullable()->constrained()->onDelete('set null');
            
            $table->timestamps();
            
            // Indexes for faster queries
            $table->index(['user_id', 'assessment_type']);
            $table->index(['batch_id', 'assessment_type']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
