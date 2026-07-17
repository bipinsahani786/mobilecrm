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
        Schema::table('sales', function (Blueprint $table) {
            $table->dropUnique(['invoice_number']);
            $table->unique(['business_id', 'invoice_number']);
        });

        Schema::table('supplier_purchases', function (Blueprint $table) {
            // Because supplier_purchases belongs to supplier which belongs to business, 
            // adding business_id makes scoping easier, but let's just add it for the constraint
            $table->foreignId('business_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->string('purchase_number')->nullable()->after('supplier_id');
        });

        // Backfill business_id (database-agnostic subquery)
        \Illuminate\Support\Facades\DB::table('supplier_purchases')
            ->update([
                'business_id' => \Illuminate\Support\Facades\DB::table('suppliers')
                    ->select('business_id')
                    ->whereColumn('id', 'supplier_purchases.supplier_id')
                    ->limit(1)
            ]);

        Schema::table('supplier_purchases', function (Blueprint $table) {
            // We can't strictly enforce unique per business without business_id on this table.
            $table->unique(['business_id', 'purchase_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropUnique(['business_id', 'invoice_number']);
            $table->unique('invoice_number');
        });

        Schema::table('supplier_purchases', function (Blueprint $table) {
            $table->dropUnique(['business_id', 'purchase_number']);
            $table->dropColumn(['business_id', 'purchase_number']);
        });
    }
};
