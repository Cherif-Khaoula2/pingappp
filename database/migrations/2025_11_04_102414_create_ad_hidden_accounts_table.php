<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ad_hidden_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('samaccountname')->unique(); // Nom AD du compte (ex: svc_backup)
            $table->string('reason')->nullable();       // Optionnel : raison du masquage
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_hidden_accounts');
    }
};
