<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update existing 'instructor' roles to 'trainer'
        DB::table('users')
            ->where('role', 'instructor')
            ->update(['role' => 'trainer']);
            
        // Modify the role enum to replace 'instructor' with 'trainer'
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('applicant', 'student', 'trainer', 'staff', 'admin') NOT NULL DEFAULT 'applicant'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert 'trainer' roles back to 'instructor'
        DB::table('users')
            ->where('role', 'trainer')
            ->update(['role' => 'instructor']);
            
        // Revert the role enum back to 'instructor'
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('applicant', 'student', 'instructor', 'staff', 'admin') NOT NULL DEFAULT 'applicant'");
    }
};
