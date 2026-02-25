<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index()
    {
        return Department::latest()->get();
    }

    public function publicIndex()
    {
        return Department::where('status', 'Active')
            ->orderBy('name')
            ->get();
    }

    public function publicShow(Department $department)
    {
        if ($department->status !== 'Active') {
            abort(404);
        }

        $department->load(['products' => function ($query) {
            $query->where(function ($q) {
                $q->whereNull('category_id')
                    ->orWhereHas('category', function ($categoryQuery) {
                        $categoryQuery->where('status', 'Active');
                    });
            });
        }]);

        return $department;
    }

    public function show(Department $department)
    {
        if ($department->status !== 'Active') {
            abort(404);
        }

        return $department->load('products');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:Active,Inactive',
            'image' => 'nullable|string',
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            'points_multiplier' => 'nullable|numeric|min:0',
            'loyalty_reason' => 'nullable|string',
        ]);

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('departments', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $validated['points_multiplier'] = $validated['points_multiplier'] ?? 1.00;

        unset($validated['image_file']);

        $department = Department::create($validated);

        return response()->json($department, 201);
    }

    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:Active,Inactive',
            'image' => 'nullable|string',
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            'points_multiplier' => 'nullable|numeric|min:0',
            'loyalty_reason' => 'nullable|string',
        ]);

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('departments', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        unset($validated['image_file']);

        $department->update($validated);

        return response()->json($department);
    }

    public function destroy(Department $department)
    {
        $department->delete();

        return response()->json(['message' => 'Department deleted successfully']);
    }
}
