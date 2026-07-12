<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('business_user', function (Blueprint $table) {
            $table->string('role', 50)->default('staff')->after('user_id');
            $table->decimal('monthly_salary', 10, 2)->default(0)->after('role');
            $table->decimal('commission_rate', 5, 2)->default(0)->after('monthly_salary');
            $table->date('join_date')->nullable()->after('commission_rate');
            $table->string('status', 20)->default('active')->after('join_date');
        });
    }

    public function down(): void
    {
        Schema::table('business_user', function (Blueprint $table) {
            $table->dropColumn(['role', 'monthly_salary', 'commission_rate', 'join_date', 'status']);
        });
    }
};
