<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends BaseApiController
{
    public function index()
    {
        return response()->json(Product::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:191',
            'sku' => 'sometimes|nullable|string|max:64',
            'price' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'active' => 'nullable|boolean',
            'description' => 'nullable|string',
        ]);

        if (empty($data['id'])) {
            $data['id'] = (string) \Illuminate\Support\Str::uuid();
        }

        $product = Product::create($data);

        return response()->json($product, 201);
    }

    public function show(Product $product)
    {
        return response()->json($product);
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:191',
            'sku' => 'sometimes|nullable|string|max:64',
            'price' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'active' => 'nullable|boolean',
            'description' => 'nullable|string',
        ]);

        $product->update($data);

        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(null, 204);
    }
}
