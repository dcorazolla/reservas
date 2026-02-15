<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('properties') && !Schema::hasColumn('properties', 'settings')) {
            Schema::table('properties', function (Blueprint $table) {
                $table->json('settings')->nullable()->after('timezone');
            });
        }

        if (!Schema::hasTable('reservation_state_changes')) {
            Schema::create('reservation_state_changes', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('reservation_id');
                $table->string('from_status')->nullable();
                $table->string('to_status');
                $table->uuid('user_id')->nullable();
                $table->json('context')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('properties') && Schema::hasColumn('properties', 'settings')) {
            Schema::table('properties', function (Blueprint $table) {
                $table->dropColumn('settings');
            });
        }

        Schema::dropIfExists('reservation_state_changes');
    }
};
