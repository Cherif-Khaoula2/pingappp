

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
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})
    ->name('dashboard');
//    ->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


Route::get('/uikit/button', function () {
    return Inertia::render('main/uikit/button/page');
})->name('button');

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

Route::delete('logout', [LoginController::class, 'destroy'])
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
Route::get('/ad/users', [AdUserController::class, 'adUsers'])->name('ad.users');

Route::post('/ad/users/toggle', [AdUserController::class, 'toggleUserStatus'])->name('ad.users.toggle');
Route::get('/ad/users/manage-lock', [AdUserController::class, 'manageLock'])
    ->name('ad.users.manage-lock');
Route::post('/ad/users/reset-password', [AdUserController::class, 'resetPassword'])
    ->name('ad.users.reset-password');

});



// Routes protégées pour les logs d'activité AD
Route::middleware(['auth'])->group(function () {
    
    // Logs d'activité AD
    Route::get('/ad/activity-logs', [AdActivityLogController::class, 'index'])
        ->name('ad.logs.index');
    
    Route::get('/ad/activity-logs/{id}', [AdActivityLogController::class, 'show'])
        ->name('ad.logs.show');
    
    Route::get('/ad/activity-logs-export', [AdActivityLogController::class, 'export'])
        ->name('ad.logs.export');
});