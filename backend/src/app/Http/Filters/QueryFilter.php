<?php

namespace App\Http\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

abstract class QueryFilter
{
    protected Builder $builder;
    protected Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function apply(Builder $builder): Builder
    {
        $this->builder = $builder;

        foreach ($this->filters() as $filter => $method) {
            if ($this->request->filled($filter)) {
                $this->$method($this->request->input($filter));
            }
        }

        $this->applySort();
        $this->applyPagination();

        return $this->builder;
    }

    abstract protected function filters(): array;

    protected function applySort(): void
    {
        $sort = $this->request->input('sort');
        $direction = $this->request->input('direction', 'asc');

        if ($sort && in_array($direction, ['asc', 'desc'])) {
            $this->builder->orderBy($sort, $direction);
        }
    }

    protected function applyPagination(): void
    {
        if ($this->request->filled('per_page')) {
            $this->builder->paginate(
                (int) $this->request->input('per_page', 15)
            );
        }
    }
}
