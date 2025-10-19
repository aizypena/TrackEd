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
        Schema::create('equipment', function (Blueprint $table) {
            $table->id();
            $table->string('equipment_code')->unique();
            $table->string('name');
            $table->string('category');
            $table->string('brand');
            $table->string('model');
            $table->string('serial_number')->nullable();
            $table->integer('quantity')->default(1);
            $table->integer('available')->default(1);
            $table->integer('in_use')->default(0);
            $table->integer('maintenance')->default(0);
            $table->integer('damaged')->default(0);
            $table->string('location');
            $table->enum('status', ['available', 'inUse', 'maintenance', 'damaged', 'retired'])->default('available');
            $table->enum('condition', ['excellent', 'good', 'fair', 'poor'])->default('good');
            $table->date('purchase_date')->nullable();
            $table->date('last_maintenance')->nullable();
            $table->date('next_maintenance')->nullable();
            $table->decimal('value', 12, 2)->default(0);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment');
    }
};
