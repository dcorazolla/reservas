<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Str;

class ModelPropertyTest extends TestCase
{
    public function test_property_relations()
    {
        $property = \App\Models\Property::create([
            'id' => Str::uuid()->toString(),
            'name' => 'My Property',
        ]);

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $property->users());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $property->rooms());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $property->roomCategories());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $property->reservations());
    }
}
