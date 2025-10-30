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
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->string('certificate_number')->unique();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('program_id');
            $table->date('issued_date');
            $table->unsignedBigInteger('issued_by');
            $table->decimal('grade', 5, 2)->nullable();
            $table->decimal('attendance_rate', 5, 2)->nullable();
            $table->string('status')->default('issued'); // issued, revoked, expired
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('issued_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
