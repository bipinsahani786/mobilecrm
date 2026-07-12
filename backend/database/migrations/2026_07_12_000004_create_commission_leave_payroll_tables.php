<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $table->decimal('sale_amount', 12, 2);
            $table->decimal('commission_rate', 5, 2);
            $table->decimal('commission_amount', 10, 2);
            $table->timestamps();
        });

        Schema::create('leave_policies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->string('leave_type', 50);
            $table->decimal('monthly_quota', 4, 1)->default(0);
            $table->boolean('is_paid')->default(true);
            $table->timestamps();
        });

        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('leave_type', 50);
            $table->date('from_date');
            $table->date('to_date');
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamps();

            $table->foreign('approved_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('month', 7); // "2026-07"
            $table->unsignedInteger('total_days')->default(0);
            $table->unsignedInteger('present_days')->default(0);
            $table->unsignedInteger('absent_days')->default(0);
            $table->unsignedInteger('half_days')->default(0);
            $table->unsignedInteger('paid_leaves')->default(0);
            $table->unsignedInteger('unpaid_leaves')->default(0);
            $table->unsignedInteger('week_offs')->default(0);
            $table->unsignedInteger('holidays')->default(0);
            $table->decimal('base_salary', 10, 2)->default(0);
            $table->decimal('per_day_salary', 10, 2)->default(0);
            $table->decimal('deduction', 10, 2)->default(0);
            $table->decimal('total_commission', 10, 2)->default(0);
            $table->decimal('bonus', 10, 2)->default(0);
            $table->decimal('advance_deduction', 10, 2)->default(0);
            $table->decimal('final_salary', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->enum('status', ['draft', 'confirmed', 'paid'])->default('draft');
            $table->date('paid_date')->nullable();
            $table->timestamps();

            $table->unique(['business_id', 'user_id', 'month']);
        });

        Schema::create('salary_advances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->date('given_date');
            $table->string('deduct_in_month', 7)->nullable();
            $table->boolean('is_deducted')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_advances');
        Schema::dropIfExists('payrolls');
        Schema::dropIfExists('leave_requests');
        Schema::dropIfExists('leave_policies');
        Schema::dropIfExists('sale_commissions');
    }
};
