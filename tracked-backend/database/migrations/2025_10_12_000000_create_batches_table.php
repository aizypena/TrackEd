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
        Schema::create('batches', function (Blueprint $table) {
            $table->id();
            $table->string('batch_id')->unique(); // Auto-generated batch ID (e.g., BATCH-2025-001)
            $table->foreignId('program_id')->constrained('programs')->onDelete('cascade');
            $table->json('schedule_days'); // Array of days: ['Monday', 'Tuesday', 'Wednesday']
            $table->time('schedule_time_start'); // Start time
            $table->time('schedule_time_end'); // End time
            $table->enum('status', ['not started', 'ongoing', 'finished'])->default('not started');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->integer('max_students')->default(30);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};
