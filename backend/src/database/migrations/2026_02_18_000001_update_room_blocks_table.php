<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('room_blocks')) {
            Schema::table('room_blocks', function (Blueprint $table) {
                // Add property_id column if not exists
                if (!Schema::hasColumn('room_blocks', 'property_id')) {
                    $table->uuid('property_id')->nullable()->after('id');
                    $table->foreign('property_id')->references('id')->on('properties')->cascadeOnDelete();
                }

                // Add type column if not exists
                if (!Schema::hasColumn('room_blocks', 'type')) {
                    $table->enum('type', ['maintenance', 'cleaning', 'private', 'custom'])
                        ->default('maintenance')
                        ->after('end_date');
                }

                // Add recurrence column if not exists
                if (!Schema::hasColumn('room_blocks', 'recurrence')) {
                    $table->enum('recurrence', ['none', 'daily', 'weekly', 'monthly'])
                        ->default('none')
                        ->after('type');
                }

                // Drop partner_id if exists (replaced by type system)
                if (Schema::hasColumn('room_blocks', 'partner_id')) {
                    $table->dropForeign(['partner_id']);
                    $table->dropColumn('partner_id');
                }

                // Add index for type and recurrence queries
                $table->index(['property_id', 'type']);
                $table->index(['property_id', 'recurrence']);
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('room_blocks')) {
            Schema::table('room_blocks', function (Blueprint $table) {
                if (Schema::hasColumn('room_blocks', 'property_id')) {
                    $table->dropForeign(['property_id']);
                    $table->dropColumn('property_id');
                }

                if (Schema::hasColumn('room_blocks', 'type')) {
                    $table->dropColumn('type');
                }

                if (Schema::hasColumn('room_blocks', 'recurrence')) {
                    $table->dropColumn('recurrence');
                }

                // Re-add partner_id if needed for rollback
                $table->uuid('partner_id')->nullable()->after('reason');
                $table->foreign('partner_id')->references('id')->on('partners')->cascadeOnDelete();
            });
        }
    }
};
