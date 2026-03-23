<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('description')->nullable();
            $table->boolean('is_system')->default(false); // Cannot be deleted
            $table->timestamps();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('group')->nullable(); // For UI grouping
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('permission_role', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->foreignId('permission_id')->constrained()->onDelete('cascade');
            $table->primary(['role_id', 'permission_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('role')->constrained('roles')->nullOnDelete();
        });

        // Seed Initial Roles
        $roles = [
            [
                'name' => 'Administrator', 
                'description' => 'Full access to all system resources',
                'is_system' => true
            ],
            [
                'name' => 'Store Manager', 
                'description' => 'Can manage products, orders, and view reports',
                'is_system' => false
            ],
            [
                'name' => 'Support Agent', 
                'description' => 'Can view orders and manage customer support tickets',
                'is_system' => false
            ],
            [
                'name' => 'Content Editor', 
                'description' => 'Can edit blog posts and page content',
                'is_system' => false
            ],
            [
                'name' => 'Customer', 
                'description' => 'Standard customer role',
                'is_system' => true
            ],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->insert([
                'name' => $role['name'],
                'description' => $role['description'],
                'is_system' => $role['is_system'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Seed Initial Permissions
        $permissions = [
            // Dashboard
            ['name' => 'view_dashboard', 'group' => 'Dashboard', 'description' => 'View admin dashboard stats'],
            
            // User Management
            ['name' => 'manage_users', 'group' => 'Users', 'description' => 'Create, edit, and delete admin users'],
            ['name' => 'view_users', 'group' => 'Users', 'description' => 'View admin users list'],
            ['name' => 'manage_roles', 'group' => 'Users', 'description' => 'Manage roles and permissions'],
            
            // Customers
            ['name' => 'manage_customers', 'group' => 'Customers', 'description' => 'Edit customer details'],
            ['name' => 'view_customers', 'group' => 'Customers', 'description' => 'View customer list and details'],
            
            // Catalog
            ['name' => 'manage_products', 'group' => 'Catalog', 'description' => 'Create, edit, delete products'],
            ['name' => 'view_products', 'group' => 'Catalog', 'description' => 'View product list'],
            ['name' => 'manage_categories', 'group' => 'Catalog', 'description' => 'Manage categories and departments'],
            
            // Sales
            ['name' => 'manage_orders', 'group' => 'Sales', 'description' => 'Process and update orders'],
            ['name' => 'view_orders', 'group' => 'Sales', 'description' => 'View order details'],
            ['name' => 'manage_refunds', 'group' => 'Sales', 'description' => 'Process refund requests'],
            
            // Marketing
            ['name' => 'manage_promotions', 'group' => 'Marketing', 'description' => 'Manage discount codes'],
            ['name' => 'manage_gift_cards', 'group' => 'Marketing', 'description' => 'Manage gift cards'],
            ['name' => 'manage_loyalty', 'group' => 'Marketing', 'description' => 'Manage loyalty program'],
            
            // Content
            ['name' => 'manage_content', 'group' => 'Content', 'description' => 'Manage page content'],
            
            // Settings
            ['name' => 'manage_settings', 'group' => 'Settings', 'description' => 'Manage general store settings'],
        ];

        foreach ($permissions as $perm) {
            DB::table('permissions')->insert([
                'name' => $perm['name'],
                'group' => $perm['group'],
                'description' => $perm['description'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Assign all permissions to Administrator
        $adminRole = DB::table('roles')->where('name', 'Administrator')->first();
        $allPermissions = DB::table('permissions')->pluck('id');
        
        foreach ($allPermissions as $permId) {
            DB::table('permission_role')->insert([
                'role_id' => $adminRole->id,
                'permission_id' => $permId
            ]);
        }

        // Assign some permissions to Store Manager
        $managerRole = DB::table('roles')->where('name', 'Store Manager')->first();
        $managerPerms = DB::table('permissions')->whereIn('name', [
            'view_dashboard', 
            'manage_products', 'view_products', 'manage_categories',
            'manage_orders', 'view_orders', 'manage_refunds',
            'manage_customers', 'view_customers',
            'manage_promotions', 'manage_gift_cards', 'manage_loyalty'
        ])->pluck('id');

        foreach ($managerPerms as $permId) {
            DB::table('permission_role')->insert([
                'role_id' => $managerRole->id,
                'permission_id' => $permId
            ]);
        }

        // Assign existing users to roles
        $users = DB::table('users')->get();
        foreach ($users as $user) {
            // Map legacy 'role' string to new Role ID
            // Default mapping
            $roleName = 'Customer'; 
            
            if ($user->role === 'admin') {
                $roleName = 'Administrator';
            } elseif ($user->role === 'customer') {
                $roleName = 'Customer';
            }
            
            $role = DB::table('roles')->where('name', $roleName)->first();
            
            if ($role) {
                DB::table('users')->where('id', $user->id)->update(['role_id' => $role->id]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });

        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
