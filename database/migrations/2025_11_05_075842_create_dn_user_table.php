<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dn_user', function (Blueprint $table) {
            $table->id();

            // 🧩 Adapter le type pour correspondre à users.id (INT UNSIGNED)
            $table->unsignedInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->foreignId('dn_id')->constrained('dns')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['user_id', 'dn_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dn_user');
    }
};
