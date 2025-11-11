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
        Schema::create('tesda_assessments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('trainer_id');
            $table->string('student_id');
            $table->string('student_name');
            $table->unsignedBigInteger('program_id');
            $table->unsignedBigInteger('batch_id');
            $table->date('assessment_date');
            $table->string('tesda_assessor')->nullable();
            $table->enum('result', ['competent', 'not_competent', 'pending'])->default('pending');
            $table->text('remarks')->nullable();
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('trainer_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('program_id')->references('id')->on('programs')->onDelete('cascade');
            
            // Indexes for better query performance
            $table->index('trainer_id');
            $table->index('program_id');
            $table->index('batch_id');
            $table->index('result');
            $table->index('assessment_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tesda_assessments');
    }
};
