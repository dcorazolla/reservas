<?php

namespace Tests\Unit;

use Tests\TestCase;

class FinancialAuditLogExistenceTest extends TestCase
{
    public function test_financial_audit_log_class_exists()
    {
        $this->assertTrue(class_exists(\App\Models\FinancialAuditLog::class));
    }
}
