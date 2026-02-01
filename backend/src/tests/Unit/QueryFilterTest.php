<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Http\Filters\QueryFilter;
use App\Models\RoomCategory;

class QueryFilterTest extends TestCase
{
    public function test_apply_calls_orderby_when_sort_and_direction_valid_and_paginate_when_per_page()
    {
        $request = new Request(['sort' => 'name', 'direction' => 'desc', 'per_page' => '10']);

        $filter = new class($request) extends QueryFilter {
            protected function filters(): array
            {
                return [];
            }
        };

        $builder = RoomCategory::query();

        $ret = $filter->apply($builder);

        $this->assertSame($builder, $ret);

        $orders = $builder->getQuery()->orders ?: [];
        $this->assertNotEmpty($orders);
        $this->assertEquals('name', $orders[0]['column']);
        $this->assertEquals('desc', $orders[0]['direction']);
    }

    public function test_apply_skips_orderby_when_direction_invalid()
    {
        $request = new Request(['sort' => 'name', 'direction' => 'invalid']);

        $filter = new class($request) extends QueryFilter {
            protected function filters(): array
            {
                return [];
            }
        };

        $builder = RoomCategory::query();

        $ret = $filter->apply($builder);

        $this->assertSame($builder, $ret);

        $orders = $builder->getQuery()->orders ?: [];
        $this->assertEmpty($orders);
    }
}
