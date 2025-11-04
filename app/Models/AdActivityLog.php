<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdActivityLog extends Model
{
    protected $fillable = [
        'action',
        'target_user',
        'target_user_name',
        'performed_by',
        'performed_by_name',
        'ip_address',
        'user_agent',
        'details',
        'status',
        'error_message',
    ];

    protected $casts = [
        'details' => 'array',
        'created_at' => 'datetime',
    ];

    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    // Helper pour créer un log facilement
    public static function logAction(
        string $action,
        string $targetUser,
        ?string $targetUserName = null,
        ?array $details = null,
        string $status = 'success',
        ?string $errorMessage = null
    ): self {
        return self::create([
            'action' => $action,
            'target_user' => $targetUser,
            'target_user_name' => $targetUserName,
            'performed_by' => auth()->id(),
            'performed_by_name' => auth()->user()?->name ?? 'System',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'details' => $details,
            'status' => $status,
            'error_message' => $errorMessage,
        ]);
    }

    // Scope pour filtrer par action
    public function scopeOfAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    // Scope pour filtrer par utilisateur ciblé
    public function scopeForUser($query, string $targetUser)
    {
        return $query->where('target_user', $targetUser);
    }

    // Scope pour filtrer par date
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }
}