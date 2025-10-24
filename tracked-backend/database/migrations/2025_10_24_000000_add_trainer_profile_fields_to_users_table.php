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
        Schema::table('users', function (Blueprint $table) {
            // Add phone_number if it doesn't exist (aliasing mobile_number)
            if (!Schema::hasColumn('users', 'phone_number')) {
                $table->string('phone_number', 20)->nullable()->after('email');
            }
            
            // Add date_of_birth if it doesn't exist (aliasing birth_date)
            if (!Schema::hasColumn('users', 'date_of_birth')) {
                $table->date('date_of_birth')->nullable()->after('address');
            }
            
            // Add trainer-specific fields
            if (!Schema::hasColumn('users', 'specialization')) {
                $table->string('specialization')->nullable()->after('role');
            }
            
            if (!Schema::hasColumn('users', 'certifications')) {
                $table->json('certifications')->nullable()->after('specialization');
            }
            
            if (!Schema::hasColumn('users', 'experience')) {
                $table->string('experience')->nullable()->after('certifications');
            }
            
            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable()->after('experience');
            }
            
            if (!Schema::hasColumn('users', 'assigned_programs')) {
                $table->json('assigned_programs')->nullable()->after('bio');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = ['phone_number', 'date_of_birth', 'specialization', 'certifications', 'experience', 'bio', 'assigned_programs'];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
