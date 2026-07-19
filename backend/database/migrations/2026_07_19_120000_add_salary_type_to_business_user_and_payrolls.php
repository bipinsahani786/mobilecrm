<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add salary_type and daily_salary to business_user pivot
        Schema::table('business_user', function (Blueprint $table) {
            $table->string('salary_type', 10)->default('monthly')->after('commission_rate'); // 'monthly' or 'daily'
            $table->decimal('daily_salary', 10, 2)->nullable()->after('salary_type');
        });

        // Add salary_type to payrolls so each record knows which type it was generated with
        Schema::table('payrolls', function (Blueprint $table) {
            $table->string('salary_type', 10)->default('monthly')->after('salary_components');
        });
    }

    public function down(): void
    {
        Schema::table('business_user', function (Blueprint $table) {
            $table->dropColumn(['salary_type', 'daily_salary']);
        });

        Schema::table('payrolls', function (Blueprint $table) {
            $table->dropColumn('salary_type');
        });
    }
};
