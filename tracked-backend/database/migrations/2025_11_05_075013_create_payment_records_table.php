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
        Schema::create('payment_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('student_id')->nullable();
            $table->string('receipt_number')->unique();
            $table->enum('payment_method', ['cash', 'credit_card', 'debit_card', 'gcash', 'maya']);
            $table->decimal('amount_paid', 10, 2);
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('payment_date');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('student_id');
            $table->index('receipt_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_records');
    }
};
