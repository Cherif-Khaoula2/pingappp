<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use LdapRecord\Models\ActiveDirectory\User as LdapUser;
use LdapRecord\Container;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class LdapAuthController extends Controller
{
    // Afficher le formulaire de login LDAP
    public function showLogin()
    {
        return Inertia::render('Auth/LdapLogin');
    }

    // Traiter la soumission du formulaire
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

            // 🔍 Chercher dans LDAP
            $user = LdapUser::where('samaccountname', $username)->first()
                ?? LdapUser::where('userprincipalname', $username)->first();

            if (!$user) {
                Log::warning("Utilisateur LDAP introuvable : $username");
                return back()->withErrors(['username' => 'Utilisateur LDAP introuvable']);
            }

            // ✅ Authentification LDAP
            $connection = Container::getDefaultConnection();

            if (! $connection->auth()->attempt($user->getDn(), $password)) {
                Log::warning("Mot de passe LDAP incorrect pour $username");
                return back()->withErrors(['error' => 'Mot de passe incorrect']);
            }

            // 📧 Préparer les infos LDAP
            $email = $user->mail[0] ?? $username . '@sarpi-dz.com';

            // 🧠 Vérifier dans la base locale
            $localUser = User::where('email', $email)->first();

            if (!$localUser) {
                Log::warning("Utilisateur non autorisé localement : $email");
                return back()->withErrors([
                    'error' => 'Vous n’êtes pas autorisé à accéder à cette application. 
                    Veuillez contacter l’administrateur Tosys .'
                ]);
            }

            // ✅ Connexion Laravel
            Auth::login($localUser);
            Log::info("Connexion réussie pour $email");
            return redirect()->intended('/dashboard')->with('success', 'Connexion réussie ✅');
          

        } catch (\Exception $e) {
            Log::error("Erreur LDAP pour $username : " . $e->getMessage());
            return back()->withErrors(['error' => 'Erreur LDAP : ' . $e->getMessage()]);
        }
    }

    // 🔒 Déconnexion
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('ldap.login');
    }
}
