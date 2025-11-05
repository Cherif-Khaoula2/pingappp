<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AdActivityLog extends Model
{
    protected $table = 'ad_activity_logs';

    protected $fillable = [
        'performed_by_id',
        'action',
        'target_user',
        'target_user_name',
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
        'updated_at' => 'datetime',
    ];

    /**
     * ✅ Relation avec le modèle User (celui qui a effectué l'action)
     */
 public function performer()
{
    return $this->belongsTo(User::class, 'performed_by_id');
}

    /**
     * ✅ Alias pour compatibilité
     */
    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by_id');
    }

    /**
     * ✅ Méthode statique pour enregistrer une action
     */
    public static function logAction(
        string $action,
        ?string $targetUser = null,
        ?string $targetUserName = null,
        ?array $details = null,
        string $status = 'success',
        ?string $errorMessage = null
    ): self {
        $user = Auth::user();

        return self::create([
            'performed_by_id' => $user?->id,
            'action' => $action,
            'target_user' => $targetUser,
            'target_user_name' => $targetUserName,
            'performed_by_name' => $user ? trim($user->first_name . ' ' . $user->last_name) : 'Système',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'details' => $details,
            'status' => $status,
            'error_message' => $errorMessage,
        ]);
    }

    /**
     * ✅ Accesseur pour obtenir le nom de celui qui a effectué l'action
     */
    public function getPerformedByNameAttribute($value)
    {
        // Si la valeur existe déjà en base, on la retourne
        if ($value) {
            return $value;
        }

        // Sinon on essaie de la récupérer depuis la relation
        if ($this->performer) {
            return trim($this->performer->first_name . ' ' . $this->performer->last_name) 
                   ?: $this->performer->email;
        }

        return 'Système';
    }

    /**
     * ✅ Scopes pour faciliter les requêtes
     */
    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    public function scopeByUser($query, int $userId)
    {
        return $query->where('performed_by_id', $userId);
    }

    public function scopeByTarget($query, string $targetUser)
    {
        return $query->where('target_user', 'like', "%{$targetUser}%");
    }

    public function scopeSuccessful($query)
    {
        return $query->where('status', 'success');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }
}