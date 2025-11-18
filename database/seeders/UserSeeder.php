<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
 

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 🔑 Créer un utilisateur Admin par défaut
        $admin = User::firstOrCreate(
            ['email' => 'khaoula.hamadouche@sarpi-dz.com'],
            [
                'first_name' => 'khaoula',
                'last_name'  => 'hamadouche',
                'password'   => '12345678',
                'account_id' => 1,
                
            ]
        );

        // Assigner le rôle admin (créé dans RoleSeeder)
        $admin->assignRole('admin');

       
    }
}