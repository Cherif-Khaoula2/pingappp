<?php

namespace App\Http\Controllers;

use App\Models\AdActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', 7); // 7 jours par défaut
        $startDate = Carbon::now()->subDays($period);
        
        // Statistiques principales
        $stats = [
            'today_logs' => AdActivityLog::whereDate('created_at', today())->count(),
            'today_logins' => AdActivityLog::whereDate('created_at', today())
                ->where('action', 'login')
                ->where('status', 'success')
                ->count(),
            'today_blocks' => AdActivityLog::whereDate('created_at', today())
                ->where('action', 'block_user')
                ->count(),
            'today_creations' => AdActivityLog::whereDate('created_at', today())
                ->where('action', 'create_user')
                ->count(),
        ];

        // Activité quotidienne
        $dailyActivity = AdActivityLog::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(CASE WHEN status = "success" THEN 1 END) as success'),
                DB::raw('COUNT(CASE WHEN status = "failed" THEN 1 END) as failed')
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Répartition par type d'action
        $actionBreakdown = AdActivityLog::select('action', DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', $startDate)
            ->groupBy('action')
            ->get();

        // Activité par heure
        $hourlyActivity = AdActivityLog::select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('COUNT(*) as count')
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        // Top utilisateurs connectés
        $topConnectedUsers = AdActivityLog::select(
                'target_user',
                'target_user_name',
                DB::raw('COUNT(*) as login_count')
            )
            ->where('action', 'login')
            ->where('status', 'success')
            ->where('created_at', '>=', $startDate)
            ->groupBy('target_user', 'target_user_name')
            ->orderByDesc('login_count')
            ->limit(10)
            ->get();

        // Top utilisateurs bloqués
        $topBlockedUsers = AdActivityLog::select(
                'target_user',
                'target_user_name',
                DB::raw('COUNT(*) as block_count')
            )
            ->where('action', 'block_user')
            ->where('created_at', '>=', $startDate)
            ->groupBy('target_user', 'target_user_name')
            ->orderByDesc('block_count')
            ->limit(10)
            ->get();

        // Top admins actifs
        $topAdmins = AdActivityLog::select(
                'performed_by_name',
                DB::raw('COUNT(*) as action_count')
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy('performed_by_name')
            ->orderByDesc('action_count')
            ->limit(10)
            ->get();

        // Derniers échecs
        $recentFailures = AdActivityLog::where('status', 'failed')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Créations récentes
        $recentCreations = AdActivityLog::where('action', 'create_user')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Tendances (comparaison avec période précédente)
        $previousStartDate = Carbon::now()->subDays($period * 2);
        $previousEndDate = $startDate;

        $currentLogins = AdActivityLog::where('action', 'login')
            ->where('status', 'success')
            ->where('created_at', '>=', $startDate)
            ->count();

        $previousLogins = AdActivityLog::where('action', 'login')
            ->where('status', 'success')
            ->whereBetween('created_at', [$previousStartDate, $previousEndDate])
            ->count();

        $currentBlocks = AdActivityLog::where('action', 'block_user')
            ->where('created_at', '>=', $startDate)
            ->count();

        $previousBlocks = AdActivityLog::where('action', 'block_user')
            ->whereBetween('created_at', [$previousStartDate, $previousEndDate])
            ->count();

        $currentCreations = AdActivityLog::where('action', 'create_user')
            ->where('created_at', '>=', $startDate)
            ->count();

        $previousCreations = AdActivityLog::where('action', 'create_user')
            ->whereBetween('created_at', [$previousStartDate, $previousEndDate])
            ->count();

        $trends = [
            'logins' => $previousLogins > 0 
                ? round((($currentLogins - $previousLogins) / $previousLogins) * 100, 1)
                : 0,
            'blocks' => $previousBlocks > 0 
                ? round((($currentBlocks - $previousBlocks) / $previousBlocks) * 100, 1)
                : 0,
            'creations' => $previousCreations > 0 
                ? round((($currentCreations - $previousCreations) / $previousCreations) * 100, 1)
                : 0,
        ];

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'dailyActivity' => $dailyActivity,
            'actionBreakdown' => $actionBreakdown,
            'hourlyActivity' => $hourlyActivity,
            'topConnectedUsers' => $topConnectedUsers,
            'topBlockedUsers' => $topBlockedUsers,
            'topAdmins' => $topAdmins,
            'recentFailures' => $recentFailures,
            'recentCreations' => $recentCreations,
            'trends' => $trends,
            'period' => $period,
        ]);
    }
}