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
        if (!Schema::hasTable('partners')) {
            Schema::create('partners', function (Blueprint $table) use ($driver) {
                if ($driver === 'sqlite') {
                    $table->uuid('id')->primary();
                } else {
                    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                }
                $table->uuid('property_id')->nullable();
                $table->string('name');
                $table->string('email')->nullable();
                $table->string('phone')->nullable();
                $table->string('tax_id')->nullable();
                $table->text('address')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('invoices')) {
            Schema::create('invoices', function (Blueprint $table) use ($driver) {
                if ($driver === 'sqlite') {
                    $table->uuid('id')->primary();
                } else {
                    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                }
                $table->uuid('partner_id')->nullable();
                $table->uuid('property_id')->nullable();
                $table->string('number')->nullable();
                $table->date('issued_at')->nullable();
                $table->date('due_at')->nullable();
                $table->decimal('total', 12, 2)->default(0);
                $table->string('status')->default('draft');
                $table->timestamps();
                $table->foreign('partner_id')->references('id')->on('partners')->cascadeOnDelete();
            });
        }

        if (!Schema::hasTable('invoice_lines')) {
            Schema::create('invoice_lines', function (Blueprint $table) use ($driver) {
                if ($driver === 'sqlite') {
                    $table->uuid('id')->primary();
                } else {
                    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                }
                $table->uuid('invoice_id');
                $table->string('description');
                $table->integer('quantity')->default(1);
                $table->decimal('unit_price', 12, 2)->default(0);
                $table->decimal('line_total', 12, 2)->default(0);
                $table->timestamps();
                $table->foreign('invoice_id')->references('id')->on('invoices')->cascadeOnDelete();
            });
        }

        if (!Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) use ($driver) {
                if ($driver === 'sqlite') {
                    $table->uuid('id')->primary();
                } else {
                    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                }
                $table->uuid('partner_id')->nullable();
                $table->decimal('amount', 12, 2);
                $table->string('method')->nullable();
                $table->date('paid_at')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('invoice_line_payments')) {
            Schema::create('invoice_line_payments', function (Blueprint $table) use ($driver) {
                if ($driver === 'sqlite') {
                    $table->uuid('id')->primary();
                } else {
                    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                }
                $table->uuid('payment_id');
                $table->uuid('invoice_line_id');
                $table->decimal('amount', 12, 2);
                $table->timestamps();
                $table->foreign('payment_id')->references('id')->on('payments')->cascadeOnDelete();
                $table->foreign('invoice_line_id')->references('id')->on('invoice_lines')->cascadeOnDelete();
            });
        }

        if (!Schema::hasTable('financial_audit_logs')) {
            Schema::create('financial_audit_logs', function (Blueprint $table) use ($driver) {
                if ($driver === 'sqlite') {
                    $table->uuid('id')->primary();
                } else {
                    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                }
                $table->string('event_type');
                $table->jsonb('payload')->nullable();
                $table->string('actor_type')->nullable();
                $table->uuid('actor_id')->nullable();
                $table->string('resource_type')->nullable();
                $table->uuid('resource_id')->nullable();
                $table->string('hash')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_line_payments');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('invoice_lines');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('partners');
        Schema::dropIfExists('financial_audit_logs');
    }
};
