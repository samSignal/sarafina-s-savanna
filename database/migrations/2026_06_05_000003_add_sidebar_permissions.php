<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $permissions = [
            ['name' => 'view_sales', 'group' => 'Sales', 'description' => 'View sales analytics and reports'],
            ['name' => 'view_exchange_rates', 'group' => 'Settings', 'description' => 'View exchange rates and currency conversion data'],
            ['name' => 'manage_departments', 'group' => 'Catalog', 'description' => 'Manage product departments and department-level settings'],
            ['name' => 'manage_inventory', 'group' => 'Catalog', 'description' => 'View inventory and update stock levels'],
            ['name' => 'manage_delivery', 'group' => 'Sales', 'description' => 'Manage delivery queue, costs, and delivery statuses'],
            ['name' => 'manage_banners', 'group' => 'Content', 'description' => 'Manage homepage banners and promotional slides'],
            ['name' => 'manage_general_settings', 'group' => 'Settings', 'description' => 'Manage general store settings and contact details'],
        ];

        foreach ($permissions as $permission) {
            $exists = DB::table('permissions')->where('name', $permission['name'])->exists();
            if ($exists) {
                DB::table('permissions')
                    ->where('name', $permission['name'])
                    ->update([
                        'group' => $permission['group'],
                        'description' => $permission['description'],
                        'updated_at' => now(),
                    ]);
            } else {
                DB::table('permissions')->insert([
                    'name' => $permission['name'],
                    'group' => $permission['group'],
                    'description' => $permission['description'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->assignPermissionsToRole('Administrator', [
            'view_sales',
            'view_exchange_rates',
            'manage_departments',
            'manage_inventory',
            'manage_delivery',
            'manage_banners',
            'manage_general_settings',
        ]);

        $this->assignPermissionsToRole('Store Manager', [
            'view_sales',
            'view_exchange_rates',
            'manage_departments',
            'manage_inventory',
            'manage_delivery',
        ]);

        $this->assignPermissionsToRole('Support Agent', [
            'view_sales',
            'manage_delivery',
        ]);

        $this->assignPermissionsToRole('Content Editor', [
            'manage_banners',
        ]);
    }

    public function down(): void
    {
        $permissionIds = DB::table('permissions')
            ->whereIn('name', [
                'view_sales',
                'view_exchange_rates',
                'manage_departments',
                'manage_inventory',
                'manage_delivery',
                'manage_banners',
                'manage_general_settings',
            ])
            ->pluck('id');

        if ($permissionIds->isNotEmpty()) {
            DB::table('permission_role')->whereIn('permission_id', $permissionIds)->delete();
            DB::table('permissions')->whereIn('id', $permissionIds)->delete();
        }
    }

    private function assignPermissionsToRole(string $roleName, array $permissionNames): void
    {
        $role = DB::table('roles')->where('name', $roleName)->first();
        if (! $role) {
            return;
        }

        $permissionIds = DB::table('permissions')
            ->whereIn('name', $permissionNames)
            ->pluck('id');

        foreach ($permissionIds as $permissionId) {
            $exists = DB::table('permission_role')
                ->where('role_id', $role->id)
                ->where('permission_id', $permissionId)
                ->exists();

            if (! $exists) {
                DB::table('permission_role')->insert([
                    'role_id' => $role->id,
                    'permission_id' => $permissionId,
                ]);
            }
        }
    }
};
