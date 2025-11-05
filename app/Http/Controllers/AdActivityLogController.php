<?php

namespace App\Http\Controllers;

use App\Models\AdActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdActivityLogController extends Controller
{
    /**
     * 🧭 Affiche la liste des logs avec filtres et statistiques
     */
    public function index(Request $request)
    {
        $query = AdActivityLog::with('performer')->latest();

        // 🔍 Filtres
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('target_user')) {
            $query->where('target_user', 'like', '%' . $request->target_user . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // 📊 Résultats paginés
        $logs = $query->paginate(50)->withQueryString();

        // 📈 Statistiques rapides
        $stats = [
            'total_today' => AdActivityLog::whereDate('created_at', today())->count(),
            'logins_today' => AdActivityLog::whereDate('created_at', today())
                ->where('action', 'login')
                ->where('status', 'success')
                ->count(),
            'failed_today' => AdActivityLog::whereDate('created_at', today())
                ->where('status', 'failed')
                ->count(),
            'blocks_today' => AdActivityLog::whereDate('created_at', today())
                ->where('action', 'block_user')
                ->count(),
        ];

        return Inertia::render('Ad/ActivityLogs', [
            'logs' => $logs,
            'stats' => $stats,
            'filters' => $request->only(['action', 'target_user', 'status', 'start_date', 'end_date']),
        ]);
    }

    /**
     * 👁️ Détail d’un log précis
     */
    public function show($id)
    {
        $log = AdActivityLog::with('performer')->findOrFail($id);

        return Inertia::render('Ad/ActivityLogDetail', [
            'log' => $log,
        ]);
    }

    /**
     * 🧍‍♂️ Historique d’un utilisateur spécifique
     */
    public function showUserLogs($id)
    {
        $user = User::findOrFail($id);

        $email = $user->email;
        $username = explode('@', $email)[0];
        $fullName = trim(strtolower($user->first_name . ' ' . $user->last_name));

        $logs = AdActivityLog::where(function ($query) use ($email, $username, $fullName, $id) {
            $query
                // ✅ Logs effectués PAR cet utilisateur
                ->where('performed_by_id', $id)
                // ✅ OU logs qui LE concernent
                ->orWhere(function ($q) use ($email, $username, $fullName) {
                    $q->whereRaw('LOWER(target_user) LIKE ?', ['%' . strtolower($email) . '%'])
                        ->orWhereRaw('LOWER(target_user) LIKE ?', ['%' . strtolower($username) . '%'])
                        ->orWhereRaw('LOWER(target_user_name) LIKE ?', ['%' . $fullName . '%']);
                });
        })
            ->with('performer')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Ad/UserActivityHistory', [
            'user' => $user,
            'logs' => $logs,
        ]);
    }
}
