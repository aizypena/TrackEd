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
        // MySQL doesn't allow direct ENUM modification, so we need to use raw SQL
        DB::statement("ALTER TABLE users MODIFY COLUMN application_status ENUM('pending', 'under_review', 'approved', 'rejected') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original ENUM values
        DB::statement("ALTER TABLE users MODIFY COLUMN application_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'");
    }
};
