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
            $table->boolean('voucher_eligible')->default(false)->after('batch_id');
            $table->text('approval_notes')->nullable()->after('voucher_eligible');
            $table->text('application_status_reason')->nullable()->after('approval_notes');
            $table->timestamp('approved_at')->nullable()->after('application_status_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['voucher_eligible', 'approval_notes', 'application_status_reason', 'approved_at']);
        });
    }
};
