

<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
    return redirect()->route('ping');
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


require __DIR__.'/auth.php';

use App\Http\Controllers\EmployeeRequestController;


Route::get('/employees', [EmployeeRequestController::class, 'index'])->name('employees.index'); // Liste
Route::get('/employees/create', [EmployeeRequestController::class, 'create'])->name('employees.create'); // Formulaire
Route::post('/employees', [EmployeeRequestController::class, 'store'])->name('employees.store'); // Création
Route::patch('/employees/{id}/status', [EmployeeRequestController::class, 'updateStatus'])->name('employees.updateStatus'); // Valider/Rejeter
Route::delete('/employees/{id}', [EmployeeRequestController::class, 'destroy'])->name('employees.destroy'); // Supprimer
