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
    public function index(Request $request)
    {
        try {
            Log::info('=== DASHBOARD START ===');
            
            $tz = 'Africa/Algiers';
            $period = $request->input('period', 30);

            // ==================== STATISTIQUES COMPLÈTES ====================
            $stats = [
                // Statistiques globales
                'total_logs' => AdActivityLog::count(),
                'today_logs' => AdActivityLog::whereDate('created_at', today())->count(),
                'failed' => AdActivityLog::where('status', 'failed')->count(),
                
                // Statistiques par type d'action
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

            Log::info('Stats complètes:', $stats);

            // ==================== ACTIVITÉ TEMPORELLE ====================
            $activityData = AdActivityLog::select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as total')
                )
                ->where('created_at', '>=', Carbon::now($tz)->subDays($period))
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get()
                ->map(function ($item) {
                    return [
                        'date' => Carbon::parse($item->date)->format('d/m'),
                        'total' => (int) $item->total,
                    ];
                })
                ->toArray();

            // Remplir les jours manquants avec 0
            $dateRange = collect();
            for ($i = $period - 1; $i >= 0; $i--) {
                $dateRange->push(Carbon::now($tz)->subDays($i)->format('Y-m-d'));
            }

            $activityMap = collect($activityData)->keyBy(function ($item) {
                return Carbon::createFromFormat('d/m', $item['date'])->format('Y-m-d');
            });

            $activityData = $dateRange->map(function ($date) use ($activityMap) {
                return [
                    'date' => Carbon::parse($date)->format('d/m'),
                    'total' => $activityMap->get($date)['total'] ?? 0,
                ];
            })->toArray();

            // ==================== RÉPARTITION DES ACTIONS ====================
            $actionBreakdown = AdActivityLog::select(
                    'action',
                    DB::raw('COUNT(*) as count')
                )
                ->where('created_at', '>=', Carbon::now($tz)->subDays($period))
                ->groupBy('action')
                ->orderBy('count', 'desc')
                ->get()
                ->map(function ($item) {
                    // Traduction des actions en français
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

                    return [
                        'action' => $actionLabels[$item->action] ?? ucfirst(str_replace('_', ' ', $item->action)),
                        'count' => (int) $item->count,
                    ];
                })
                ->toArray();

          // ==================== TOP UTILISATEURS ACTIFS ====================
$topPerformers = AdActivityLog::select(
        'performed_by_id',
        DB::raw('COUNT(*) as count')
    )
    ->where('created_at', '>=', Carbon::now($tz)->subDays($period))
    ->whereNotNull('performed_by_id')
    ->groupBy('performed_by_id')
    ->orderBy('count', 'desc')
    ->limit(10)
    ->with('performer:id,first_name,last_name,email')
    ->get()
    ->map(function ($item) {
        $name = 'Système';

        if ($item->performer) {
            $name = trim($item->performer->first_name . ' ' . $item->performer->last_name);
            if (empty($name)) {
                $name = $item->performer->email;
            }
        }

        return [
            'id' => $item->performed_by_id,
            'name' => $name,
            'count' => (int) $item->count,
        ];
    })
    ->toArray();

            // ==================== LOGS RÉCENTS (100 pour permettre un bon filtrage) ====================
            $recentLogs = AdActivityLog::with('performer:id,first_name,last_name,email')
                ->latest('created_at')
                ->limit(100)
                ->get()
                ->map(function ($log) use ($tz) {
                    $performerName = 'Système';
                    
                    if ($log->performer) {
                        $performerName = trim($log->performer->first_name . ' ' . $log->performer->last_name);
                        if (empty($performerName)) {
                            $performerName = $log->performer->email;
                        }
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

            // ==================== DONNÉES COMPLÈTES ====================
            $data = [
                'stats' => $stats,
                'activityData' => $activityData,
                'actionBreakdown' => $actionBreakdown,
                'topPerformers' => $topPerformers,
                'recentLogs' => $recentLogs,
                'period' => $period,
            ];

            Log::info('=== DATA SENT TO INERTIA ===', [
                'stats_count' => count($stats),
                'activity_count' => count($activityData),
                'actions_count' => count($actionBreakdown),
                'performers_count' => count($topPerformers),
                'logs_count' => count($recentLogs)
            ]);

            return Inertia::render('Dashboard', $data);
            
        } catch (\Exception $e) {
            Log::error('Dashboard Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Retourner des valeurs par défaut en cas d'erreur
            return Inertia::render('Dashboard', [
                'stats' => [
                    'total_logs' => 0,
                    'today_logs' => 0,
                    'failed' => 0,
                    'login_count' => 0,
                    'logout_count' => 0,
                    'block_count' => 0,
                    'unblock_count' => 0,
                    'create_count' => 0,
                    'update_count' => 0,
                    'delete_count' => 0,
                    'reset_password_count' => 0,
                    'change_password_count' => 0,
                ],
                'activityData' => [],
                'actionBreakdown' => [],
                'topPerformers' => [],
                'recentLogs' => [],
                'period' => 30,
                'error' => 'Erreur lors du chargement du dashboard: ' . $e->getMessage(),
            ]);
        }
    }
}