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
            $table->decimal('total_profit', 12, 2)->default(0)->after('final_amount');
            $table->decimal('staff_commission', 10, 2)->default(0)->after('total_profit');
            $table->decimal('net_profit', 12, 2)->default(0)->after('staff_commission');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn(['total_profit', 'staff_commission', 'net_profit']);
        });
    }
};
