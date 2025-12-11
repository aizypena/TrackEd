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
        Schema::table('payments', function (Blueprint $table) {
            $table->string('xendit_charge_id')->nullable()->after('paymongo_response');
            $table->string('xendit_invoice_id')->nullable()->after('xendit_charge_id');
            $table->json('xendit_response')->nullable()->after('xendit_invoice_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['xendit_charge_id', 'xendit_invoice_id', 'xendit_response']);
        });
    }
};
