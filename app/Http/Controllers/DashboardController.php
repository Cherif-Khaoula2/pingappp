<?php

namespace App\Http\Controllers;

use App\Models\AdActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * 📊 Tableau de bord principal
     */
    public function index(Request $request)
    {
        try {
            Log::info('=== [DASHBOARD] Début du chargement ===');

            $tz = 'Africa/Algiers';
            $period = (int) $request->input('period', 30);

            // ==================== 1️⃣ STATISTIQUES GLOBALES ====================
            $stats = [
                'total_logs' => AdActivityLog::count(),
                'today_logs' => AdActivityLog::whereDate('created_at', today())->count(),
                'failed' => AdActivityLog::where('status', 'failed')->count(),

                'login_count' => AdActivityLog::where('action', 'login')->count(),
                'logout_count' => AdActivityLog::where('action', 'logout')->count(),
                'block_count' => AdActivityLog::where('action', 'block_user')->count(),
                'unblock_count' => AdActivityLog::where('action', 'unblock_user')->count(),
                'create_count' => AdActivityLog::where('action', 'create_user')->count(),
                'update_count' => AdActivityLog::where('action', 'update_user')->count(),
                'delete_count' => AdActivityLog::where('action', 'delete_user')->count(),
                'reset_password_count' => AdActivityLog::where('action', 'reset_password')->count(),
                'change_password_count' => AdActivityLog::where('action', 'change_password')->count(),
            ];

            // ==================== 2️⃣ ACTIVITÉ JOURNALIÈRE ====================
            $rawActivity = AdActivityLog::select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as total')
                )
                ->where('created_at', '>=', Carbon::now($tz)->subDays($period))
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get();

            // Convertir en tableau associatif par date
            $activityByDate = $rawActivity->keyBy('date');

            // Remplir les jours manquants avec 0
            $activityData = collect(range($period - 1, 0))
                ->map(function ($i) use ($activityByDate, $tz) {
                    $date = Carbon::now($tz)->subDays($i)->format('Y-m-d');
                    return [
                        'date' => Carbon::parse($date)->format('d/m'),
                        'total' => (int) ($activityByDate[$date]->total ?? 0),
                    ];
                })
                ->values()
                ->toArray();

            // ==================== 3️⃣ RÉPARTITION DES ACTIONS ====================
            $actionLabels = [
                'login' => 'Connexion',
                'logout' => 'Déconnexion',
                'block_user' => 'Blocage',
                'unblock_user' => 'Déblocage',
                'create_user' => 'Création',
                'update_user' => 'Modification',
                'delete_user' => 'Suppression',
                'reset_password' => 'Reset MDP',
                'change_password' => 'Change MDP',
            ];

            $actionBreakdown = AdActivityLog::select('action', DB::raw('COUNT(*) as count'))
                ->where('created_at', '>=', Carbon::now($tz)->subDays($period))
                ->groupBy('action')
                ->orderByDesc('count')
                ->get()
                ->map(fn($item) => [
                    'action' => $actionLabels[$item->action] ?? ucfirst(str_replace('_', ' ', $item->action)),
                    'count' => (int) $item->count,
                ])
                ->toArray();

            // ==================== 4️⃣ TOP UTILISATEURS ACTIFS ====================
            $topPerformers = AdActivityLog::with('performer:id,first_name,last_name,email')
                ->select('performed_by_id', DB::raw('COUNT(*) as count'))
                ->where('created_at', '>=', Carbon::now($tz)->subDays($period))
                ->whereNotNull('performed_by_id')
                ->groupBy('performed_by_id')
                ->orderByDesc('count')
                ->limit(10)
                ->get()
                ->map(function ($log) {
                    $name = 'Système';
                    if ($log->performer) {
                        $name = trim($log->performer->first_name . ' ' . $log->performer->last_name)
                            ?: $log->performer->email;
                    }

                    return [
                        'id' => $log->performed_by_id,
                        'name' => $name,
                        'count' => (int) $log->count,
                    ];
                })
                ->toArray();

            // ==================== 5️⃣ DERNIERS LOGS ====================
            $recentLogs = AdActivityLog::with('performer:id,first_name,last_name,email')
                ->latest()
                ->limit(100)
                ->get()
                ->map(function ($log) use ($tz) {
                    $performerName = 'Système';

                    if ($log->performer) {
                        $performerName = trim($log->performer->first_name . ' ' . $log->performer->last_name)
                            ?: $log->performer->email;
                    }

                    return [
                        'id' => $log->id,
                        'action' => $log->action,
                        'status' => $log->status ?? 'succeeded',
                        'performer_name' => $performerName,
                        'created_at' => $log->created_at,
                        'created_at_formatted' => Carbon::parse($log->created_at)
                            ->locale('fr')
                            ->timezone($tz)
                            ->diffForHumans(),
                    ];
                })
                ->toArray();

            // ==================== ✅ DONNÉES FINALES ====================
            $data = [
                'stats' => $stats,
                'activityData' => $activityData,
                'actionBreakdown' => $actionBreakdown,
                'topPerformers' => $topPerformers,
                'recentLogs' => $recentLogs,
                'period' => $period,
            ];

            Log::info('=== [DASHBOARD] Données envoyées à Inertia ===', [
                'stats' => count($stats),
                'activity' => count($activityData),
                'actions' => count($actionBreakdown),
                'performers' => count($topPerformers),
                'logs' => count($recentLogs),
            ]);

            return Inertia::render('Dashboard', $data);

        } catch (\Throwable $e) {
            Log::error('[DASHBOARD ERROR]', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return Inertia::render('Dashboard', [
                'stats' => array_fill_keys([
                    'total_logs', 'today_logs', 'failed', 'login_count', 'logout_count',
                    'block_count', 'unblock_count', 'create_count', 'update_count',
                    'delete_count', 'reset_password_count', 'change_password_count',
                ], 0),
                'activityData' => [],
                'actionBreakdown' => [],
                'topPerformers' => [],
                'recentLogs' => [],
                'period' => $request->input('period', 30),
                'error' => 'Erreur lors du chargement du tableau de bord : ' . $e->getMessage(),
            ]);
        }
    }
}
