<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('room_rates', function (Blueprint $table) {
            $table->id();

            $table->foreignId('room_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->unsignedTinyInteger('people_count');
            $table->decimal('price_per_day', 10, 2);

            $table->timestamps();

            $table->unique(['room_id', 'people_count']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_rates');
    }
};
