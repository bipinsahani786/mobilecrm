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
        Schema::table('emi_details', function (Blueprint $table) {
            $table->decimal('monthly_installment_amount', 12, 2)->nullable()->after('tenure_months');
            $table->date('first_emi_date')->nullable()->after('monthly_installment_amount');
        });

        Schema::create('emi_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('emi_detail_id')->constrained()->cascadeOnDelete();
            $table->integer('installment_number');
            $table->decimal('amount', 12, 2);
            $table->date('due_date');
            $table->string('status')->default('pending'); // pending, paid
            $table->date('paid_on')->nullable();
            $table->foreignId('payment_id')->nullable()->constrained('sale_payments')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emi_installments');
        
        Schema::table('emi_details', function (Blueprint $table) {
            $table->dropColumn(['monthly_installment_amount', 'first_emi_date']);
        });
    }
};
