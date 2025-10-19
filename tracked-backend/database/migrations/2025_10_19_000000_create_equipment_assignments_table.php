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
        Schema::create('equipment_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('equipment')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->dateTime('assigned_at');
            $table->dateTime('due_date')->nullable();
            $table->dateTime('returned_at')->nullable();
            $table->enum('status', ['active', 'returned', 'overdue'])->default('active');
            $table->text('purpose')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('returned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->text('return_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_assignments');
    }
};
