<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\AdHiddenAccount;
use App\Models\AdActivityLog;
use LdapRecord\Models\ActiveDirectory\User as LdapUser;
use Inertia\Inertia;

class AdHiddenAccountController extends Controller
{
    /**
     * Afficher la liste de tous les utilisateurs LDAP
     * + Indiquer ceux déjà masqués
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $ldapUsers = collect();

        if ($search) {
            // Nettoyer et séparer les mots de recherche
            $searchTerm = trim($search);
            $words = array_filter(explode(' ', strtolower($searchTerm)));

            if (count($words) > 1) {
                $allUsers = LdapUser::query()
                    ->whereContains('cn', $words[0])
                    ->orWhereContains('givenname', $words[0])
                    ->orWhereContains('sn', $words[0])
                    ->orWhereContains('samaccountname', $words[0])
                    ->get();

                $ldapUsers = $allUsers->filter(function ($user) use ($words) {
                    $fullText = strtolower(
                        ($user->cn[0] ?? '') . ' ' .
                        ($user->givenname[0] ?? '') . ' ' .
                        ($user->sn[0] ?? '') . ' ' .
                        ($user->samaccountname[0] ?? '') . ' ' .
                        ($user->mail[0] ?? '')
                    );

                    foreach ($words as $word) {
                        if (!str_contains($fullText, $word)) {
                            return false;
                        }
                    }
                    return true;
                });
            } else {
                // Recherche simple (un seul mot)
                $ldapUsers = LdapUser::query()
                    ->whereContains('cn', $searchTerm)
                    ->orWhereContains('givenname', $searchTerm)
                    ->orWhereContains('sn', $searchTerm)
                    ->orWhereContains('samaccountname', $searchTerm)
                    ->orWhereContains('mail', $searchTerm)
                    ->get();
            }
        } else {
            // Afficher tous les utilisateurs
            $ldapUsers = LdapUser::query()->get();
        }

        // Récupérer les comptes déjà masqués
        $hiddenAccounts = AdHiddenAccount::pluck('samaccountname')->toArray();

        // Récupérer les utilisateurs locaux
        $existingEmails = User::pluck('email')->toArray();

        // Formatage des résultats
        $users = $ldapUsers->map(function ($u) use ($existingEmails, $hiddenAccounts) {
            $email = is_array($u->mail) ? ($u->mail[0] ?? '') : ($u->mail ?? '');
            $name = is_array($u->cn) ? ($u->cn[0] ?? '') : ($u->cn ?? '');
            $username = is_array($u->samaccountname) ? ($u->samaccountname[0] ?? '') : ($u->samaccountname ?? '');

            return [
                'name' => $name,
                'username' => $username,
                'email' => $email,
                'is_local' => in_array($email, $existingEmails),
                'is_hidden' => in_array($username, $hiddenAccounts),
            ];
        })->filter(function ($user) {
            return !empty($user['email']) && !empty($user['name']);
        })->values();

        return Inertia::render('Hidden/Index', [
            'users' => $users,
            'search' => $search,
            'permissions' => auth()->user()->getAllPermissions()->pluck('name'),
        ]);
    }

    /**
     * Ajouter un compte à la liste des masqués
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'samaccountname' => 'required|string|max:255|unique:ad_hidden_accounts,samaccountname',
            'reason' => 'nullable|string|max:255',
        ]);

        try {
            // Récupérer les infos LDAP de l'utilisateur cible
            $ldapUser = LdapUser::where('samaccountname', $validated['samaccountname'])->first();
            $targetName = $ldapUser ? ($ldapUser->cn[0] ?? $validated['samaccountname']) : $validated['samaccountname'];
            $targetEmail = $ldapUser ? ($ldapUser->mail[0] ?? null) : null;

            // Créer le compte masqué
            $account = AdHiddenAccount::create($validated);

            // 📝 Logger l'action de masquage
            AdActivityLog::create([
                'performed_by_id' => auth()->id(),
                'performed_by_name' => auth()->user()->first_name . ' ' . auth()->user()->last_name,
                'action' => 'hide_account',
                'target_user' => $validated['samaccountname'],
                'target_user_name' => $targetName,
                'status' => 'success',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'additional_details' => json_encode([
                    'email' => $targetEmail,
                    'reason' => $validated['reason'] ?? null,
                    'hidden_account_id' => $account->id,
                ]),
            ]);

            return back()->with('success', 'Compte masqué avec succès');

        } catch (\Exception $e) {
            // 📝 Logger l'échec
            AdActivityLog::create([
                'performed_by_id' => auth()->id(),
                'performed_by_name' => auth()->user()->first_name . ' ' . auth()->user()->last_name,
                'action' => 'hide_account',
                'target_user' => $validated['samaccountname'],
                'target_user_name' => null,
                'status' => 'failed',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'error_message' => $e->getMessage(),
                'additional_details' => json_encode([
                    'reason' => $validated['reason'] ?? null,
                ]),
            ]);

            return back()->withErrors(['error' => 'Erreur lors du masquage du compte']);
        }
    }

    /**
     * Supprimer un compte masqué
     */
    public function destroy(Request $request, AdHiddenAccount $adHiddenAccount)
    {
        try {
            $samaccountname = $adHiddenAccount->samaccountname;
            
            // Récupérer les infos LDAP si disponible
            $ldapUser = LdapUser::where('samaccountname', $samaccountname)->first();
            $targetName = $ldapUser ? ($ldapUser->cn[0] ?? $samaccountname) : $samaccountname;
            $targetEmail = $ldapUser ? ($ldapUser->mail[0] ?? null) : null;

            // Supprimer le compte masqué
            $adHiddenAccount->delete();

            // 📝 Logger l'action de suppression du masquage
            AdActivityLog::create([
                'performed_by_id' => auth()->id(),
                'performed_by_name' => auth()->user()->first_name . ' ' . auth()->user()->last_name,
                'action' => 'unhide_account',
                'target_user' => $samaccountname,
                'target_user_name' => $targetName,
                'status' => 'success',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'additional_details' => json_encode([
                    'email' => $targetEmail,
                    'previous_hidden_id' => $adHiddenAccount->id,
                ]),
            ]);

            return back()->with('success', 'Masquage supprimé avec succès');

        } catch (\Exception $e) {
            // 📝 Logger l'échec
            AdActivityLog::create([
                'performed_by_id' => auth()->id(),
                'performed_by_name' => auth()->user()->first_name . ' ' . auth()->user()->last_name,
                'action' => 'unhide_account',
                'target_user' => $adHiddenAccount->samaccountname,
                'target_user_name' => null,
                'status' => 'failed',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'error_message' => $e->getMessage(),
            ]);

            return back()->withErrors(['error' => 'Erreur lors de la suppression du masquage']);
        }
    }

    public function showHiddenList()
    {
        $hiddenAccounts = AdHiddenAccount::all();

        return Inertia::render('Hidden/Hidden', [
            'hiddenAccounts' => $hiddenAccounts
        ]);
    }
}