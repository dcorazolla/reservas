<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('room_rate_periods', function (Blueprint $table) {
            $table->id();

            $table->foreignId('room_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->unsignedTinyInteger('people_count');

            $table->date('start_date');
            $table->date('end_date');

            $table->decimal('price_per_day', 10, 2);

            $table->string('description')->nullable();

            $table->timestamps();

            $table->unique([
                'room_id',
                'people_count',
                'start_date',
                'end_date',
            ], 'room_rate_period_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_rate_periods');
    }
};
