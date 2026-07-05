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
        Schema::table('businesses', function (Blueprint $table) {
            $table->string('phone_2')->nullable();
            $table->string('pincode')->nullable();
            $table->string('state')->nullable();
            $table->text('description')->nullable();
            $table->string('business_type')->nullable();
            $table->string('business_category')->nullable();
            $table->date('books_opening_date')->nullable();
            $table->string('signature_path')->nullable();
            $table->json('card_preferences')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropColumn([
                'phone_2',
                'pincode',
                'state',
                'description',
                'business_type',
                'business_category',
                'books_opening_date',
                'signature_path',
                'card_preferences'
            ]);
        });
    }
};
