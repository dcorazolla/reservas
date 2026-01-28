<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->decimal('base_price_for_two', 10, 2)
                ->nullable()
                ->after('timezone');

            $table->decimal('additional_price_per_person', 10, 2)
                ->nullable()
                ->after('base_price_for_two');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn(['base_price_for_two', 'additional_price_per_person']);
        });
    }
};
