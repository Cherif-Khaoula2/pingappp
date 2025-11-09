<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Créer un rôle "admin" et lui donner toutes les permissions
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $permissions = Permission::all();
        $adminRole->syncPermissions($permissions);

 
    }
}
