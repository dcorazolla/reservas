<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Models\Room;
use App\Http\Filters\RoomFilter;

class RoomFilterTest extends TestCase
{
    public function test_apply_adds_wheres_for_filters()
    {
        $request = new Request([
            'search' => 'R',
            'active' => true,
            'capacity' => 2,
            'category' => 5,
        ]);

        $filter = new class($request) extends RoomFilter {
            // reuse RoomFilter implementation
        };

        $builder = Room::query();

        $initial = count($builder->getQuery()->wheres ?? []);

        $ret = $filter->apply($builder);

        $this->assertSame($builder, $ret);

        $wheres = $builder->getQuery()->wheres ?? [];
        $this->assertGreaterThanOrEqual($initial + 1, count($wheres));
    }
}
