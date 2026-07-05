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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('brand');
            $table->string('model_name');
            $table->string('imei')->nullable();
            $table->string('serial_no')->nullable();
            $table->string('variant')->nullable();
            $table->decimal('purchase_price', 10, 2)->default(0);
            $table->decimal('mrp', 10, 2)->default(0);
            $table->integer('quantity')->default(0);
            $table->foreignId('supplier_id')->nullable(); // Will constrain later
            $table->enum('status', ['in_stock', 'sold', 'damaged'])->default('in_stock');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
