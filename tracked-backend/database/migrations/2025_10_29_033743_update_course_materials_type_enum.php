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
        // For MySQL, we need to alter the enum type
        DB::statement("ALTER TABLE course_materials MODIFY COLUMN type ENUM('document', 'video', 'presentation', 'image', 'assessment') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE course_materials MODIFY COLUMN type ENUM('document', 'video', 'presentation', 'assessment') NOT NULL");
    }
};
