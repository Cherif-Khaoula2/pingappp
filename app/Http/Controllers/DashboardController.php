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

            // ==================== STATISTIQUES GLOBALES ====================
            $stats = [
                'total_logs' => AdActivityLog::count(),
                'today_logs' => AdActivityLog::whereDate('created_at', today())->count(),
                'login_count' => AdActivityLog::where('action', 'login')->count(),
                'logout_count' => AdActivityLog::where('action', 'logout')->count(),
                'block_count' => AdActivityLog::where('action', 'block_user')->count(),
                'failed' => AdActivityLog::where('status', 'failed')->count(),
            ];

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
                    return [
                        'action' => ucfirst(str_replace('_', ' ', $item->action)),
                        'count' => (int) $item->count,
                    ];
                })
                ->toArray();

            // ==================== RÉPARTITION DES STATUTS ====================
            $statusBreakdown = AdActivityLog::select(
                    'status',
                    DB::raw('COUNT(*) as count')
                )
                ->where('created_at', '>=', Carbon::now($tz)->subDays($period))
                ->groupBy('status')
                ->get()
                ->map(function ($item) {
                    return [
                        'status' => $item->status ?? 'success',
                        'count' => (int) $item->count,
                    ];
                })
                ->toArray();

            // ==================== TOP UTILISATEURS ACTIFS ====================
            $topPerformers = AdActivityLog::select(
                    'performed_by',
                    DB::raw('COUNT(*) as count')
                )
                ->where('created_at', '>=', Carbon::now($tz)->subDays($period))
                ->whereNotNull('performed_by')
                ->groupBy('performed_by')
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
                        'id' => $item->performed_by,
                        'name' => $name,
                        'count' => (int) $item->count,
                    ];
                })
                ->toArray();

            // ==================== ACTIVITÉ HORAIRE ====================
            $hourlyActivity = AdActivityLog::select(
                    DB::raw('HOUR(created_at) as hour'),
                    DB::raw('COUNT(*) as count')
                )
                ->where('created_at', '>=', Carbon::now($tz)->subDays($period))
                ->groupBy('hour')
                ->orderBy('hour', 'asc')
                ->get()
                ->map(function ($item) {
                    return [
                        'hour' => (int) $item->hour,
                        'count' => (int) $item->count,
                    ];
                })
                ->toArray();

            // Remplir les heures manquantes avec 0
            $hourlyMap = collect($hourlyActivity)->keyBy('hour');
            $hourlyActivity = collect(range(0, 23))->map(function ($hour) use ($hourlyMap) {
                return [
                    'hour' => $hour,
                    'count' => $hourlyMap->get($hour)['count'] ?? 0,
                ];
            })->toArray();

            // ==================== LOGS RÉCENTS ====================
            $recentLogs = AdActivityLog::with('performer:id,first_name,last_name,email')
                ->latest('created_at')
                ->limit(50)
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
                'statusBreakdown' => $statusBreakdown,
                'topPerformers' => $topPerformers,
                'hourlyActivity' => $hourlyActivity,
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
            
            // Retourner des valeurs par défaut
            return Inertia::render('Dashboard', [
                'stats' => [
                    'total_logs' => 0,
                    'today_logs' => 0,
                    'login_count' => 0,
                    'logout_count' => 0,
                    'block_count' => 0,
                    'failed' => 0,
                ],
                'activityData' => [],
                'actionBreakdown' => [],
                'statusBreakdown' => [],
                'topPerformers' => [],
                'hourlyActivity' => [],
                'recentLogs' => [],
                'period' => 30,
                'error' => 'Erreur lors du chargement du dashboard: ' . $e->getMessage(),
            ]);
        }
    }
}