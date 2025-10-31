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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('batch_id')->nullable();
            $table->foreign('batch_id')->references('batch_id')->on('batches')->onDelete('set null');
            
            // Payment Details
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('PHP');
            $table->enum('payment_method', [
                'gcash',
                'paymaya', 
                'card',
                'grab_pay',
                'bank_transfer',
                'cash',
                'other'
            ])->nullable();
            
            // PayMongo Integration
            $table->string('paymongo_payment_id')->nullable()->unique();
            $table->string('paymongo_payment_intent_id')->nullable();
            $table->string('paymongo_source_id')->nullable();
            
            // Transaction Details
            $table->string('transaction_id')->nullable();
            $table->string('reference_number')->nullable();
            $table->enum('payment_status', [
                'pending',
                'processing',
                'paid',
                'failed',
                'cancelled',
                'refunded'
            ])->default('pending');
            
            // Metadata
            $table->text('payment_description')->nullable();
            $table->text('notes')->nullable();
            $table->json('paymongo_response')->nullable();
            
            // Timestamps
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'payment_status']);
            $table->index('paymongo_payment_id');
            $table->index('transaction_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
