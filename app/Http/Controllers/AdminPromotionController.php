<?php

namespace App\Http\Controllers;

use App\Models\Promotion;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminPromotionController extends Controller
{
    public function index()
    {
        $promotions = Promotion::withCount(['products', 'orderItems'])
            ->withSum('orderItems', 'line_total')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($promotions);
    }

    public function publicIndex()
    {
        $promotions = Promotion::active()->with('products')->orderBy('created_at', 'desc')->get();
        return response()->json($promotions);
    }

    public function show(Promotion $promotion)
    {
        $promotion->load('products');
        return response()->json($promotion);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:product,holiday,flash',
            'discount_percentage' => 'required|numeric|min:0|max:100',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'banner_image' => 'nullable|string',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        DB::beginTransaction();
        try {
            $promotion = Promotion::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'type' => $validated['type'],
                'discount_percentage' => $validated['discount_percentage'],
                'start_date' => $validated['start_date'] ?? null,
                'end_date' => $validated['end_date'] ?? null,
                'banner_image' => $validated['banner_image'] ?? null,
                'metadata' => $validated['metadata'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            $products = Product::whereIn('id', $validated['product_ids'])->get();
            $discount = $promotion->discount_percentage / 100;

            foreach ($products as $product) {
                // Calculate new price
                $originalPrice = $product->price;
                $discountAmount = $originalPrice * $discount;
                $promotionPrice = max(0, $originalPrice - $discountAmount);

                // Update product
                $product->is_on_promotion = true;
                $product->promotion_price = $promotionPrice;
                $product->save();
            }

            $promotion->products()->attach($validated['product_ids']);

            DB::commit();

            return response()->json(['message' => 'Promotion created successfully', 'promotion' => $promotion], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create promotion: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, Promotion $promotion)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|required|in:product,holiday,flash',
            'discount_percentage' => 'sometimes|required|numeric|min:0|max:100',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'banner_image' => 'nullable|string',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        DB::beginTransaction();
        try {
            // 1. Revert changes for existing products if necessary (e.g. if products list is updated or promotion is deactivated)
            // Ideally, we should check what changed.
            // For simplicity, if product_ids is provided, we revert old ones and apply to new ones.
            // If discount changed, we recalculate for current products.

            $shouldRecalculate = isset($validated['discount_percentage']) && $validated['discount_percentage'] != $promotion->discount_percentage;
            $productsChanged = isset($validated['product_ids']);
            $statusChanged = isset($validated['is_active']) && $validated['is_active'] != $promotion->is_active;

            $promotion->update($validated);

            if ($productsChanged) {
                // Revert old products
                $oldProducts = $promotion->products;
                foreach ($oldProducts as $p) {
                    $p->is_on_promotion = false;
                    $p->promotion_price = null;
                    $p->save();
                }
                $promotion->products()->detach();

                // Attach new products
                $newProducts = Product::whereIn('id', $validated['product_ids'])->get();
                $discount = $promotion->discount_percentage / 100;
                
                foreach ($newProducts as $product) {
                    $originalPrice = $product->price;
                    $discountAmount = $originalPrice * $discount;
                    $promotionPrice = max(0, $originalPrice - $discountAmount);

                    $product->is_on_promotion = $promotion->is_active; // Only set true if active
                    $product->promotion_price = $promotion->is_active ? $promotionPrice : null;
                    $product->save();
                }
                $promotion->products()->attach($validated['product_ids']);
            } elseif ($shouldRecalculate || $statusChanged) {
                // Recalculate for existing products
                $products = $promotion->products;
                $discount = $promotion->discount_percentage / 100;

                foreach ($products as $product) {
                    $originalPrice = $product->price;
                    $discountAmount = $originalPrice * $discount;
                    $promotionPrice = max(0, $originalPrice - $discountAmount);

                    $product->is_on_promotion = $promotion->is_active;
                    $product->promotion_price = $promotion->is_active ? $promotionPrice : null;
                    $product->save();
                }
            }

            DB::commit();
            return response()->json(['message' => 'Promotion updated successfully', 'promotion' => $promotion]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update promotion: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Promotion $promotion)
    {
        DB::beginTransaction();
        try {
            // Revert products
            foreach ($promotion->products as $product) {
                $product->is_on_promotion = false;
                $product->promotion_price = null;
                $product->save();
            }
            
            $promotion->delete(); // Cascade deletes pivot entries
            
            DB::commit();
            return response()->json(['message' => 'Promotion deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to delete promotion'], 500);
        }
    }
}
