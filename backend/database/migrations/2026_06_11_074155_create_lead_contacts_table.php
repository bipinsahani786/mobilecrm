<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lead_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained('leads')->cascadeOnDelete();
            $table->string('contacted_by')->default('Superadmin');
            $table->timestamp('contacted_at');
            $table->enum('outcome', ['called', 'emailed', 'whatsapp', 'visited', 'no_answer'])->default('called');
            $table->text('notes')->nullable();
            $table->timestamp('next_contact_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lead_contacts');
    }
};
