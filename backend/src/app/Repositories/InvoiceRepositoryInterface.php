<?php

namespace App\Repositories;

use App\Models\Invoice;

interface InvoiceRepositoryInterface
{
    public function create(array $data): Invoice;

    public function find(string $id): ?Invoice;

    public function paginateByProperty(string $propertyId, int $perPage = 15);
}
