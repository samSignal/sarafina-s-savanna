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
        ]);

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('departments', 'public');
            $validated['image'] = '/storage/' . $path;
        }

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
