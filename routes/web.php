

<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SmartMaterialsImportController;
use Inertia\Inertia;
use App\Http\Controllers\auth\LoginController;
use App\Http\Controllers\LdapAuthController;
use App\Http\Controllers\LdapUserController;
use App\Http\Controllers\AdActivityLogController;


/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return redirect()->route('ldap.login');
});

use App\Http\Controllers\DashboardController;

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

use App\Http\Controllers\PingController;

Route::get('/ping', [PingController::class, 'index'])->name('ping');
Route::post('/ping', [PingController::class, 'ping'])->name('ping.execute');


use App\Http\Controllers\EmployeeRequestController;


Route::get('/employees', [EmployeeRequestController::class, 'index'])->name('employees.index'); // Liste
Route::get('/employees/create', [EmployeeRequestController::class, 'create'])->name('employees.create'); // Formulaire
Route::post('/employees', [EmployeeRequestController::class, 'store'])->name('employees.store'); // Création
Route::patch('/employees/{id}/status', [EmployeeRequestController::class, 'updateStatus'])->name('employees.updateStatus'); // Valider/Rejeter
Route::delete('/employees/{id}', [EmployeeRequestController::class, 'destroy'])->name('employees.destroy'); // Supprimer

// user 

Route::middleware(['auth'])->group(function () {
Route::get('users', [UsersController::class, 'index'])
    ->name('users')
    ->middleware('permission:getalluser');

Route::get('users/create', [UsersController::class, 'create'])
    ->name('users.create')
    ->middleware('permission:adduser');

Route::post('users', [UsersController::class, 'store'])
    ->name('users.store')
     ->middleware('permission:adduser');

Route::get('users/{user}/edit', [UsersController::class, 'edit'])
    ->name('users.edit')
    ->middleware('permission:getuser');

Route::put('users/{user}', [UsersController::class, 'update'])
    ->name('users.update')
    ->middleware('permission:updateuser');

Route::delete('users/{user}', [UsersController::class, 'destroy'])
    ->name('users.destroy')
     ->middleware('permission:deleteuser');

Route::delete('/ldap/users/{email}', [LdapUserController::class, 'deleteAuthorizedUser'])
    ->name('ldap.delete')
    ->middleware(['auth', 'permission:deleteuser']);
     

//Route::put('users/{user}/restore', [UsersController::class, 'restore'])
  //  ->name('users.restore')
    //->middleware('auth');
});



// Auth
Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])
    ->name('password.reset');

Route::post('/reset-password', [NewPasswordController::class, 'store'])
    ->name('password.update');

Route::get('/forgot-password', [ForgotPasswordController::class, 'create'])
    ->name('password.request');

Route::post('/forgot-password', [ForgotPasswordController::class, 'store'])
    ->name('password.email');

Route::get('login', [LoginController::class, 'create'])
    ->name('login')
    ->middleware('guest');

Route::post('login', [LoginController::class, 'store'])
    ->name('login.store')
    ->middleware('guest');

Route::delete('logout', [LdapAuthController::class, 'destroy'])
    ->name('logout');

Route::post('/ldap-login', [LdapAuthController::class, 'login'])->name('ldap.login');
Route::get('/ldap-login', [LdapAuthController::class, 'showLogin'])->name('ldap.showLogin');

Route::get('/ldap/authorize/{username}', [LdapUserController::class, 'showAuthorizeForm'])
->name('ldap.authorize.form')
->middleware('permission:autoriseldap');

Route::get('/ldap/users', [LdapUserController::class, 'index'])
->name('ldap.index')
->middleware('permission:getallldap');


Route::post('/ldap/authorize', [LdapUserController::class, 'authorizeUser'])
->name('ldap.authorize')
->middleware('permission:autoriseldap');



// role

Route::middleware(['auth'])->group(function () {
    Route::get('/roles', [RoleController::class,'index'])
        ->middleware('permission:getallrole')
        ->name('roles.index');

    Route::get('/roles/create', [RoleController::class,'create'])
        ->middleware('permission:addrole')
        ->name('roles.create');

    Route::post('/roles', [RoleController::class,'store'])
        ->middleware('permission:addrole')
        ->name('roles.store');

    Route::get('/roles/{role}/edit', [RoleController::class,'edit'])
        ->middleware('permission:getrole')
        ->name('roles.edit');

    Route::put('/roles/{role}', [RoleController::class,'update'])
        ->middleware('permission:updaterole')
        ->name('roles.update');

    Route::delete('/roles/{role}', [RoleController::class,'destroy'])
        ->middleware('permission:deleterole')
        ->name('roles.destroy');
});
use App\Http\Controllers\AdUserController;

Route::get('/ad/search', [AdUserController::class, 'index'])->name('ad.search');
Route::post('/ad-user', [AdUserController::class, 'getUser']);


Route::get('/ad/ipconfig', [AdUserController::class, 'index']);
Route::post('/ad/user/ipconfig', [AdUserController::class, 'ipConfig'])->name('ad.user.ipconfig');





