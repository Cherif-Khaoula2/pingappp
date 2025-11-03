<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ad_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('action'); // login, logout, block, unblock, reset_password, create_user
            $table->string('target_user'); // SamAccountName de l'utilisateur AD ciblé
            $table->string('target_user_name')->nullable(); // Nom complet de l'utilisateur AD
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete(); // Qui a fait l'action
            $table->string('performed_by_name'); // Nom de celui qui a fait l'action
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->text('details')->nullable(); // JSON avec plus d'infos
            $table->enum('status', ['success', 'failed'])->default('success');
            $table->text('error_message')->nullable();
            $table->timestamps();
            
            // Index pour recherche rapide
            $table->index('target_user');
            $table->index('performed_by');
            $table->index('action');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_activity_logs');
    }
};