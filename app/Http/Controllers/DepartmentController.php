<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DepartmentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show', 'publicIndex', 'publicShow']);
        $this->middleware('permission:manage_categories')->only(['store', 'update', 'destroy']);
    }

    public function index()
    {
        return Department::latest()->get();
    }

    public function publicIndex()
    {
        try {
            return Department::where('status', 'Active')
                ->orderBy('name')
                ->get();
        } catch (\Throwable $e) {
            \Log::error('publicIndex departments failed', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to load departments', 'error' => $e->getMessage()], 500);
        }
    }

    public function publicShow(Department $department)
    {
        if ($department->status !== 'Active') {
            abort(404);
        }

        $department->load(['products' => function ($query) {
            $query->where('type', '!=', 'gift_card')
                ->where(function ($q) {
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
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:Active,Inactive',
                'image' => 'nullable|string',
                'image_file' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
                'points_multiplier' => 'nullable|numeric|min:0',
                'loyalty_reason' => 'nullable|string',
                'allow_refunds' => 'boolean',
                'restock_on_refund' => 'boolean',
                'refund_window_days' => 'integer|min:0',
            ]);

            if ($request->hasFile('image_file')) {
                $path = $request->file('image_file')->store('departments', 'public');
                $validated['image'] = '/storage/' . $path;
            }

            $validated['points_multiplier'] = $validated['points_multiplier'] ?? 0;
            $validated['allow_refunds'] = $validated['allow_refunds'] ?? true;
            $validated['restock_on_refund'] = $validated['restock_on_refund'] ?? true;
            $validated['refund_window_days'] = $validated['refund_window_days'] ?? 14;

            unset($validated['image_file']);

            $department = Department::create($validated);

            return response()->json($department, 201);
        } catch (\Throwable $e) {
            Log::error('Department store failed', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            $payload = ['message' => 'Failed to create department'];
            if (config('app.debug')) {
                $payload['error'] = $e->getMessage();
            }
            return response()->json($payload, 500);
        }
    }

    public function update(Request $request, Department $department)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:Active,Inactive',
                'image' => 'nullable|string',
                'image_file' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
                'points_multiplier' => 'nullable|numeric|min:0',
                'loyalty_reason' => 'nullable|string',
                'allow_refunds' => 'boolean',
                'restock_on_refund' => 'boolean',
                'refund_window_days' => 'integer|min:0',
            ]);

            if ($request->hasFile('image_file')) {
                $path = $request->file('image_file')->store('departments', 'public');
                $validated['image'] = '/storage/' . $path;
            }

            unset($validated['image_file']);

            $department->update($validated);

            return response()->json($department);
        } catch (\Throwable $e) {
            Log::error('Department update failed', [
                'department_id' => $department->id,
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            $payload = ['message' => 'Failed to update department'];
            if (config('app.debug')) {
                $payload['error'] = $e->getMessage();
            }
            return response()->json($payload, 500);
        }
    }

    public function destroy(Department $department)
    {
        try {
            $department->delete();
            return response()->json(['message' => 'Department deleted successfully']);
        } catch (\Throwable $e) {
            Log::error('Department delete failed', [
                'department_id' => $department->id,
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            $payload = ['message' => 'Failed to delete department'];
            if (config('app.debug')) {
                $payload['error'] = $e->getMessage();
            }
            return response()->json($payload, 500);
        }
    }

    public function updateRefundRules(Request $request, Department $department)
    {
        $validated = $request->validate([
            'allow_refunds' => 'required|boolean',
            'restock_on_refund' => 'required|boolean',
            'refund_window_days' => 'required|integer|min:0',
        ]);

        $department->update($validated);

        return response()->json($department);
    }
}
