<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->unsignedTinyInteger('adults_count')->default(1)->after('room_id');
            $table->unsignedTinyInteger('children_count')->default(0)->after('adults_count');
            $table->unsignedTinyInteger('infants_count')->default(0)->after('children_count');
            $table->string('email')->nullable()->after('guest_name');
            $table->string('phone')->nullable()->after('email');

            // Legacy field people_count may remain for compatibility
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['adults_count', 'children_count', 'infants_count', 'email', 'phone']);
        });
    }
};
