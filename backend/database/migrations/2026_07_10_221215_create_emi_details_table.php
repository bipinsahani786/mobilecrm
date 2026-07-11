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
        Schema::create('emi_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $table->string('financier_name'); // e.g., Bajaj, TVS
            $table->decimal('down_payment', 12, 2)->default(0);
            $table->decimal('loan_amount', 12, 2);
            $table->decimal('processing_fee', 12, 2)->default(0); // Also known as file charge
            $table->integer('tenure_months')->nullable();
            $table->boolean('is_payout_received')->default(false); // To track if financier has paid the shop
            $table->date('payout_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emi_details');
    }
};
