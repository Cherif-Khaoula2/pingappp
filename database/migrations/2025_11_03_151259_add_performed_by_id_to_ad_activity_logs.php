<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ad_activity_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('ad_activity_logs', 'performed_by_id')) {
                $table->unsignedBigInteger('performed_by_id')->nullable()->after('id');
                $table->foreign('performed_by_id')
                      ->references('id')
                      ->on('users')
                      ->onDelete('set null');
            }
            
            // Ajouter d'autres colonnes si nécessaires
            if (!Schema::hasColumn('ad_activity_logs', 'target_user_name')) {
                $table->string('target_user_name')->nullable();
            }
            
            if (!Schema::hasColumn('ad_activity_logs', 'error_message')) {
                $table->text('error_message')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('ad_activity_logs', function (Blueprint $table) {
            $table->dropForeign(['performed_by_id']);
            $table->dropColumn(['performed_by_id', 'target_user_name', 'error_message']);
        });
    }
};