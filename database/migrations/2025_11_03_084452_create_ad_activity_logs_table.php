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
            $table->string('action');
            $table->string('target_user');
            $table->string('target_user_name')->nullable();
            $table->unsignedBigInteger('performed_by')->nullable();
            $table->string('performed_by_name');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->text('details')->nullable();
            $table->enum('status', ['success', 'failed'])->default('success');
            $table->text('error_message')->nullable();
            $table->timestamps();
            
            // Index pour recherche rapide
            $table->index('target_user');
            $table->index('performed_by');
            $table->index('action');
            $table->index('created_at');
            
            // PAS de contrainte de clé étrangère pour éviter les problèmes
            // La relation reste gérée au niveau de l'application (Eloquent)
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_activity_logs');
    }
};