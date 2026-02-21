<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        // Tabela: cancellation_policies (1 política por propriedade)
        if (!Schema::hasTable('cancellation_policies')) {
            Schema::create('cancellation_policies', function (Blueprint $table) use ($driver) {
                if ($driver === 'sqlite') {
                    $table->uuid('id')->primary();
                } else {
                    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                }

                $table->uuid('property_id')->unique();
                $table->string('name')->default('Política Padrão');
                $table->text('description')->nullable();
                $table->enum('type', ['fixed_timeline', 'percentage_cascade', 'free_until_date', 'seasonal']);
                $table->json('config')->nullable();
                $table->boolean('active')->default(true);
                $table->date('applies_from')->useCurrent();
                $table->date('applies_to')->nullable();
                $table->uuid('created_by_id')->nullable();
                $table->timestamps();

                // Foreign keys
                $table->foreign('property_id')->references('id')->on('properties')->cascadeOnDelete();
                $table->foreign('created_by_id')->references('id')->on('users')->nullOnDelete();
            });
        }

        // Tabela: cancellation_refund_rules (N regras por política)
        if (!Schema::hasTable('cancellation_refund_rules')) {
            Schema::create('cancellation_refund_rules', function (Blueprint $table) use ($driver) {
                if ($driver === 'sqlite') {
                    $table->uuid('id')->primary();
                } else {
                    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                }

                $table->uuid('policy_id');
                $table->unsignedSmallInteger('days_before_checkin_min');
                $table->unsignedSmallInteger('days_before_checkin_max');
                $table->decimal('refund_percent', 5, 2);
                $table->enum('penalty_type', ['fixed', 'percentage'])->default('fixed');
                $table->decimal('penalty_amount', 10, 2)->nullable();
                $table->string('label')->nullable();
                $table->unsignedSmallInteger('priority')->default(0);
                $table->timestamps();

                // Foreign key
                $table->foreign('policy_id')->references('id')->on('cancellation_policies')->cascadeOnDelete();

                // Índices
                $table->index(['policy_id', 'priority']);
                $table->unique(['policy_id', 'days_before_checkin_min', 'days_before_checkin_max']);
            });
        }

        // Adicionar colunas em reservations para tracking de cancelamento
        if (Schema::hasTable('reservations')) {
            if (!Schema::hasColumn('reservations', 'cancellation_refund_calc')) {
                Schema::table('reservations', function (Blueprint $table) {
                    $table->json('cancellation_refund_calc')->nullable()->after('notes');
                    $table->text('cancellation_reason')->nullable()->after('cancellation_refund_calc');
                    $table->timestamp('cancelled_at')->nullable()->after('cancellation_reason');
                });
            }
        }
    }

    public function down(): void
    {
        // Drop foreign key constraints first
        if (Schema::hasTable('cancellation_refund_rules')) {
            Schema::table('cancellation_refund_rules', function (Blueprint $table) {
                $table->dropForeign(['policy_id']);
            });
        }

        if (Schema::hasTable('cancellation_policies')) {
            Schema::table('cancellation_policies', function (Blueprint $table) {
                $table->dropForeign(['property_id']);
                $table->dropForeign(['created_by_id']);
            });
        }

        // Drop tables
        Schema::dropIfExists('cancellation_refund_rules');
        Schema::dropIfExists('cancellation_policies');

        // Drop columns from reservations
        if (Schema::hasTable('reservations') && Schema::hasColumn('reservations', 'cancellation_refund_calc')) {
            Schema::table('reservations', function (Blueprint $table) {
                $table->dropColumn(['cancellation_refund_calc', 'cancellation_reason', 'cancelled_at']);
            });
        }
    }
};
