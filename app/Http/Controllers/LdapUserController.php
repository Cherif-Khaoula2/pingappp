<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use LdapRecord\Models\ActiveDirectory\User as LdapUser;
use App\Models\User;
use App\Models\AdActivityLog;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Validator;

class LdapUserController extends Controller
{
    /**
     * 📋 Afficher les utilisateurs LDAP avec recherche
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
                // Recherche multi-mots (ex: "khaoula cherif")
                // On recherche d'abord sur le premier mot
                $allUsers = LdapUser::query()
                    ->whereContains('cn', $words[0])
                    ->orWhereContains('givenname', $words[0])
                    ->orWhereContains('sn', $words[0])
                    ->orWhereContains('samaccountname', $words[0])
                    ->limit(200)
                    ->get();

                // Ensuite on filtre pour vérifier que tous les mots sont présents
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
                })->take(50);
            } else {
                // Recherche simple (un seul mot)
                $ldapUsers = LdapUser::query()
                    ->whereContains('cn', $searchTerm)
                    ->orWhereContains('givenname', $searchTerm)
                    ->orWhereContains('sn', $searchTerm)
                    ->orWhereContains('samaccountname', $searchTerm)
                    ->orWhereContains('mail', $searchTerm)
                    ->limit(50)
                    ->get();
            }
        } else {
            // Aucune recherche : afficher les premiers utilisateurs
            $ldapUsers = LdapUser::query()->limit(50)->get();
        }

        $existingEmails = User::pluck('email')->toArray();

        $users = $ldapUsers->map(function ($u) use ($existingEmails) {
            $email = is_array($u->mail) ? ($u->mail[0] ?? '') : ($u->mail ?? '');
            $name = is_array($u->cn) ? ($u->cn[0] ?? '') : ($u->cn ?? '');
            $username = is_array($u->samaccountname) ? ($u->samaccountname[0] ?? '') : ($u->samaccountname ?? '');

            return [
                'name' => $name,
                'username' => $username,
                'email' => $email,
                'is_local' => in_array($email, $existingEmails),
            ];
        })->filter(function ($user) {
            // Filtrer les utilisateurs sans email ou nom
            return !empty($user['email']) && !empty($user['name']);
        })->values();

        return Inertia::render('LdapUsers/Index', [
            'permissions' => auth()->user()->getAllPermissions()->pluck('name'),
            'users' => $users,
            'search' => $search,
            'roles' => Role::pluck('name')->toArray(),
        ]);
    }

    /**
     * 🧾 Formulaire d'autorisation (choix du rôle)
     */
    public function showAuthorizeForm($username)
    {
        $ldapUser = LdapUser::where('samaccountname', $username)->first();

        if (!$ldapUser) {
            abort(404, 'Utilisateur LDAP introuvable.');
        }

        $email = $ldapUser->mail[0] ?? strtolower($username) . '@sarpi-dz.com';
        $name = $ldapUser->cn[0] ?? $username;
        $roles = Role::pluck('name')->toArray();

        return Inertia::render('LdapUsers/AuthorizeForm', [
            'user' => [
                'username' => $username,
                'name' => $name,
                'email' => $email,
            ],
            'roles' => $roles,
        ]);
    }

