<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return Product::with(['department', 'category'])->latest()->get();
    }

    public function publicIndex()
    {
        return Product::with(['department', 'category'])
            ->whereHas('department', function ($query) {
                $query->where('status', 'Active');
            })
            ->where(function ($query) {
                $query->whereNull('category_id')
                    ->orWhereHas('category', function ($categoryQuery) {
                        $categoryQuery->where('status', 'Active');
                    });
            })
            ->latest()
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'status' => 'required|in:In Stock,Low Stock,Out of Stock',
            'image' => 'nullable|string',
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('products', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        unset($validated['image_file']);

        $product = Product::create($validated);

        return response()->json($product->load(['department', 'category']), 201);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'status' => 'required|in:In Stock,Low Stock,Out of Stock',
            'image' => 'nullable|string',
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('products', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        unset($validated['image_file']);

        $product->update($validated);

        return response()->json($product->load(['department', 'category']));
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function updateStock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'stock' => 'required|integer|min:0',
        ]);

        $stock = $validated['stock'];
        $status = 'In Stock';
        
        if ($stock === 0) {
            $status = 'Out of Stock';
        } elseif ($stock < 5) {
            $status = 'Low Stock';
        }

        $product->update([
            'stock' => $stock,
            'status' => $status
        ]);

        return response()->json($product);
    }
}
