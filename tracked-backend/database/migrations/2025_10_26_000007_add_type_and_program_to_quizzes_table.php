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
        Schema::table('quizzes', function (Blueprint $table) {
            $table->enum('type', ['written', 'oral', 'demonstration', 'observation'])->default('written')->after('description');
            $table->string('program')->nullable()->after('type');
            $table->integer('passing_score')->default(85)->after('retake_limit')->comment('passing score percentage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn(['type', 'program', 'passing_score']);
        });
    }
};
