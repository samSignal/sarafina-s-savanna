<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminRoleController extends Controller
{
    public function index()
    {
        $roles = Role::withCount('users')->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description,
                'is_system' => $role->is_system,
                'users_count' => $role->users_count,
                'permissions' => $role->permissions->pluck('name'),
            ];
        });

        return response()->json($roles);
    }

    public function permissions()
    {
        $permissions = Permission::all()->groupBy('group');
        return response()->json($permissions);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name|max:255',
            'description' => 'nullable|string|max:255',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name'
        ]);

        DB::beginTransaction();
        try {
            $role = Role::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'is_system' => false
            ]);

            if (!empty($validated['permissions'])) {
                $permissionIds = Permission::whereIn('name', $validated['permissions'])->pluck('id');
                $role->permissions()->attach($permissionIds);
            }

            DB::commit();
            
            return response()->json([
                'message' => 'Role created successfully',
                'role' => $role->load('permissions')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create role', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, Role $role)
    {
        if ($role->is_system && $request->has('name') && $request->name !== $role->name) {
            return response()->json(['message' => 'Cannot rename system roles'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'description' => 'nullable|string|max:255',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name'
        ]);

        DB::beginTransaction();
        try {
            $role->update([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
            ]);

            if (isset($validated['permissions'])) {
                $permissionIds = Permission::whereIn('name', $validated['permissions'])->pluck('id');
                $role->permissions()->sync($permissionIds);
            }

            DB::commit();

            return response()->json([
                'message' => 'Role updated successfully',
                'role' => $role->fresh(['permissions'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update role', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Role $role)
    {
        if ($role->is_system) {
            return response()->json(['message' => 'Cannot delete system roles'], 403);
        }

        if ($role->users()->count() > 0) {
            return response()->json(['message' => 'Cannot delete role assigned to users'], 409);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted successfully']);
    }
}
