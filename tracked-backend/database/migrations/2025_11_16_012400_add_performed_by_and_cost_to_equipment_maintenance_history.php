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
        Schema::table('equipment_maintenance_history', function (Blueprint $table) {
            $table->string('performed_by')->nullable()->after('notes');
            $table->decimal('cost', 12, 2)->nullable()->after('performed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipment_maintenance_history', function (Blueprint $table) {
            $table->dropColumn(['performed_by', 'cost']);
        });
    }
};
