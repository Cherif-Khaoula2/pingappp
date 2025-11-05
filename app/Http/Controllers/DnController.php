<?php

namespace App\Http\Controllers;

use App\Models\Dn;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DnController extends Controller
{
    /**
     * Afficher la liste des DNs avec leurs utilisateurs
     */
    public function index()
    {
        $dns = Dn::with(['users:id,first_name,last_name'])->get();

        // Ajoute le champ "name" pour chaque user
        $dns->each(function ($dn) {
            $dn->users->each(function ($user) {
                $user->name = trim($user->first_name . ' ' . $user->last_name);
            });
        });

        $users = User::select('id', 'first_name', 'last_name')
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

    /**
     * Créer un nouveau DN
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'path' => 'required|string|max:255|unique:dns,path',
        ], [
            'nom.required' => 'Le nom du DN est obligatoire',
            'path.required' => 'Le chemin du DN est obligatoire',
            'path.unique' => 'Ce chemin existe déjà',
        ]);

        Dn::create($validated);

        return redirect()->back()->with('success', 'DN créé avec succès');
    }

    /**
     * Mettre à jour un DN avec gestion des affectations utilisateurs
     */
    public function update(Request $request, Dn $dn)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'path' => 'required|string|max:255|unique:dns,path,' . $dn->id,
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'exists:users,id',
        ], [
            'nom.required' => 'Le nom du DN est obligatoire',
            'path.required' => 'Le chemin du DN est obligatoire',
            'path.unique' => 'Ce chemin existe déjà',
            'user_ids.*.exists' => 'Un ou plusieurs utilisateurs sont invalides',
        ]);

        // Mise à jour des informations du DN
        $dn->update([
            'nom' => $validated['nom'],
            'path' => $validated['path'],
        ]);

        // Synchronisation des utilisateurs (affecte/désaffecte automatiquement)
        if (isset($validated['user_ids'])) {
            $dn->users()->sync($validated['user_ids']);
        } else {
            // Si aucun utilisateur sélectionné, on désaffecte tous
            $dn->users()->sync([]);
        }

        return redirect()->back()->with('success', 'DN mis à jour avec succès');
    }

    /**
     * Supprimer un DN
     */
    public function destroy(Dn $dn)
    {
        try {
            // Détache d'abord tous les utilisateurs
            $dn->users()->detach();
            
            // Supprime le DN
            $dn->delete();

            return redirect()->back()->with('success', 'DN supprimé avec succès');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erreur lors de la suppression du DN');
        }
    }

    /**
     * Affecter des DNs à un utilisateur (affectation rapide)
     */
    public function assignDnToUser(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'dn_ids' => 'required|array|min:1',
            'dn_ids.*' => 'exists:dns,id',
        ], [
            'user_id.required' => 'Veuillez sélectionner un utilisateur',
            'user_id.exists' => 'L\'utilisateur sélectionné n\'existe pas',
            'dn_ids.required' => 'Veuillez sélectionner au moins un DN',
            'dn_ids.min' => 'Veuillez sélectionner au moins un DN',
            'dn_ids.*.exists' => 'Un ou plusieurs DNs sont invalides',
        ]);

        $user = User::findOrFail($validated['user_id']);
        
        // sync() remplace les DNs existants par les nouveaux
        $user->dns()->sync($validated['dn_ids']);

        return redirect()->back()->with('success', 'DN(s) affecté(s) à l\'utilisateur avec succès');
    }

    /**
     * Obtenir les utilisateurs affectés à un DN spécifique (optionnel)
     */
    public function getUsersForDn(Dn $dn)
    {
        $users = $dn->users()
            ->select('id', 'first_name', 'last_name')
            ->get()
            ->map(function ($user) {
                $user->name = trim($user->first_name . ' ' . $user->last_name);
                return $user;
            });

        return response()->json(['users' => $users]);
    }

    /**
     * Obtenir les DNs affectés à un utilisateur spécifique (optionnel)
     */
    public function getDnsForUser(User $user)
    {
        $dns = $user->dns()->get();

        return response()->json(['dns' => $dns]);
    }
}