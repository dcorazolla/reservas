<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('room_rate_periods', function (Blueprint $table) {
            $table->decimal('base_one_adult', 10, 2)->nullable()->after('room_id');
            $table->decimal('base_two_adults', 10, 2)->nullable()->after('base_one_adult');
            $table->decimal('additional_adult', 10, 2)->nullable()->after('base_two_adults');
            $table->decimal('child_price', 10, 2)->nullable()->after('additional_adult');

            // Legacy columns people_count/price_per_day remain for compatibility but will be ignored.
        });
    }

    public function down(): void
    {
        Schema::table('room_rate_periods', function (Blueprint $table) {
            $table->dropColumn([
                'base_one_adult',
                'base_two_adults',
                'additional_adult',
                'child_price',
            ]);
        });
    }
};
