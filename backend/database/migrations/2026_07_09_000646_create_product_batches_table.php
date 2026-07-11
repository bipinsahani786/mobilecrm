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
        Schema::create('product_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->integer('original_quantity');
            $table->integer('remaining_quantity');
            $table->decimal('purchase_price', 12, 2);
            $table->string('reference_type')->nullable(); // e.g. direct_add, purchase
            $table->unsignedBigInteger('reference_id')->nullable(); // ID of the supplier_purchase or null if direct
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_batches');
    }
};
