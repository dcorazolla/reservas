<?php

namespace App\Http\Filters;

class RoomFilter extends QueryFilter
{
    protected function filters(): array
    {
        return [
            'search'   => 'search',
            'active'   => 'active',
            'capacity' => 'capacity',
            'category' => 'category',
        ];
    }

    protected function search(string $value): void
    {
        $this->builder->where(function ($q) use ($value) {
            $q->where('name', 'like', "%{$value}%")
              ->orWhere('number', 'like', "%{$value}%");
        });
    }

    protected function active(bool $value): void
    {
        $this->builder->where('active', $value);
    }

    protected function capacity(int $value): void
    {
        $this->builder->where('capacity', '>=', $value);
    }

    protected function category(int $value): void
    {
        $this->builder->where('room_category_id', $value);
    }
}
