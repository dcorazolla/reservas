<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        try {
            DB::statement('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
        } catch (\Throwable $e) {
        }

        $driver = Schema::getConnection()->getDriverName();
        if (!Schema::hasTable('room_blocks')) {
            Schema::create('room_blocks', function (Blueprint $table) use ($driver) {
                if ($driver === 'sqlite') {
                    $table->uuid('id')->primary();
                } else {
                    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                }
                $table->uuid('room_id');
                $table->date('start_date');
                $table->date('end_date');
                $table->string('reason')->nullable();
                $table->uuid('partner_id')->nullable();
                $table->uuid('created_by')->nullable();
                $table->timestamps();

                $table->foreign('room_id')->references('id')->on('rooms')->cascadeOnDelete();
                $table->index(['room_id', 'start_date', 'end_date']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('room_blocks');
    }
};
