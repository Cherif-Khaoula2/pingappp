<?php

namespace App\Http\Controllers;

use App\Models\Dn;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DnController extends Controller
{
    public function index()
{
    $dns = Dn::with(['users:id,first_name,last_name'])->get();

    // ✅ Ajoute un champ "name" pour chaque user avant de l'envoyer au front
    $dns->each(function ($dn) {
        $dn->users->each(function ($user) {
            $user->name = trim($user->first_name . ' ' . $user->last_name);
        });
    });

    $users = \App\Models\User::select('id', 'first_name', 'last_name')
        ->get()
        ->map(function ($user) {
            $user->name = trim($user->first_name . ' ' . $user->last_name);
            return $user;
        });

    return Inertia::render('Dn/Index', [
        'dns' => $dns,
        'users' => $users,
    ]);
}

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'path' => 'required|string|max:255|unique:dns,path',
        ]);

        Dn::create($request->only('nom', 'path'));
        return redirect()->back()->with('success', 'DN créé avec succès');
    }

    public function update(Request $request, Dn $dn)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'path' => 'required|string|max:255|unique:dns,path,' . $dn->id,
        ]);

        $dn->update($request->only('nom', 'path'));
        return redirect()->back()->with('success', 'DN mis à jour');
    }

    public function destroy(Dn $dn)
    {
        $dn->delete();
        return redirect()->back()->with('success', 'DN supprimé');
    }

    public function assignDnToUser(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'dn_ids' => 'required|array',
            'dn_ids.*' => 'exists:dns,id',
        ]);

        $user = User::find($request->user_id);
        $user->dns()->sync($request->dn_ids); // remplace les DN existants
        return redirect()->back()->with('success', 'DN(s) affecté(s) à l’utilisateur');
    }
}
