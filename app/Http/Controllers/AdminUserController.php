<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roleDefinition');

        // Optional: Filter by role or type
        if ($request->has('type') && $request->type === 'staff') {
            $query->where(function ($q) {
                $q->whereHas('roleDefinition', function ($roleQuery) {
                    $roleQuery->where('name', '!=', 'Customer');
                })->orWhere(function ($legacyQuery) {
                    $legacyQuery
                        ->whereNotNull('role')
                        ->whereNotIn('role', ['customer', 'client']);
                });
            });
        }

        $users = $query->latest()->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roleDefinition ? $user->roleDefinition->name : ($user->role ?? 'Customer'),
                'role_id' => $user->role_id,
                'created_at' => $user->created_at,
            ];
        });

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);

        // Get role name for legacy column
        $role = Role::find($validated['role_id']);
        $roleName = $role ? $role->name : 'customer';
        
        // Normalize role name for legacy column (lowercase usually)
        $legacyRoleName = strtolower($roleName);
        if ($legacyRoleName === 'administrator') $legacyRoleName = 'admin';

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'role' => $legacyRoleName, // Legacy support
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user->load('roleDefinition')
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role_id' => 'sometimes|required|exists:roles,id',
        ]);

        // Changing which role a user holds is a manage_roles-level action, not merely a
        // manage_users one — otherwise a role granted manage_users without manage_roles
        // could assign itself (or anyone) the Administrator role.
        if (isset($validated['role_id']) && (int) $validated['role_id'] !== (int) $user->role_id) {
            if (! $request->user()?->hasPermission('manage_roles')) {
                return response()->json(['message' => 'Unauthorized. Missing permission: manage_roles'], 403);
            }
        }

        $data = [];
        if (isset($validated['name'])) $data['name'] = $validated['name'];
        if (isset($validated['email'])) $data['email'] = $validated['email'];
        if (isset($validated['password'])) $data['password'] = Hash::make($validated['password']);
        
        if (isset($validated['role_id'])) {
            $data['role_id'] = $validated['role_id'];
            
            // Update legacy role column
            $role = Role::find($validated['role_id']);
            $roleName = $role ? $role->name : 'customer';
            $legacyRoleName = strtolower($roleName);
            if ($legacyRoleName === 'administrator') $legacyRoleName = 'admin';
            
            $data['role'] = $legacyRoleName;
        }

        $user->update($data);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->fresh('roleDefinition')
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()?->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
