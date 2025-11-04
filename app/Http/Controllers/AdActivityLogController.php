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

public function showUserLogs($id)
{
    $user = \App\Models\User::findOrFail($id);

    // ✅ CORRECTION : utiliser 'performed_by_id' au lieu de 'performed_by'
    $logs = \App\Models\AdActivityLog::where('performed_by_id', $id)
        ->orderBy('created_at', 'desc')
        ->get();

    return Inertia::render('Ad/UserActivityHistory', [
        'user' => $user,
        'logs' => $logs
    ]);
}

 public function performer()
    {
        return $this->belongsTo(User::class, 'performed_by_id');
    }
    
    /**
     * ✅ Alias pour compatibilité
     * (peut être utilisée dans DashboardController)
     */
    public function performed_by()
    {
        return $this->belongsTo(User::class, 'performed_by_id');
    }
    
    /**
     * ✅ Alias supplémentaire
     */
    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by_id');
    }
    
    /**
     * ✅ Accesseur pour le nom de l'utilisateur qui a effectué l'action
     */
    public function getPerformedByNameAttribute()
    {
        if ($this->performer) {
            return trim($this->performer->first_name . ' ' . $this->performer->last_name) 
                   ?: $this->performer->email;
        }
        return 'Système';
    }

}