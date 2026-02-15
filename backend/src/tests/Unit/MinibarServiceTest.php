<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Product;
use App\Models\MinibarConsumption;
use App\Models\FinancialAuditLog;
use App\Services\MinibarService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;

class MinibarServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_consumption_decrements_stock_and_creates_audit()
    {
        $product = Product::create([
            'name' => 'Soda Can',
            'sku' => 'SODA-1',
            'price' => 3.50,
            'stock' => 5,
            'active' => true,
        ]);

        $service = new MinibarService();
        $cons = $service->createConsumption([
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 3.50,
            'reservation_id' => 'r1',
        ]);

        $this->assertInstanceOf(MinibarConsumption::class, $cons);

        $product->refresh();
        $this->assertEquals(3, $product->stock);

        $this->assertDatabaseHas('financial_audit_logs', [
            'event_type' => 'minibar.stock_decremented',
            'resource_type' => 'product',
            'resource_id' => $product->id,
        ]);
    }

    public function test_create_consumption_insufficient_stock_creates_audit_and_throws()
    {
        $product = Product::create([
            'name' => 'Chocolate',
            'sku' => 'CHOC-1',
            'price' => 2.00,
            'stock' => 1,
            'active' => true,
        ]);

        $service = new MinibarService();

        $this->expectException(ValidationException::class);

        try {
            $service->createConsumption([
                'product_id' => $product->id,
                'quantity' => 2,
                'unit_price' => 2.00,
            ]);
        } finally {
            // product stock must be unchanged
            $product->refresh();
            $this->assertEquals(1, $product->stock);

            $this->assertDatabaseHas('financial_audit_logs', [
                'event_type' => 'minibar.consumption_failed_insufficient_stock',
                'resource_type' => 'product',
                'resource_id' => $product->id,
            ]);
        }
    }

    public function test_sequential_consumptions_only_one_succeeds_when_stock_limited()
    {
        $product = Product::create([
            'name' => 'Water Bottle',
            'sku' => 'WATER-1',
            'price' => 1.50,
            'stock' => 1,
            'active' => true,
        ]);

        $service = new MinibarService();

        // first consumption succeeds
        $cons1 = $service->createConsumption([
            'product_id' => $product->id,
            'quantity' => 1,
            'unit_price' => 1.50,
        ]);

        $this->assertInstanceOf(MinibarConsumption::class, $cons1);

        // second consumption should fail due to insufficient stock
        $this->expectException(ValidationException::class);
        $service->createConsumption([
            'product_id' => $product->id,
            'quantity' => 1,
            'unit_price' => 1.50,
        ]);
    }
}
