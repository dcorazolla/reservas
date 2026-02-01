<?php

namespace App\Repositories;

use App\Models\Invoice;

class EloquentInvoiceRepository implements InvoiceRepositoryInterface
{
    public function create(array $data): Invoice
    {
        return Invoice::create($data);
    }

    public function find(string $id): ?Invoice
    {
        return Invoice::with(['lines', 'lines.allocations'])->find($id);
    }

    public function paginateByProperty(string $propertyId, int $perPage = 15)
    {
        return Invoice::with(['lines', 'lines.allocations'])
            ->where('property_id', $propertyId)
            ->orderBy('issued_at', 'desc')
            ->paginate($perPage);
    }
}
