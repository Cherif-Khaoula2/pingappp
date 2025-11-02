<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Http\Requests\RoleStoreRequest;
use App\Http\Requests\RoleUpdateRequest;
use Illuminate\Support\Facades\Redirect;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->orderBy('name')->paginate(10)->appends(request()->all());

        return Inertia::render('Roles/Index', [
            'permissions' => auth()->user()->getAllPermissions()->pluck('name'),
            'roles' => $roles,
            'can' => [
                'create' => auth()->user()->can('addrole'),
                'edit'   => auth()->user()->can('updaterole'),
                'delete' => auth()->user()->can('deleterole'),
            ],
        ]);
    }

    public function create()
    {
        $permissions = Permission::all(['id', 'name']);

        return Inertia::render('Roles/Create', [
             'permissions' => auth()->user()->getAllPermissions()->pluck('name'),
            'permissions' => $permissions->map(fn($p) => ['value' => $p->name, 'label' => $p->name]),
        ]);
    }

    public function store(RoleStoreRequest $request)
    {
        $data = $request->validated();
        $role = Role::create(['name' => $data['name']]);
        $role->syncPermissions($data['permissions'] ?? []);

        return Redirect::route('roles.index')->with('success', 'Rôle créé.');
    }

    public function edit(Role $role)
    {
        $permissions = Permission::all(['id', 'name']);

        return Inertia::render('Roles/Edit', [
             'userspermissions' => auth()->user()->getAllPermissions()->pluck('name'),
            'role' => $role->load('permissions'),
            'permissions' => $permissions->map(fn($p) => ['value' => $p->name, 'label' => $p->name]),
        ]);
    }

    public function update(Role $role, RoleUpdateRequest $request)
    {
        $data = $request->validated();
        $role->update(['name' => $data['name']]);
        $role->syncPermissions($data['permissions'] ?? []);

        return Redirect::route('roles.index')->with('success', 'Rôle mis à jour.');
    }


    public function destroy(Role $role)
    {
        // Empêche la suppression si le rôle est encore attribué à des users
        if (\App\Models\User::role($role->name)->exists()) {
            return Redirect::back()->with('error', "Impossible de supprimer un rôle attribué à des utilisateurs.");
        }

        $role->delete();
        
        return redirect()->route('roles.index')->with('success', 'Rôle supprimé avec succès.');
    }
}
