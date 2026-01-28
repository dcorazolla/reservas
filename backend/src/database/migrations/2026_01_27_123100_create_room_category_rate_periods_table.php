<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('room_category_rate_periods', function (Blueprint $table) {
            $table->id();

            $table->foreignId('room_category_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->date('start_date');
            $table->date('end_date');

            $table->decimal('base_one_adult', 10, 2)->nullable();
            $table->decimal('base_two_adults', 10, 2)->nullable();
            $table->decimal('additional_adult', 10, 2)->nullable();
            $table->decimal('child_price', 10, 2)->nullable();

            $table->string('description')->nullable();
            $table->timestamps();

            $table->unique([
                'room_category_id',
                'start_date',
                'end_date',
            ], 'room_category_rate_period_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_category_rate_periods');
    }
};
