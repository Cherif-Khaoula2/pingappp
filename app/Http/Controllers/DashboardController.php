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
            $period = 30;

            // Statistiques
            $stats = [
                'total_logs' => AdActivityLog::count(),
                'today_logs' => AdActivityLog::whereDate('created_at', today())->count(),
                'login_count' => AdActivityLog::where('action', 'login')->count(),
                'logout_count' => AdActivityLog::where('action', 'logout')->count(),
                'block_count' => AdActivityLog::where('action', 'block_user')->count(),
                'failed' => AdActivityLog::where('status', 'failed')->count(),
            ];

            Log::info('Stats:', $stats);

            // Activité des derniers jours
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

            Log::info('Activity Data:', ['count' => count($activityData), 'data' => $activityData]);

            // ✅ CORRECTION : Utiliser 'performer' comme dans AdActivityLogController
            $recentLogs = AdActivityLog::with('performer:id,first_name,last_name,email')
                ->latest('created_at')
                ->limit(10)
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
                        'status' => $log->status ?? 'success',
                        'performer_name' => $performerName,
                        'created_at_formatted' => Carbon::parse($log->created_at)
                            ->timezone($tz)
                            ->diffForHumans(),
                    ];
                })
                ->toArray();

            Log::info('Recent Logs:', ['count' => count($recentLogs), 'logs' => $recentLogs]);

            $data = [
                'stats' => $stats,
                'activityData' => $activityData,
                'recentLogs' => $recentLogs,
                'period' => $period,
            ];

            Log::info('=== DATA SENT TO INERTIA ===', $data);

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
                'recentLogs' => [],
                'period' => 30,
                'error' => 'Erreur lors du chargement du dashboard: ' . $e->getMessage(),
            ]);
        }
    }
}