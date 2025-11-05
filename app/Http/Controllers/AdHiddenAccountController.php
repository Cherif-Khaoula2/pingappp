<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\AdHiddenAccount;
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
                    ->get(); // ✅ SUPPRESSION DE limit(200)

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
                }); // ✅ SUPPRESSION DE ->take(50)
            } else {
                // Recherche simple (un seul mot) - SANS LIMITE
                $ldapUsers = LdapUser::query()
                    ->whereContains('cn', $searchTerm)
                    ->orWhereContains('givenname', $searchTerm)
                    ->orWhereContains('sn', $searchTerm)
                    ->orWhereContains('samaccountname', $searchTerm)
                    ->orWhereContains('mail', $searchTerm)
                    ->get(); // ✅ SUPPRESSION DE limit(50)
            }
        } else {
            // ✅ AFFICHER TOUS LES UTILISATEURS (pas seulement 50)
            $ldapUsers = LdapUser::query()->get();
        }

        // 📋 Récupérer les comptes déjà masqués
        $hiddenAccounts = AdHiddenAccount::pluck('samaccountname')->toArray();

        // 📋 Récupérer les utilisateurs locaux (déjà dans ta BDD)
        $existingEmails = User::pluck('email')->toArray();

        // 🧩 Formatage des résultats
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

        // 🔙 Retourner la vue Inertia
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

        $account = AdHiddenAccount::create($validated);

        return back();
    }

    /**
     * Supprimer un compte masqué
     */
    public function destroy(AdHiddenAccount $adHiddenAccount)
    {
        $adHiddenAccount->delete();

        return back();
    }

    public function showHiddenList()
    {
        $hiddenAccounts = AdHiddenAccount::all();

        return Inertia::render('Hidden/Hidden', [
            'hiddenAccounts' => $hiddenAccounts
        ]);
    }
}