<?php

namespace Tests\Unit;

use Tests\TestCase;

class InvoiceRepositoryInterfaceTest extends TestCase
{
    public function test_interface_exists()
    {
        $this->assertTrue(interface_exists(\App\Repositories\InvoiceRepositoryInterface::class));
    }
}
