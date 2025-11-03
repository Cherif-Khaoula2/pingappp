<?php

namespace App\Http\Controllers;

use App\Models\AdActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Définir la timezone pour correspondre à Tinker (souvent celle du système)
        $tz = 'Africa/Algiers';
        $period = (int) $request->get('period', 30); // période en jours

        // 🔹 Statistiques globales comme Tinker
        $total_logs   = AdActivityLog::count();
        $today_logs   = AdActivityLog::whereDate('created_at', Carbon::today($tz))->count();
        $login_count  = AdActivityLog::where('action', 'login')->count();
        $logout_count = AdActivityLog::where('action', 'logout')->count();
        $block_count  = AdActivityLog::where('action', 'block_user')->count();
        $failed       = AdActivityLog::where('status', 'failed')->count();

        // 🔹 Activité des derniers jours
        $activityData = AdActivityLog::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total')
            )
            ->where('created_at', '>=', Carbon::now($tz)->subDays($period))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();

        // 🔹 Derniers logs
        $recentLogs = AdActivityLog::with('performed_by')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($log) use ($tz) {
                $log->created_at_formatted = Carbon::parse($log->created_at)->timezone($tz)->diffForHumans();
                $log->performer_name = $log->performed_by ? $log->performed_by->name : 'N/A';
                return $log;
            })
            ->toArray();

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_logs'   => (int) $total_logs,
                'today_logs'   => (int) $today_logs,
                'login_count'  => (int) $login_count,
                'logout_count' => (int) $logout_count,
                'block_count'  => (int) $block_count,
                'failed'       => (int) $failed,
            ],
            'activityData' => $activityData,
            'recentLogs'   => $recentLogs,
            'period'       => (int) $period,
        ]);
    }
}
