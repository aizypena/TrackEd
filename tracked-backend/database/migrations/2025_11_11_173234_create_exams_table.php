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
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->string('exam_title');
            $table->string('exam_code')->unique();
            $table->unsignedBigInteger('program_id');
            $table->unsignedBigInteger('batch_id')->nullable();
            $table->enum('exam_type', ['written', 'practical', 'oral', 'online'])->default('written');
            $table->date('exam_date');
            $table->time('exam_time');
            $table->integer('duration'); // in minutes
            $table->decimal('passing_score', 8, 2);
            $table->decimal('total_score', 8, 2);
            $table->string('venue');
            $table->string('proctor')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['scheduled', 'ongoing', 'completed', 'cancelled'])->default('scheduled');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('program_id')->references('id')->on('programs')->onDelete('cascade');
            $table->foreign('batch_id')->references('id')->on('batches')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
