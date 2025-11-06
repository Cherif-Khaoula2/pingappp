<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use App\Traits\LogsAdActivity;
class SessionTimeout
{use LogsAdActivity;
    // Durée maximale d'inactivité (en secondes)
    protected $timeout = 1800; // 30 minutes

    public function handle($request, Closure $next)
    {
        if (Auth::check()) {
            $lastActivity = session('last_activity_time');
            $currentTime = now()->timestamp;

            if ($lastActivity && ($currentTime - $lastActivity > $this->timeout)) {
                $user = Auth::user();

                if ($user) {
                    // 🔹 Log de déconnexion automatique
                     $this->logAdActivity(
                        action: 'logout',
                        targetUser: strtolower(strstr($user->email, '@', true)),
                        targetUserName: $user->name,
                        success: true,
                        additionalDetails: [
                            'logout_time' => now(),
                            'reason' => 'Session expirée automatiquement après 30 min'
                        ]
                    );
                }

                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('ldap.login')->withErrors([
                    'error' => 'Votre session a expiré après 30 minutes d’inactivité ⏰'
                ]);
            }

            // 🔹 Met à jour le timestamp de la dernière activité
            session(['last_activity_time' => $currentTime]);
        }

        return $next($request);
    }
}
