<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('booking_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_batch_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();
        });

        // Migrate existing booking items
        $bookings = DB::table('bookings')->get();
        foreach ($bookings as $booking) {
            DB::table('booking_items')->insert([
                'booking_id' => $booking->id,
                'product_id' => $booking->product_id,
                'product_batch_id' => $booking->product_batch_id,
                'quantity' => $booking->quantity,
                'unit_price' => $booking->unit_price,
                'subtotal' => $booking->quantity * $booking->unit_price,
                'created_at' => $booking->created_at,
                'updated_at' => $booking->updated_at,
            ]);
        }

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropForeign(['product_batch_id']);
            $table->dropColumn(['product_id', 'product_batch_id', 'quantity', 'unit_price']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('product_batch_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 12, 2)->default(0);
        });

        // Migrate data back (only first item)
        $bookings = DB::table('bookings')->get();
        foreach ($bookings as $booking) {
            $item = DB::table('booking_items')->where('booking_id', $booking->id)->first();
            if ($item) {
                DB::table('bookings')->where('id', $booking->id)->update([
                    'product_id' => $item->product_id,
                    'product_batch_id' => $item->product_batch_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                ]);
            }
        }

        Schema::dropIfExists('booking_items');
    }
};
