<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('room_blocks')) {
            // Drop partner_id and its foreign key if they exist (use raw SQL to be safe)
            if (Schema::hasColumn('room_blocks', 'partner_id')) {
                $dbDriver = DB::getDriverName();
                
                if ($dbDriver === 'pgsql') {
                    // PostgreSQL: check if constraint exists before dropping
                    DB::statement("
                        DO \$\$ 
                        BEGIN
                            IF EXISTS (
                                SELECT 1 FROM information_schema.table_constraints 
                                WHERE table_name = 'room_blocks' 
                                AND constraint_name = 'room_blocks_partner_id_foreign'
                            ) THEN
                                ALTER TABLE room_blocks DROP CONSTRAINT room_blocks_partner_id_foreign;
                            END IF;
                        END \$\$;
                    ");
                }
                
                // Drop column
                Schema::table('room_blocks', function (Blueprint $table) {
                    $table->dropColumn('partner_id');
                });
            }

            Schema::table('room_blocks', function (Blueprint $table) {
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

                // Add indexes useful for queries
                $table->index(['type']);
                $table->index(['recurrence']);
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('room_blocks')) {
            Schema::table('room_blocks', function (Blueprint $table) {
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