Route::middleware('auth')->group(function () {

    // 🔍 Page principale des utilisateurs AD
   // Route::get('/ad/users', [AdUserController::class, 'adUsers'])
   // ->middleware('permission:getalladuser')
    //    ->name('ad.users');

Route::get('/ad/mailboxes', [AdUserController::class, 'listMailboxes']);
     // 🔎 Recherche d’un utilisateur via SamAccountName
    Route::post('/ad/users/find', [AdUserController::class, 'findUser'])
    ->middleware('permission:getaduser')
        ->name('ad.users.find');


    // 🔐 Page spéciale pour bloquer / débloquer un utilisateur
    Route::get('/ad/users/manage-lock', [AdUserController::class, 'manageLock'])
    ->middleware('permission:blockaduser')
        ->name('ad.users.manage-lock');

    // 🚫 Changer l’état d’un utilisateur (bloquer / débloquer)
    Route::post('/ad/users/toggle', [AdUserController::class, 'toggleUserStatus'])
    ->middleware('permission:blockaduser')
        ->name('ad.users.toggle');

    // 🔑 Réinitialiser le mot de passe d’un utilisateur AD
    Route::get('/ad/users/manage-password', [AdUserController::class, 'managePassword'])
    ->middleware('permission:resetpswaduser')
        ->name('ad.users.manage-password');

    Route::post('/ad/users/reset-password', [AdUserController::class, 'resetPassword'])
    ->middleware('permission:resetpswaduser')
        ->name('ad.users.reset-password');


    // 🔑 Ajouter un utilisateur AD
    Route::get('/ad/add-user', [AdUserController::class, 'manageAddUser'])
    ->middleware('permission:addaduser')
    ->name('ad.add-user');
    Route::post('/ad/create-user', [AdUserController::class, 'createAdUser'])
    ->middleware('permission:addaduser')
    ->name('ad.create-user');
      Route::get('/ad/ous', [AdUserController::class, 'getAllAdOUs']);

    // 🔹 Récupérer les utilisateurs d'une OU spécifique
    Route::post('/ad/users-by-ou', [AdUserController::class, 'getUsersByOU']);

    
    Route::get('/ad/ou-page', [AdUserController::class, 'showOuPage']);
    Route::get('/ad/ou-users/{ou_dn}', [AdUserController::class, 'showUsersByOU'])->name('ad.ou.users');

});




// Routes protégées pour les logs d'activité AD
Route::middleware(['auth'])->group(function () {
    
    // Logs d'activité AD
    Route::get('/ad/activity-logs', [AdActivityLogController::class, 'index'])
    ->middleware('permission:getlog')
        ->name('ad.logs.index');
    
    Route::get('/ad/activity-logs/{id}', [AdActivityLogController::class, 'show'])
    ->middleware('permission:getlog')
        ->name('ad.logs.show');
    
    Route::get('/ad/activity-logs-export', [AdActivityLogController::class, 'export'])
    ->middleware('permission:getlog')
        ->name('ad.logs.export');
      Route::get('/ad/activity-logs/user/{id}', [AdActivityLogController::class, 'showUserLogs'])
      ->middleware('permission:getlog')
        ->name('activity.user');
});

use App\Http\Controllers\AdHiddenAccountController;

Route::middleware(['auth'])->group(function () {
    Route::get('/hidden-users', [AdHiddenAccountController::class, 'index'])
    ->middleware('permission:getallhidden')
    ->name('hidden.index');
    Route::post('/hidden-users', [AdHiddenAccountController::class, 'store'])
    ->middleware('permission:getallhidden')
    ->name('hidden.store');
    Route::delete('/hidden-users/{adHiddenAccount}', [AdHiddenAccountController::class, 'destroy'])
    ->middleware('permission:getallhidden')
    ->name('hidden.destroy');
    Route::get('/hidden/list', [AdHiddenAccountController::class, 'showHiddenList'])
    ->middleware('permission:getallhidden')
    ->name('hidden.list');
});
use App\Http\Controllers\AdComputerController;

Route::middleware(['auth'])->group(function () {

    // API POST pour récupérer les ordinateurs LAPS
    Route::post('/ad/computers/get-laps-password', [AdComputerController::class, 'getLapsPassword'])
    ->middleware('permission:getadpc');
    Route::get('/ad/computers/find', [AdComputerController::class, 'showFindPage'])
    ->middleware('permission:getadpc')
    ->name('computers.find');

    Route::post('/ad/computers/get-laps-password', [AdComputerController::class, 'getLapsPassword'])
    ->middleware('permission:getadpc')
    ->name('computers.laps');

    Route::get('/ad/computers/laps/all', [AdComputerController::class, 'getAllLapsComputers'])
    ->middleware('permission:getadpc')
    ->name('computers.all');

    Route::get('/ad/computers/laps', [AdComputerController::class, 'showAllComputersPage'])
    ->middleware('permission:getadpc')
    ->name('ad.computers.laps');
 
});
use App\Http\Controllers\DnController;

Route::middleware(['auth'])->group(function() {
    Route::get('/dns', [DnController::class, 'index'])
    ->middleware('permission:managedn')
    ->name('dns.index');


    Route::post('/dns', [DnController::class, 'store'])
    ->middleware('permission:managedn')
    ->name('dns.store');


    Route::put('/dns/{dn}', [DnController::class, 'update'])
    ->middleware('permission:managedn')
    ->name('dns.update');


    Route::delete('/dns/{dn}', [DnController::class, 'destroy'])
    ->middleware('permission:managedn')
    ->name('dns.destroy');



    Route::post('/dns/assign', [DnController::class, 'assignDnToUser'])
    ->middleware('permission:managedn')
    ->name('dns.assign');


});
Route::get('/ad/directions', [AdUserController::class, 'getDirections'])
    ->middleware('auth')
    ->name('ad.directions');