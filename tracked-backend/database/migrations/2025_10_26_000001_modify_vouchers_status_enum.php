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
        // First, modify the status column to accept new values
        DB::statement("ALTER TABLE vouchers MODIFY COLUMN status ENUM('pending', 'issued', 'used', 'active') DEFAULT 'pending'");
        
        // Update existing data
        DB::table('vouchers')->where('status', 'pending')->update(['status' => 'active']);
        DB::table('vouchers')->where('status', 'issued')->update(['status' => 'active']);
        
        // Finally, modify the status column to only have the new values
        DB::statement("ALTER TABLE vouchers MODIFY COLUMN status ENUM('active', 'used') DEFAULT 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert the changes
        DB::statement("ALTER TABLE vouchers MODIFY COLUMN status ENUM('pending', 'issued', 'used') DEFAULT 'pending'");
        
        // Revert data
        DB::table('vouchers')->where('status', 'active')->update(['status' => 'pending']);
    }
};
