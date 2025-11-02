<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Contact;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
 public function run(): void
    {
       $this->call([
        PermissionSeeder::class,
        RoleSeeder::class,
        UserSeeder::class,
        
    ]);
    }
}
