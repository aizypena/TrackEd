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
        // Fix any equipment where available > quantity or in_use > quantity
        DB::statement('
            UPDATE equipment 
            SET available = LEAST(available, quantity),
                in_use = LEAST(in_use, quantity)
            WHERE available > quantity OR in_use > quantity
        ');
        
        // Ensure the sum of available, in_use, maintenance, and damaged equals quantity
        DB::statement('
            UPDATE equipment 
            SET available = quantity - (in_use + maintenance + damaged)
            WHERE (available + in_use + maintenance + damaged) != quantity
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse this data fix
    }
};
