<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Ensure pgcrypto is available for gen_random_uuid()
        try {
            DB::statement('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
        } catch (\Throwable $e) {
            // ignore if not supported
        }
        // Properties with full pricing and thresholds
        if (!Schema::hasTable('properties')) {
            $driver = Schema::getConnection()->getDriverName();
            Schema::create('properties', function (Blueprint $table) use ($driver) {
                if ($driver === 'sqlite') {
                    $table->uuid('id')->primary();
                } else {
                    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                }
                $table->string('name');
                $table->string('timezone')->default('America/Sao_Paulo');
                $table->unsignedTinyInteger('infant_max_age')->default(2);
                $table->unsignedTinyInteger('child_max_age')->default(12);
                $table->decimal('child_factor', 5, 2)->default(0.50);
                $table->decimal('base_one_adult', 10, 2)->nullable();
                $table->decimal('base_two_adults', 10, 2)->nullable();
                $table->decimal('additional_adult', 10, 2)->nullable();
                $table->decimal('child_price', 10, 2)->nullable();
                $table->timestamps();
            });
        }

        // Add property_id to users referencing properties
        if (Schema::hasTable('users') && !Schema::hasColumn('users', 'property_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->uuid('property_id')->nullable()->after('id');
            });
            Schema::table('users', function (Blueprint $table) {
                $table->foreign('property_id')->references('id')->on('properties')->cascadeOnDelete();
            });
        }

        // Room categories
        if (!Schema::hasTable('room_categories')) {
            Schema::create('room_categories', function (Blueprint $table) use ($driver) {
                if ($driver === 'sqlite') {
                    $table->uuid('id')->primary();
                } else {
                    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                }
                $table->string('name')->unique();
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        // Rooms with full fields and relations
        if (!Schema::hasTable('rooms')) {
            Schema::create('rooms', function (Blueprint $table) use ($driver) {
                if ($driver === 'sqlite') {
                    $table->uuid('id')->primary();
                } else {
                    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                }
                $table->uuid('property_id');
                $table->uuid('room_category_id')->nullable();
                $table->foreign('property_id')->references('id')->on('properties')->cascadeOnDelete();
                $table->foreign('room_category_id')->references('id')->on('room_categories')->nullOnDelete();
                $table->string('name');
                $table->string('number', 10)->nullable();
                $table->unsignedTinyInteger('capacity')->default(1);
                $table->unsignedTinyInteger('beds')->default(1);
                $table->boolean('active')->default(true);
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // Room base rates by people
        if (!Schema::hasTable('room_rates')) {
            Schema::create('room_rates', function (Blueprint $table) use ($driver) {
                if ($driver === 'sqlite') {
                    $table->uuid('id')->primary();
                } else {
                    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                }
                $table->uuid('room_id');
                $table->foreign('room_id')->references('id')->on('rooms')->cascadeOnDelete();
                $table->unsignedTinyInteger('people_count');
                $table->decimal('price_per_day', 10, 2);
                $table->timestamps();
                $table->unique(['room_id', 'people_count']);
            });
        }

        // Room rate periods by people
        if (!Schema::hasTable('room_rate_periods')) {
            Schema::create('room_rate_periods', function (Blueprint $table) use ($driver) {
                if ($driver === 'sqlite') {
                    $table->uuid('id')->primary();
                } else {
                    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                }
                $table->uuid('room_id');
                $table->foreign('room_id')->references('id')->on('rooms')->cascadeOnDelete();
                $table->unsignedTinyInteger('people_count');
                $table->date('start_date');
                $table->date('end_date');
                $table->decimal('price_per_day', 10, 2);
                $table->string('description')->nullable();
                $table->timestamps();
                $table->unique(['room_id', 'people_count', 'start_date', 'end_date'], 'room_rate_period_unique');
            });
        }

        // Category base rates
        if (!Schema::hasTable('room_category_rates')) {
            Schema::create('room_category_rates', function (Blueprint $table) use ($driver) {
                if ($driver === 'sqlite') {
                    $table->uuid('id')->primary();
                } else {
                    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                }
                $table->uuid('room_category_id');
                $table->foreign('room_category_id')->references('id')->on('room_categories')->cascadeOnDelete();
                $table->decimal('base_one_adult', 10, 2)->nullable();
                $table->decimal('base_two_adults', 10, 2)->nullable();
                $table->decimal('additional_adult', 10, 2)->nullable();
                $table->decimal('child_price', 10, 2)->nullable();
                $table->timestamps();
            });
        }

        // Category rate periods
        if (!Schema::hasTable('room_category_rate_periods')) {
            Schema::create('room_category_rate_periods', function (Blueprint $table) use ($driver) {
                if ($driver === 'sqlite') {
                    $table->uuid('id')->primary();
                } else {
                    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                }
                $table->uuid('room_category_id');
                $table->foreign('room_category_id')->references('id')->on('room_categories')->cascadeOnDelete();
                $table->date('start_date');
                $table->date('end_date');
                $table->decimal('base_one_adult', 10, 2)->nullable();
                $table->decimal('base_two_adults', 10, 2)->nullable();
                $table->decimal('additional_adult', 10, 2)->nullable();
                $table->decimal('child_price', 10, 2)->nullable();
                $table->string('description')->nullable();
                $table->timestamps();
                $table->unique(['room_category_id', 'start_date', 'end_date'], 'room_category_rate_period_unique');
            });
        }

        // Reservations with counts and contacts
        if (!Schema::hasTable('reservations')) {
            Schema::create('reservations', function (Blueprint $table) use ($driver) {
                if ($driver === 'sqlite') {
                    $table->uuid('id')->primary();
                } else {
                    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                }
                $table->uuid('room_id');
                $table->foreign('room_id')->references('id')->on('rooms')->cascadeOnDelete();
                $table->unsignedTinyInteger('adults_count')->default(1);
                $table->unsignedTinyInteger('children_count')->default(0);
                $table->unsignedTinyInteger('infants_count')->default(0);
                $table->string('guest_name');
                $table->string('email')->nullable();
                $table->string('phone')->nullable();
                $table->date('start_date');
                $table->date('end_date');
                $table->string('status')->default('pre-reserva');
                $table->decimal('total_value', 10, 2)->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
        Schema::dropIfExists('room_category_rate_periods');
        Schema::dropIfExists('room_category_rates');
        Schema::dropIfExists('room_rate_periods');
        Schema::dropIfExists('room_rates');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('room_categories');
        Schema::dropIfExists('properties');
    }
};
