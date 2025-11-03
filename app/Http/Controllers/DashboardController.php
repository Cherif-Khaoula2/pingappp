<?php

namespace App\Http\Controllers;

use App\Models\AdActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class AdDashboardController extends Controller
{
    public function index(Request $request)
    {
        // Période par défaut: 7 derniers jours
        $period = $request->get('period', 7);
        $startDate = now()->subDays($period);

        // 📊 STATISTIQUES GÉNÉRALES
        $stats = [
            'total_logs' => AdActivityLog::count(),
            'today_logs' => AdActivityLog::whereDate('created_at', today())->count(),
            'today_logins' => AdActivityLog::where('action', 'login')
                ->where('status', 'success')
                ->whereDate('created_at', today())
                ->count(),
            'today_failed' => AdActivityLog::where('status', 'failed')
                ->whereDate('created_at', today())
                ->count(),
            'today_blocks' => AdActivityLog::where('action', 'block_user')
                ->whereDate('created_at', today())
                ->count(),
            'today_unblocks' => AdActivityLog::where('action', 'unblock_user')
                ->whereDate('created_at', today())
                ->count(),
            'today_creations' => AdActivityLog::where('action', 'create_user')
                ->whereDate('created_at', today())
                ->count(),
            'today_resets' => AdActivityLog::where('action', 'reset_password')
                ->whereDate('created_at', today())
                ->count(),
        ];

        // 👥 UTILISATEURS LES PLUS CONNECTÉS (période sélectionnée)
        $topConnectedUsers = AdActivityLog::select('target_user', 'target_user_name')
            ->where('action', 'login')
            ->where('status', 'success')
            ->where('created_at', '>=', $startDate)
            ->groupBy('target_user', 'target_user_name')
            ->selectRaw('count(*) as login_count')
            ->orderByDesc('login_count')
            ->limit(10)
            ->get();

        // 🔒 UTILISATEURS LES PLUS BLOQUÉS (période sélectionnée)
        $topBlockedUsers = AdActivityLog::select('target_user', 'target_user_name')
            ->where('action', 'block_user')
            ->where('created_at', '>=', $startDate)
            ->groupBy('target_user', 'target_user_name')
            ->selectRaw('count(*) as block_count')
            ->orderByDesc('block_count')
            ->limit(10)
            ->get();

        // 👨‍💼 ADMINISTRATEURS LES PLUS ACTIFS (période sélectionnée)
        $topAdmins = AdActivityLog::select('performed_by_name')
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('performed_by_name')
            ->groupBy('performed_by_name')
            ->selectRaw('count(*) as action_count')
            ->orderByDesc('action_count')
            ->limit(10)
            ->get();

        // 📈 ACTIVITÉS PAR JOUR (période sélectionnée)
        $dailyActivity = AdActivityLog::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as total'),
                DB::raw('sum(case when status = "success" then 1 else 0 end) as success'),
                DB::raw('sum(case when status = "failed" then 1 else 0 end) as failed')
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // 📊 RÉPARTITION PAR TYPE D'ACTION (période sélectionnée)
        $actionBreakdown = AdActivityLog::select('action')
            ->where('created_at', '>=', $startDate)
            ->groupBy('action')
            ->selectRaw('count(*) as count')
            ->orderByDesc('count')
            ->get();

        // 🕐 HEURES DE POINTE (période sélectionnée)
        $hourlyActivity = AdActivityLog::select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('count(*) as count')
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        // 🌍 TOP IPs (période sélectionnée)
        $topIps = AdActivityLog::select('ip_address')
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('ip_address')
            ->groupBy('ip_address')
            ->selectRaw('count(*) as count')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        // 🚨 DERNIÈRES ACTIVITÉS ÉCHOUÉES
        $recentFailures = AdActivityLog::where('status', 'failed')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // 🆕 CRÉATIONS RÉCENTES
        $recentCreations = AdActivityLog::where('action', 'create_user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // 🔄 COMPARAISON AVEC PÉRIODE PRÉCÉDENTE
        $previousPeriodStart = now()->subDays($period * 2);
        $previousPeriodEnd = $startDate;

        $previousStats = [
            'logins' => AdActivityLog::where('action', 'login')
                ->where('status', 'success')
                ->whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])
                ->count(),
            'blocks' => AdActivityLog::where('action', 'block_user')
                ->whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])
                ->count(),
            'creations' => AdActivityLog::where('action', 'create_user')
                ->whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])
                ->count(),
        ];

        $currentPeriodStats = [
            'logins' => AdActivityLog::where('action', 'login')
                ->where('status', 'success')
                ->where('created_at', '>=', $startDate)
                ->count(),
            'blocks' => AdActivityLog::where('action', 'block_user')
                ->where('created_at', '>=', $startDate)
                ->count(),
            'creations' => AdActivityLog::where('action', 'create_user')
                ->where('created_at', '>=', $startDate)
                ->count(),
        ];

        // Calcul des pourcentages d'évolution
        $trends = [
            'logins' => $this->calculateTrend($currentPeriodStats['logins'], $previousStats['logins']),
            'blocks' => $this->calculateTrend($currentPeriodStats['blocks'], $previousStats['blocks']),
            'creations' => $this->calculateTrend($currentPeriodStats['creations'], $previousStats['creations']),
        ];

        return Inertia::render('/Dashboard', [
            'stats' => $stats,
            'topConnectedUsers' => $topConnectedUsers,
            'topBlockedUsers' => $topBlockedUsers,
            'topAdmins' => $topAdmins,
            'dailyActivity' => $dailyActivity,
            'actionBreakdown' => $actionBreakdown,
            'hourlyActivity' => $hourlyActivity,
            'topIps' => $topIps,
            'recentFailures' => $recentFailures,
            'recentCreations' => $recentCreations,
            'currentPeriodStats' => $currentPeriodStats,
            'trends' => $trends,
            'period' => $period,
        ]);
    }

    /**
     * Calcule le pourcentage d'évolution entre deux périodes
     */
    private function calculateTrend($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }
        
        return round((($current - $previous) / $previous) * 100, 1);
    }

    /**
     * Export du dashboard en PDF
     */
    public function exportPdf(Request $request)
    {
        $period = $request->get('period', 7);
        // Implémentation de l'export PDF selon vos besoins
        // Vous pouvez utiliser une librairie comme DomPDF ou Snappy
    }
}