<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Inertia\Inertia;
use Illuminate\Support\Arr;
class AdUserController extends Controller
{
    public function index()
    {
        return Inertia::render('Ad/IpConfigPage');
    }

    public function ipConfig(Request $request)
    {
        // Récupérer les credentials depuis .env
        $host = env('SSH_HOST');
        $user = env('SSH_USER');
        $password = env('SSH_PASSWORD');
        $keyPath = env('SSH_KEY_PATH');

        // Vérifier que les configs existent
        if (!$host || !$user) {
            return response()->json([
                'success' => false,
                'message' => 'Configuration SSH manquante dans .env',
            ], 500);
        }

        // Priorité : clé SSH > mot de passe
        if ($keyPath && file_exists($keyPath)) {
            $command = [
                'ssh',
                '-i', $keyPath,
                '-o', 'StrictHostKeyChecking=no',
                "{$user}@{$host}",
                'ipconfig'
            ];
        } elseif ($password) {
            // Utiliser sshpass (doit être installé : apt install sshpass)
            $command = [
                'sshpass', '-p', $password,
                'ssh', '-o', 'StrictHostKeyChecking=no',
                "{$user}@{$host}",
                'ipconfig'
            ];
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Aucune méthode d\'authentification configurée',
            ], 500);
        }

        try {
            $process = new Process($command);
            $process->setTimeout(15);
            $process->run();

            if (!$process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }

            $output = mb_convert_encoding($process->getOutput(), 'UTF-8', 'auto');
            
            // Extraire les IPv4
            preg_match_all('/IPv4 Address[^\:]*:\s*([0-9]{1,3}(?:\.[0-9]{1,3}){3})/i', $output, $matches);
            $ips = $matches[1] ?? [];

            return response()->json([
                'success' => true,
                'ips' => $ips,
                'raw' => $output,
            ]);
        } catch (\Throwable $e) {
            \Log::error('ipConfig error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur SSH : ' . $e->getMessage(),
            ], 500);
        }
    }

  
 public function adUsers()
    {
        // Récupérer les credentials depuis .env
        $host = env('SSH_HOST');
        $user = env('SSH_USER');
        $password = env('SSH_PASSWORD');
        $keyPath = env('SSH_KEY_PATH');

        if (!$host || !$user) {
            return back()->withErrors(['Erreur' => 'Configuration SSH manquante dans .env']);
        }

        // Commande PowerShell pour récupérer les utilisateurs AD
        $psCommand = 'powershell -NoProfile -NonInteractive -Command "Import-Module ActiveDirectory; '
            . 'Get-ADUser -Filter * -Properties Name,SamAccountName,EmailAddress | '
            . 'Select-Object Name,SamAccountName,EmailAddress | ConvertTo-Json -Depth 3"';

        // Construire la commande SSH
        if ($keyPath && file_exists($keyPath)) {
            $command = [
                'ssh', '-i', $keyPath,
                '-o', 'StrictHostKeyChecking=no',
                "{$user}@{$host}",
                $psCommand
            ];
        } elseif ($password) {
            $command = [
                'sshpass', '-p', $password,
                'ssh', '-o', 'StrictHostKeyChecking=no',
                "{$user}@{$host}",
                $psCommand
            ];
        } else {
            return back()->withErrors(['Erreur' => 'Aucune méthode d\'authentification configurée']);
        }

        try {
            $process = new Process($command);
            $process->setTimeout(60);
            $process->run();

            if (!$process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }

            $output = trim($process->getOutput());
            $decoded = json_decode($output, true);

            // Si PowerShell renvoie un seul objet, transformer en tableau
            if (isset($decoded['Name']) && isset($decoded['SamAccountName'])) {
                $decoded = [$decoded];
            }

            // Nettoyage des données
            $users = collect($decoded)->map(function ($user) {
                return [
                    'name' => Arr::get($user, 'Name', ''),
                    'sam' => Arr::get($user, 'SamAccountName', ''),
                    'email' => Arr::get($user, 'EmailAddress', ''),
                ];
            })->toArray();

            // ✅ Retourner une page Inertia (pas JSON)
            return Inertia::render('Ad/UsersList', [
                'users' => $users,
            ]);

        } catch (\Throwable $e) {
            \Log::error('Erreur récupération AD : ' . $e->getMessage());
            return back()->withErrors(['Erreur' => 'Impossible de récupérer les utilisateurs AD.']);
        }
    }

}