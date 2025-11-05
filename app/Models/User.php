<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

   protected $fillable = [
    'first_name',
    'last_name',
    'email',
    'password',
    'samaccountname',
    'auth_type',
    
];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
        ];
    }

    // ⚡ Concatène prénom + nom
    public function getNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    // ⚡ Hash automatique du mot de passe
    public function setPasswordAttribute($password)
    {
        $this->attributes['password'] = Hash::needsRehash($password)
            ? Hash::make($password)
            : $password;
    }

    // ⚡ Scope pour trier par nom
    public function scopeOrderByName($query)
    {
        $query->orderBy('last_name')->orderBy('first_name');
    }

    // ⚡ Scope de recherche (nom/email)
    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($query) use ($search) {
                $query->where('first_name', 'like', "%$search%")
                    ->orWhere('last_name', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%");
            });
        });
    }
    public function isDemoUser(): bool
{
    // Désactive complètement la logique "utilisateur démo"
    return false;
}
public function dns()
{
    return $this->belongsToMany(Dn::class, 'dn_user', 'user_id', 'dn_id');
}

}






