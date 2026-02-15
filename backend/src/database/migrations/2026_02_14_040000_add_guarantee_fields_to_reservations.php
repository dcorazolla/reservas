<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('guarantee_type')->nullable()->after('price_override');
            $table->string('payment_status')->nullable()->after('guarantee_type');
            $table->timestamp('guarantee_at')->nullable()->after('payment_status');
            $table->string('guarantee_token')->nullable()->after('guarantee_at');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['guarantee_type', 'payment_status', 'guarantee_at', 'guarantee_token']);
        });
    }
};
