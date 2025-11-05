<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // User CRUD
            'getuser',
            'adduser',
            'deleteuser',
            'updateuser',
            'getalluser',
            'getallldap',
            'autoriseldap',

            // Role CRUD
            'getrole',
            'addrole',
            'deleterole',
            'updaterole',
            'getallrole',
            'addaduser',
            'blockaduser',
            'resetpswaduser',
            'getalladuser',
            'superviserusers',
            'getaduser',
            'getlog',
            'getallhidden',
            'getadpc',
            'managedn'

        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
    }
}
