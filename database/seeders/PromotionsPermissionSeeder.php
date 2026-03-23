<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class PromotionsPermissionSeeder extends Seeder
{
    public function run()
    {
        $perm = Permission::firstOrCreate(
            ['name' => 'manage_promotions'],
            [
                'group' => 'Promotions',
                'description' => 'Create, edit, and delete promotions'
            ]
        );

        $adminRole = Role::where('name', 'Administrator')->first();
        if ($adminRole) {
            $adminRole->permissions()->syncWithoutDetaching([$perm->id]);
        }
    }
}
