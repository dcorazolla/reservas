<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            // Age thresholds and factors
            $table->unsignedTinyInteger('infant_max_age')->default(2)->after('timezone');
            $table->unsignedTinyInteger('child_max_age')->default(12)->after('infant_max_age');
            $table->decimal('child_factor', 5, 2)->default(0.50)->after('child_max_age');

            // Fixed pricing fields (per day)
            $table->decimal('base_one_adult', 10, 2)->nullable()->after('child_factor');
            $table->decimal('base_two_adults', 10, 2)->nullable()->after('base_one_adult');
            $table->decimal('additional_adult', 10, 2)->nullable()->after('base_two_adults');
            $table->decimal('child_price', 10, 2)->nullable()->after('additional_adult');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'infant_max_age',
                'child_max_age',
                'child_factor',
                'base_one_adult',
                'base_two_adults',
                'additional_adult',
                'child_price',
            ]);
        });
    }
};
