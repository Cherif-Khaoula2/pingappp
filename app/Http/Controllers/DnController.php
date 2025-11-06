<?php

namespace App\Http\Controllers;

use App\Models\Dn;
use App\Models\User;
use App\Models\AdActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        try {
            $dn = Dn::create($validated);

            // 📝 LOG : Création de DN
            AdActivityLog::create([
                'performed_by_id' => Auth::id(),
                'performed_by_name' => Auth::user()->first_name . ' ' . Auth::user()->last_name,
                'action' => 'create_dn',
                'target_user' => $dn->path,
                'target_user_name' => $dn->nom,
                'status' => 'success',
                'ip_address' => $request->ip(),
                'details' => json_encode([
                    'dn_id' => $dn->id,
                    'nom' => $dn->nom,
                    'path' => $dn->path,
                ]),
            ]);

            return redirect()->back()->with('success', 'DN créé avec succès');
        } catch (\Exception $e) {
            // 📝 LOG : Échec création
            AdActivityLog::create([
                'performed_by_id' => Auth::id(),
                'performed_by_name' => Auth::user()->first_name . ' ' . Auth::user()->last_name,
                'action' => 'create_dn',
                'target_user' => $validated['path'],
                'target_user_name' => $validated['nom'],
                'status' => 'failed',
                'ip_address' => $request->ip(),
                'details' => json_encode([
                    'error' => $e->getMessage(),
                ]),
            ]);

            return redirect()->back()->with('error', 'Erreur lors de la création du DN');
        }
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

        try {
            // Sauvegarde de l'état précédent
            $oldNom = $dn->nom;
            $oldPath = $dn->path;
            $oldUserIds = $dn->users->pluck('id')->toArray();

            // Mise à jour des informations du DN
            $dn->update([
                'nom' => $validated['nom'],
                'path' => $validated['path'],
            ]);

            // Nouveaux utilisateurs
            $newUserIds = $validated['user_ids'] ?? [];

            // Synchronisation des utilisateurs
            $dn->users()->sync($newUserIds);

            // Calcul des changements
            $addedUsers = array_diff($newUserIds, $oldUserIds);
            $removedUsers = array_diff($oldUserIds, $newUserIds);

            // 📝 LOG : Mise à jour du DN
            AdActivityLog::create([
                'performed_by_id' => Auth::id(),
                'performed_by_name' => Auth::user()->first_name . ' ' . Auth::user()->last_name,
                'action' => 'update_dn',
                'target_user' => $dn->path,
                'target_user_name' => $dn->nom,
                'status' => 'success',
                'ip_address' => $request->ip(),
                'details' => json_encode([
                    'dn_id' => $dn->id,
                    'changes' => [
                        'nom' => ['old' => $oldNom, 'new' => $dn->nom],
                        'path' => ['old' => $oldPath, 'new' => $dn->path],
                    ],
                    'users_added' => $addedUsers,
                    'users_removed' => $removedUsers,
                    'total_users' => count($newUserIds),
                ]),
            ]);

            // 📝 LOG : Utilisateurs ajoutés
            if (!empty($addedUsers)) {
                $addedUserNames = User::whereIn('id', $addedUsers)
                    ->get()
                    ->map(fn($u) => trim($u->first_name . ' ' . $u->last_name))
                    ->implode(', ');

                AdActivityLog::create([
                    'performed_by_id' => Auth::id(),
                    'performed_by_name' => Auth::user()->first_name . ' ' . Auth::user()->last_name,
                    'action' => 'assign_dn_to_users',
                    'target_user' => $dn->path,
                    'target_user_name' => $addedUserNames,
                    'status' => 'success',
                    'ip_address' => $request->ip(),
                    'details' => json_encode([
                        'dn_id' => $dn->id,
                        'dn_nom' => $dn->nom,
                        'user_ids' => $addedUsers,
                        'count' => count($addedUsers),
                    ]),
                ]);
            }

            // 📝 LOG : Utilisateurs retirés
            if (!empty($removedUsers)) {
                $removedUserNames = User::whereIn('id', $removedUsers)
                    ->get()
                    ->map(fn($u) => trim($u->first_name . ' ' . $u->last_name))
                    ->implode(', ');

                AdActivityLog::create([
                    'performed_by_id' => Auth::id(),
                    'performed_by_name' => Auth::user()->first_name . ' ' . Auth::user()->last_name,
                    'action' => 'unassign_dn_from_users',
                    'target_user' => $dn->path,
                    'target_user_name' => $removedUserNames,
                    'status' => 'success',
                    'ip_address' => $request->ip(),
                    'details' => json_encode([
                        'dn_id' => $dn->id,
                        'dn_nom' => $dn->nom,
                        'user_ids' => $removedUsers,
                        'count' => count($removedUsers),
                    ]),
                ]);
            }

            return redirect()->back()->with('success', 'DN mis à jour avec succès');
        } catch (\Exception $e) {
            // 📝 LOG : Échec mise à jour
            AdActivityLog::create([
                'performed_by_id' => Auth::id(),
                'performed_by_name' => Auth::user()->first_name . ' ' . Auth::user()->last_name,
                'action' => 'update_dn',
                'target_user' => $dn->path,
                'target_user_name' => $dn->nom,
                'status' => 'failed',
                'ip_address' => $request->ip(),
                'details' => json_encode([
                    'error' => $e->getMessage(),
                ]),
            ]);

            return redirect()->back()->with('error', 'Erreur lors de la mise à jour du DN');
        }
    }

    /**
     * Supprimer un DN
     */
    public function destroy(Dn $dn)
    {
        try {
            // Sauvegarde des infos avant suppression
            $dnId = $dn->id;
            $dnNom = $dn->nom;
            $dnPath = $dn->path;
            $affectedUsers = $dn->users->pluck('id')->toArray();
            $affectedUserNames = $dn->users->map(fn($u) => trim($u->first_name . ' ' . $u->last_name))->implode(', ');

            // Détache d'abord tous les utilisateurs
            $dn->users()->detach();
            
            // Supprime le DN
            $dn->delete();

            // 📝 LOG : Suppression réussie
            AdActivityLog::create([
                'performed_by_id' => Auth::id(),
                'performed_by_name' => Auth::user()->first_name . ' ' . Auth::user()->last_name,
                'action' => 'delete_dn',
                'target_user' => $dnPath,
                'target_user_name' => $dnNom,
                'status' => 'success',
                'ip_address' => request()->ip(),
                'details' => json_encode([
                    'dn_id' => $dnId,
                    'affected_users' => $affectedUsers,
                    'affected_user_names' => $affectedUserNames,
                    'users_count' => count($affectedUsers),
                ]),
            ]);

            return redirect()->back()->with('success', 'DN supprimé avec succès');
        } catch (\Exception $e) {
            // 📝 LOG : Échec suppression
            AdActivityLog::create([
                'performed_by_id' => Auth::id(),
                'performed_by_name' => Auth::user()->first_name . ' ' . Auth::user()->last_name,
                'action' => 'delete_dn',
                'target_user' => $dn->path,
                'target_user_name' => $dn->nom,
                'status' => 'failed',
                'ip_address' => request()->ip(),
                'details' => json_encode([
                    'error' => $e->getMessage(),
                ]),
            ]);

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

        try {
            $user = User::findOrFail($validated['user_id']);
            $userName = trim($user->first_name . ' ' . $user->last_name);
            
            // sync() remplace les DNs existants par les nouveaux
            $user->dns()->sync($validated['dn_ids']);

            $dnsAssigned = Dn::whereIn('id', $validated['dn_ids'])->get();
            $dnNames = $dnsAssigned->pluck('nom')->implode(', ');
            $dnPaths = $dnsAssigned->pluck('path')->implode(', ');

            // 📝 LOG : Affectation rapide
            AdActivityLog::create([
                'performed_by_id' => Auth::id(),
                'performed_by_name' => Auth::user()->first_name . ' ' . Auth::user()->last_name,
                'action' => 'assign_dns_to_user',
                'target_user' => $user->email ?? $userName,
                'target_user_name' => $userName,
                'status' => 'success',
                'ip_address' => $request->ip(),
                'details' => json_encode([
                    'user_id' => $user->id,
                    'dn_ids' => $validated['dn_ids'],
                    'dn_names' => $dnNames,
                    'dn_paths' => $dnPaths,
                    'count' => count($validated['dn_ids']),
                ]),
            ]);

            return redirect()->back()->with('success', 'DN(s) affecté(s) à l\'utilisateur avec succès');
        } catch (\Exception $e) {
            // 📝 LOG : Échec affectation
            AdActivityLog::create([
                'performed_by_id' => Auth::id(),
                'performed_by_name' => Auth::user()->first_name . ' ' . Auth::user()->last_name,
                'action' => 'assign_dns_to_user',
                'target_user' => User::find($validated['user_id'])?->email ?? 'Unknown',
                'target_user_name' => User::find($validated['user_id']) 
                    ? trim(User::find($validated['user_id'])->first_name . ' ' . User::find($validated['user_id'])->last_name)
                    : 'Unknown',
                'status' => 'failed',
                'ip_address' => $request->ip(),
                'details' => json_encode([
                    'error' => $e->getMessage(),
                ]),
            ]);

            return redirect()->back()->with('error', 'Erreur lors de l\'affectation des DNs');
        }
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