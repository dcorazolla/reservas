<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Ensure pgcrypto available for gen_random_uuid()
        try {
            DB::statement('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
        } catch (\Throwable $e) {
            // ignore when not supported
        }

        $driver = Schema::getConnection()->getDriverName();
        if (!Schema::hasTable('financial_audit_logs')) {
            Schema::create('financial_audit_logs', function (Blueprint $table) use ($driver) {
                if ($driver === 'sqlite') {
                    $table->uuid('id')->primary();
                } else {
                    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                }

                $table->string('event_type');
                $table->string('resource_type')->nullable();
                $table->uuid('resource_id')->nullable();
                $table->text('payload')->nullable();
                $table->uuid('user_id')->nullable();
                $table->timestamps();

                $table->index(['resource_type', 'resource_id']);
                $table->index('event_type');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_audit_logs');
    }
};
