<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            $table->foreignId('sale_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->nullable()->constrained()->onDelete('set null');
            $table->string('return_number');
            $table->decimal('total_return_amount', 12, 2);
            $table->enum('refund_type', ['refund', 'credit_note'])->default('refund');
            $table->decimal('refund_amount', 12, 2)->default(0);
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['approved'])->default('approved');
            $table->date('return_date');
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->unique(['business_id', 'return_number']);
            $table->index(['business_id', 'sale_id']);
            $table->index(['business_id', 'customer_id']);
        });

        Schema::create('sale_return_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_return_id')->constrained()->onDelete('cascade');
            $table->foreignId('sale_item_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_batch_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('return_amount', 12, 2);
            $table->timestamps();
        });

        // Credit notes table for tracking customer credits
        Schema::create('customer_credits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->foreignId('sale_return_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('amount', 12, 2);
            $table->decimal('used_amount', 12, 2)->default(0);
            $table->decimal('balance', 12, 2);
            $table->string('credit_number');
            $table->text('notes')->nullable();
            $table->enum('status', ['active', 'used', 'expired'])->default('active');
            $table->timestamps();

            $table->unique(['business_id', 'credit_number']);
            $table->index(['business_id', 'customer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_credits');
        Schema::dropIfExists('sale_return_items');
        Schema::dropIfExists('sale_returns');
    }
};
