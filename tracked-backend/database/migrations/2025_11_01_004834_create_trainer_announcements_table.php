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
        Schema::create('trainer_announcements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('trainer_id');
            $table->string('title');
            $table->text('content');
            $table->enum('priority', ['low', 'normal', 'high'])->default('normal');
            $table->enum('target_type', ['all', 'specific'])->default('all');
            $table->timestamps();
            
            $table->foreign('trainer_id')->references('id')->on('users')->onDelete('cascade');
        });
        
        // Create pivot table for announcement-batch relationships
        Schema::create('announcement_batches', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('announcement_id');
            $table->string('batch_id'); // batch_id is string in batches table
            $table->timestamps();
            
            $table->foreign('announcement_id')->references('id')->on('trainer_announcements')->onDelete('cascade');
            $table->foreign('batch_id')->references('batch_id')->on('batches')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcement_batches');
        Schema::dropIfExists('trainer_announcements');
    }
};
