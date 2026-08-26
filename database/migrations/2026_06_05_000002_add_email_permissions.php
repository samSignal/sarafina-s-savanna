<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $permissions = [
            [
                'name' => 'view_emails',
                'group' => 'Emails',
                'description' => 'View inbox, spam, sent emails, attachments, and print email threads',
            ],
            [
                'name' => 'send_emails',
                'group' => 'Emails',
                'description' => 'Compose new emails and send replies from the admin email workspace',
            ],
            [
                'name' => 'manage_email_connection',
                'group' => 'Emails',
                'description' => 'Connect and manage the Gmail integration used by the admin email workspace',
            ],
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
                continue;
            }

            DB::table('permissions')->insert([
                'name' => $permission['name'],
                'group' => $permission['group'],
                'description' => $permission['description'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->assignPermissionsToRole('Administrator', [
            'view_emails',
            'send_emails',
            'manage_email_connection',
        ]);

        $this->assignPermissionsToRole('Store Manager', [
            'view_emails',
            'send_emails',
        ]);

        $this->assignPermissionsToRole('Support Agent', [
            'view_emails',
            'send_emails',
            'manage_email_connection',
        ]);
    }

    public function down(): void
    {
        $permissionIds = DB::table('permissions')
            ->whereIn('name', ['view_emails', 'send_emails', 'manage_email_connection'])
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
