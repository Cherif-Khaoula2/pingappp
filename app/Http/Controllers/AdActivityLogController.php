<?php

namespace App\Http\Controllers;

use App\Models\AdActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
class AdActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AdActivityLog::with('performer')
            ->latest();

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

        // Pagination
        $logs = $query->paginate(50)->withQueryString();

        // Statistiques rapides
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

    public function show($id)
    {
        $log = AdActivityLog::with('performer')->findOrFail($id);

        return Inertia::render('Ad/ActivityLogDetail', [
            'log' => $log,
        ]);
    }

    // Export CSV
    public function export(Request $request)
    {
        $query = AdActivityLog::query();

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }

        $logs = $query->orderBy('created_at', 'desc')->get();

        $filename = 'ad_activity_logs_' . now()->format('Y-m-d_His') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($logs) {
            $file = fopen('php://output', 'w');
            
            // En-têtes CSV
            fputcsv($file, [
                'ID',
                'Action',
                'Utilisateur ciblé',
                'Nom utilisateur',
                'Effectué par',
                'Statut',
                'IP',
                'Date',
                'Erreur'
            ]);

            // Données
            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->action,
                    $log->target_user,
                    $log->target_user_name,
                    $log->performed_by_name,
                    $log->status,
                    $log->ip_address,
                    $log->created_at->format('Y-m-d H:i:s'),
                    $log->error_message,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
public function showUserLogs($id)
{
    $user = \App\Models\User::findOrFail($id);

    // 👉 adapte ici le nom de la colonne correcte
    $logs = \App\Models\AdActivityLog::where('performed_by', $id)
        ->orderBy('created_at', 'desc')
        ->get();

    return Inertia::render('Ad/UserActivityHistory', [
        'user' => $user,
        'logs' => $logs
    ]);
}



}