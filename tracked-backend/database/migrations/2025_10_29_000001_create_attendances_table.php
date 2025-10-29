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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('batch_id');
            $table->foreign('batch_id')->references('batch_id')->on('batches')->onDelete('cascade');
            $table->date('date');
            $table->enum('status', ['present', 'late', 'absent', 'excused'])->default('present');
            $table->dateTime('time_in')->nullable();
            $table->dateTime('time_out')->nullable();
            $table->decimal('total_hours', 5, 2)->default(0);
            $table->text('remarks')->nullable();
            $table->foreignId('marked_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            // Add indexes for faster queries
            $table->index(['user_id', 'date']);
            $table->index(['batch_id', 'date']);
            $table->index('date');
            
            // Unique constraint to prevent duplicate attendance records
            $table->unique(['user_id', 'batch_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
