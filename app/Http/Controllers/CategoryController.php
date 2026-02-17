<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return Category::with('department')->latest()->get();
    }

    public function publicIndex()
    {
        return Category::with('department')
            ->where('status', 'Active')
            ->whereHas('department', function ($query) {
                $query->where('status', 'Active');
            })
            ->orderBy('name')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:Active,Inactive',
        ]);

        $category = Category::create($validated);

        return response()->json($category->load('department'), 201);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:Active,Inactive',
        ]);

        $category->update($validated);

        return response()->json($category->load('department'));
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
