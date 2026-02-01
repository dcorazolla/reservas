<?php

namespace Tests\Unit;

use Tests\TestCase;

class KernelExistenceTest extends TestCase
{
    public function test_kernel_class_exists()
    {
        $this->assertTrue(class_exists(\App\Http\Kernel::class));
    }
}
