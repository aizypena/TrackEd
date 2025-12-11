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
        // Change payment_method from enum to string for more flexibility
        // This allows for any payment method without migration changes
        DB::statement("ALTER TABLE payments MODIFY COLUMN payment_method VARCHAR(50) NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to enum if needed
        DB::statement("ALTER TABLE payments MODIFY COLUMN payment_method ENUM('gcash', 'paymaya', 'maya', 'card', 'grab_pay', 'bank_transfer', 'cash', 'other') NULL");
    }
};
