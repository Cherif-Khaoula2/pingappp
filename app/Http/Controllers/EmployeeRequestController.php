<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EmployeeRequest;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia; // seulement si tu veux renvoyer vers une page Inertia


class EmployeeRequestController extends Controller
{
    // Liste toutes les demandes
    public function index()
    {
        $employees = EmployeeRequest::orderBy('created_at','desc')->get();
        return Inertia::render('Employees/Index', [
            'employees' => $employees
        ]);
    }

    // Affiche le formulaire de création
    public function create()
    {
        return Inertia::render('Employees/Create');
    }

    // Enregistre la nouvelle demande
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => 'required|email|unique:employee_requests,email',
            'password'   => 'required|string|min:6',
            'department' => 'required|string|max:255',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        EmployeeRequest::create($validated);

        return redirect()->route('employees.index'); // Retour à la liste
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate(['status' => 'required|in:approved,rejected']);
        $employee = EmployeeRequest::findOrFail($id);
        $employee->status = $validated['status'];
        $employee->save();

        return redirect()->route('employees.index');
    }

    public function destroy($id)
    {
        $employee = EmployeeRequest::findOrFail($id);
        $employee->delete();

        return redirect()->route('employees.index');
    }
}
