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
            // Add batch_id relationship
            $table->string('batch_id')->nullable()->after('user_id');
            $table->foreign('batch_id')->references('batch_id')->on('batches')->onDelete('set null');
            
            // PayMongo Integration Fields
            $table->string('paymongo_payment_id')->nullable()->unique()->after('reference_code');
            $table->string('paymongo_payment_intent_id')->nullable()->after('paymongo_payment_id');
            $table->string('paymongo_source_id')->nullable()->after('paymongo_payment_intent_id');
            $table->json('paymongo_response')->nullable()->after('paymongo_source_id');
            
            // Additional fields
            $table->string('currency')->default('PHP')->after('amount');
            $table->text('payment_description')->nullable()->after('currency');
            $table->text('notes')->nullable()->after('payment_description');
            
            // Rename 'method' to 'payment_method' and update enum
            $table->dropColumn('method');
            $table->enum('payment_method', [
                'gcash',
                'paymaya',
                'card',
                'grab_pay',
                'bank_transfer',
                'cash',
                'other'
            ])->nullable()->after('notes');
            
            // Rename 'status' to 'payment_status' and add more statuses
            $table->dropColumn('status');
            $table->enum('payment_status', [
                'pending',
                'processing',
                'paid',
                'failed',
                'cancelled',
                'refunded'
            ])->default('pending')->after('payment_method');
            
            // Additional timestamps
            $table->timestamp('failed_at')->nullable()->after('paid_at');
            $table->timestamp('refunded_at')->nullable()->after('failed_at');
            
            // Add indexes
            $table->index(['user_id', 'payment_status']);
            $table->index('paymongo_payment_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['batch_id']);
            $table->dropColumn([
                'batch_id',
                'paymongo_payment_id',
                'paymongo_payment_intent_id',
                'paymongo_source_id',
                'paymongo_response',
                'currency',
                'payment_description',
                'notes',
                'payment_method',
                'payment_status',
                'failed_at',
                'refunded_at'
            ]);
            
            $table->dropIndex(['user_id', 'payment_status']);
            $table->dropIndex(['paymongo_payment_id']);
            
            // Restore original columns
            $table->string('method')->nullable();
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
        });
    }
};
