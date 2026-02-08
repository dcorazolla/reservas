<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('partners')) {
            Schema::table('partners', function (Blueprint $table) {
                if (!Schema::hasColumn('partners', 'billing_rule')) {
                    $table->string('billing_rule')->default('none');
                }
                if (!Schema::hasColumn('partners', 'partner_discount_percent')) {
                    $table->decimal('partner_discount_percent', 5, 2)->nullable();
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('partners')) {
            Schema::table('partners', function (Blueprint $table) {
                if (Schema::hasColumn('partners', 'billing_rule')) {
                    $table->dropColumn('billing_rule');
                }
                if (Schema::hasColumn('partners', 'partner_discount_percent')) {
                    $table->dropColumn('partner_discount_percent');
                }
            });
        }
    }
};