    /**
     * 💾 Autoriser un utilisateur LDAP en base locale
     */
    public function authorizeUser(Request $request)
    {
        // ✅ Validation stricte
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255',
            'email'    => 'nullable|email|max:255',
            'role'     => 'required|string|exists:roles,name',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $username = $request->username;
        $email = $request->email;
        $role = $request->role;

        try {
            // 🔍 Vérification LDAP
            $ldapUser = LdapUser::where('samaccountname', $username)->first();
            if ($ldapUser) {
                $email = $ldapUser->mail[0] ?? $email;
            }

            // 🔁 Si email toujours vide → générer un fallback
            if (empty($email)) {
                $email = strtolower(str_replace('.', '_', $username)) . '@sarpi-dz.com';
            }

            // 🚫 Si déjà autorisé
            if (User::where('email', $email)->exists()) {
                // 📝 Logger l'échec
                AdActivityLog::create([
                    'performed_by_id' => auth()->id(),
                    'performed_by_name' => auth()->user()->first_name . ' ' . auth()->user()->last_name,
                    'action' => 'authorize_ldap_user',
                    'target_user' => $username,
                    'target_user_name' => $ldapUser->cn[0] ?? $username,
                    'status' => 'failed',
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'error_message' => 'Cet utilisateur est déjà autorisé.',
                    'additional_details' => json_encode([
                        'email' => $email,
                        'role' => $role,
                    ]),
                ]);

                return back()->withErrors(['email' => 'Cet utilisateur est déjà autorisé.']);
            }

            // 🧩 Découper prénom / nom
            [$firstName, $lastName] = explode('.', $username . '.', 2);
            $firstName = ucfirst(strtolower($firstName));
            $lastName = ucfirst(strtolower($lastName ?? ''));

            // 🧠 Création du compte local
            $user = User::create([
                'first_name' => $firstName,
                'last_name'  => $lastName,
                'email'      => $email,
                'password'   => bcrypt('ldap'),
            ]);

            // 🎯 Attribution du rôle
            $user->assignRole($role);

            Log::info("✅ Utilisateur LDAP autorisé : {$email} ({$role})");

            // 📝 Logger le succès
            AdActivityLog::create([
                'performed_by_id' => auth()->id(),
                'performed_by_name' => auth()->user()->first_name . ' ' . auth()->user()->last_name,
                'action' => 'authorize_ldap_user',
                'target_user' => $username,
                'target_user_name' => $ldapUser->cn[0] ?? $username,
                'status' => 'success',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'additional_details' => json_encode([
                    'email' => $email,
                    'role' => $role,
                    'user_id' => $user->id,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                ]),
            ]);

            return redirect()->route('users')->with('success', 'Utilisateur autorisé avec succès.');

        } catch (\Exception $e) {
            // 📝 Logger l'exception
            AdActivityLog::create([
                'performed_by_id' => auth()->id(),
                'performed_by_name' => auth()->user()->first_name . ' ' . auth()->user()->last_name,
                'action' => 'authorize_ldap_user',
                'target_user' => $username,
                'target_user_name' => null,
                'status' => 'failed',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'error_message' => $e->getMessage(),
                'additional_details' => json_encode([
                    'email' => $email ?? null,
                    'role' => $role,
                ]),
            ]);

            Log::error("❌ Erreur lors de l'autorisation LDAP : " . $e->getMessage());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de l\'autorisation.']);
        }
    }

    /**
     * 🔍 Autocomplétion LDAP (pour les champs recherche)
     */
    public function autocomplete(Request $request)
    {
        try {
            $search = trim($request->input('query', ''));

            if (strlen($search) < 2) {
                return response()->json([]);
            }

            $words = array_filter(explode(' ', strtolower($search)));

            if (count($words) > 1) {
                $ldapUsers = LdapUser::query()
                    ->whereContains('cn', $words[0])
                    ->get()
                    ->filter(function ($user) use ($words) {
                        $fullText = strtolower(
                            ($user->cn[0] ?? '') . ' ' .
                            ($user->givenname[0] ?? '') . ' ' .
                            ($user->sn[0] ?? '')
                        );
                        foreach ($words as $word) {
                            if (!str_contains($fullText, $word)) {
                                return false;
                            }
                        }
                        return true;
                    })
                    ->take(10);
            } else {
                $ldapUsers = LdapUser::query()
                    ->whereContains('cn', $search)
                    ->orWhereContains('givenname', $search)
                    ->orWhereContains('sn', $search)
                    ->orWhereContains('samaccountname', $search)
                    ->orWhereContains('mail', $search)
                    ->limit(10)
                    ->get();
            }

            $existingEmails = User::pluck('email')->toArray();

            $results = $ldapUsers->map(function ($u) use ($existingEmails) {
                $email = is_array($u->mail) ? ($u->mail[0] ?? '') : ($u->mail ?? '');
                $name = is_array($u->cn) ? ($u->cn[0] ?? '') : ($u->cn ?? '');

                return [
                    'name' => $name,
                    'email' => $email,
                    'is_local' => in_array($email, $existingEmails),
                ];
            })->filter(function ($user) {
                return !empty($user['email']) && str_ends_with($user['email'], '@sarpi-dz.com');
            })->values();

            return response()->json($results);
        } catch (\Exception $e) {
            Log::error('❌ LDAP Autocomplete Error: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'line'  => $e->getLine(),
                'file'  => basename($e->getFile()),
            ], 500);
        }
    }

    /**
     * 🗑️ Supprimer un utilisateur LDAP autorisé (désautoriser)
     */
    public function deleteAuthorizedUser(Request $request)
    {
        $email = $request->route('email');
        
        // Trouver l'utilisateur local par email
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            // 📝 Logger l'échec (utilisateur introuvable)
            AdActivityLog::create([
                'performed_by_id' => auth()->id(),
                'performed_by_name' => auth()->user()->first_name . ' ' . auth()->user()->last_name,
                'action' => 'unauthorize_ldap_user',
                'target_user' => $email,
                'target_user_name' => null,
                'status' => 'failed',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'error_message' => 'Utilisateur introuvable.',
                'additional_details' => json_encode([
                    'email' => $email,
                ]),
            ]);

            return back()->withErrors(['email' => 'Utilisateur introuvable.']);
        }

        try {
            $userName = $user->first_name . ' ' . $user->last_name;
            $userRoles = $user->getRoleNames()->toArray();
            $userId = $user->id;

            // Supprimer définitivement l'utilisateur
            $user->forceDelete();
            
            Log::info("🗑️ Utilisateur LDAP supprimé : {$email}");

            // 📝 Logger le succès de la désautorisation
            AdActivityLog::create([
                'performed_by_id' => auth()->id(),
                'performed_by_name' => auth()->user()->first_name . ' ' . auth()->user()->last_name,
                'action' => 'unauthorize_ldap_user',
                'target_user' => $email,
                'target_user_name' => $userName,
                'status' => 'success',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'additional_details' => json_encode([
                    'email' => $email,
                    'user_id' => $userId,
                    'roles' => $userRoles,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                ]),
            ]);
            
            return redirect()->route('ldap.index')->with('success', 'Utilisateur supprimé avec succès.');

        } catch (\Exception $e) {
            // 📝 Logger l'échec de la suppression
            AdActivityLog::create([
                'performed_by_id' => auth()->id(),
                'performed_by_name' => auth()->user()->first_name . ' ' . auth()->user()->last_name,
                'action' => 'unauthorize_ldap_user',
                'target_user' => $email,
                'target_user_name' => $user->first_name . ' ' . $user->last_name,
                'status' => 'failed',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'error_message' => $e->getMessage(),
                'additional_details' => json_encode([
                    'email' => $email,
                    'user_id' => $user->id,
                ]),
            ]);

            Log::error("❌ Erreur lors de la suppression : " . $e->getMessage());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la suppression.']);
        }
    }
}