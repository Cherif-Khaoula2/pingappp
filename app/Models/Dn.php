<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dn extends Model
{
    use HasFactory;

    protected $fillable = ['nom', 'path'];

    public function users()
    {
        return $this->belongsToMany(User::class, 'dn_user', 'dn_id', 'user_id');
    }
}
