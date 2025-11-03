<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use LdapRecord\Models\ActiveDirectory\User as LdapUser;
use LdapRecord\Container;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Traits\LogsAdActivity;

class LdapAuthController extends Controller
{
    use LogsAdActivity;

    public function showLogin()
    {
        return Inertia::render('Auth/LdapLogin');
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $username = $request->username;
        $password = $request->password;

        try {
            Log::info("Tentative de connexion LDAP : $username");

            $user = LdapUser::where('samaccountname', $username)->first()
                ?? LdapUser::where('userprincipalname', $username)->first();

            if (!$user) {
                Log::warning("Utilisateur LDAP introuvable : $username");
                
                // ❌ Log échec - utilisateur non trouvé
                $this->logAdActivity(
                    action: 'login',
                    targetUser: $username,
                    success: false,
                    errorMessage: 'Utilisateur LDAP introuvable'
                );

                return back()->withErrors(['username' => 'Utilisateur LDAP introuvable']);
            }

            $connection = Container::getDefaultConnection();

            if (!$connection->auth()->attempt($user->getDn(), $password)) {
                Log::warning("Mot de passe LDAP incorrect pour $username");
                
                // ❌ Log échec - mot de passe incorrect
                $this->logAdActivity(
                    action: 'login',
                    targetUser: $username,
                    targetUserName: $user->cn[0] ?? null,
                    success: false,
                    errorMessage: 'Mot de passe incorrect'
                );

                return back()->withErrors(['error' => 'Mot de passe incorrect']);
            }

            $email = $user->mail[0] ?? $username . '@sarpi-dz.com';
            $localUser = User::where('email', $email)->first();

            if (!$localUser) {
                Log::warning("Utilisateur non autorisé localement : $email");
                
                // ❌ Log échec - non autorisé
                $this->logAdActivity(
                    action: 'login',
                    targetUser: $username,
                    targetUserName: $user->cn[0] ?? null,
                    success: false,
                    errorMessage: 'Utilisateur non autorisé dans l\'application'
                );

                return back()->withErrors([
    'error' => "Vous n'êtes pas autorisé à accéder à cette application. Veuillez contacter l'administrateur Tosys."
]);

            }

            // ✅ Connexion réussie
            Auth::login($localUser);
            
            // ✅ Log connexion réussie
            $this->logAdActivity(
                action: 'login',
                targetUser: $username,
                targetUserName: $localUser->name,
                success: true,
                additionalDetails: [
                    'email' => $email,
                    'ldap_dn' => $user->getDn(),
                    'login_method' => 'LDAP'
                ]
            );

            Log::info("Connexion réussie pour $email");
            return redirect()->intended('/dashboard')->with('success', 'Connexion réussie ✅');

        } catch (\Exception $e) {
            Log::error("Erreur LDAP pour $username : " . $e->getMessage());
            
            // ❌ Log erreur système
            $this->logAdActivity(
                action: 'login',
                targetUser: $username,
                success: false,
                errorMessage: 'Erreur système : ' . $e->getMessage()
            );

            return back()->withErrors(['error' => 'Erreur LDAP : ' . $e->getMessage()]);
        }
    }

    public function logout(Request $request)
    {
        $user = Auth::user();
        
        if ($user) {
            // ✅ Log déconnexion
            $this->logAdActivity(
                action: 'logout',
                targetUser: $user->email,
                targetUserName: $user->name,
                success: true
            );
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect()->route('ldap.login');
    }
}