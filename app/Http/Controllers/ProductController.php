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
            ->where('type', '!=', 'gift_card')
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
            'department_id' => 'required_unless:type,gift_card|nullable|exists:departments,id',
            'category_id' => 'nullable|exists:categories,id',
            'type' => 'nullable|string',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'desired_net_price' => 'nullable|numeric|min:0',
            'price_uk_eu' => 'nullable|numeric|min:0',
            'price_international' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'status' => 'required|in:In Stock,Low Stock,Out of Stock',
            'image' => 'nullable|string',
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('products', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        unset($validated['image_file']);

        // Auto-calculate status
        $stock = $validated['stock'];
        $threshold = $validated['low_stock_threshold'] ?? 10;
        
        // Ensure threshold is not null for non-nullable column
        $validated['low_stock_threshold'] = $threshold;
        
        if ($stock == 0) {
            $validated['status'] = 'Out of Stock';
        } elseif ($stock < $threshold) {
            $validated['status'] = 'Low Stock';
        } else {
            $validated['status'] = 'In Stock';
        }

        $product = Product::create($validated);

        return response()->json($product->load(['department', 'category']), 201);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'department_id' => 'required_unless:type,gift_card|nullable|exists:departments,id',
            'category_id' => 'nullable|exists:categories,id',
            'type' => 'nullable|string',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'desired_net_price' => 'nullable|numeric|min:0',
            'price_uk_eu' => 'nullable|numeric|min:0',
            'price_international' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'status' => 'required|in:In Stock,Low Stock,Out of Stock',
            'image' => 'nullable|string',
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('products', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        unset($validated['image_file']);

        // Auto-calculate status
        $stock = $validated['stock'];
        $threshold = $validated['low_stock_threshold'] ?? $product->low_stock_threshold ?? 10;
        
        // Ensure threshold is not null for non-nullable column
        $validated['low_stock_threshold'] = $threshold;
        
        if ($stock == 0) {
            $validated['status'] = 'Out of Stock';
        } elseif ($stock < $threshold) {
            $validated['status'] = 'Low Stock';
        } else {
            $validated['status'] = 'In Stock';
        }

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
            'low_stock_threshold' => 'nullable|integer|min:0',
        ]);

        $stock = $validated['stock'];
        
        if (array_key_exists('low_stock_threshold', $validated)) {
            $product->low_stock_threshold = $validated['low_stock_threshold'] ?? 10;
        }

        $status = 'In Stock';
        $threshold = $product->low_stock_threshold ?? 10;
        
        if ($stock === 0) {
            $status = 'Out of Stock';
        } elseif ($stock < $threshold) {
            $status = 'Low Stock';
        }

        $product->stock = $stock;
        $product->status = $status;
        $product->save();

        return response()->json($product);
    }
}
