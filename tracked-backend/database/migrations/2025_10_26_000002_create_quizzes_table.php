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
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('batch_id', 50)->nullable();
            $table->unsignedBigInteger('program_id')->nullable();
            $table->integer('total_points')->default(0);
            $table->integer('time_limit')->nullable()->comment('in minutes');
            $table->integer('retake_limit')->default(1)->comment('max number of attempts allowed');
            $table->enum('status', ['active', 'draft', 'archived'])->default('active');
            $table->timestamps();
            
            // Add foreign key constraints if needed
            // $table->foreign('batch_id')->references('batch_id')->on('batches')->onDelete('set null');
            // $table->foreign('program_id')->references('id')->on('programs')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
