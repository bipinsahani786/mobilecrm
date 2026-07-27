<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('booking_number');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_batch_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('total_amount', 12, 2);
            $table->decimal('advance_amount', 12, 2)->default(0);
            $table->enum('status', ['booked', 'converted', 'cancelled', 'expired'])->default('booked');
            $table->foreignId('converted_sale_id')->nullable()->constrained('sales')->onDelete('set null');
            $table->text('notes')->nullable();
            $table->date('booking_date');
            $table->date('expected_delivery_date')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->decimal('refund_amount', 12, 2)->nullable();
            $table->timestamps();

            $table->unique(['business_id', 'booking_number']);
            $table->index(['business_id', 'status']);
            $table->index(['business_id', 'customer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
