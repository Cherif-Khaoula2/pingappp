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

  
public function adUsers(Request $request)
{
    // Récupérer les credentials depuis .env (comme pour ipConfig)
    $host = env('SSH_HOST');
    $user = env('SSH_USER');
    $password = env('SSH_PASSWORD');
    $keyPath = env('SSH_KEY_PATH');

    if (!$host || !$user) {
        return response()->json([
            'success' => false,
            'message' => 'Configuration SSH manquante dans .env',
        ], 500);
    }

    // Paramètres de pagination côté serveur
    $page = max(1, (int) $request->input('page', 1));
    $perPage = max(10, min(100, (int) $request->input('per_page', 50))); // plafonner

    // Optionnel : recherche / filtre rapide pour réduire la charge
    $search = $request->input('search', null);

    // Construire la commande PowerShell. On récupère Name, SamAccountName, EmailAddress -> JSON
    // On encode la commande en une seule chaîne pour la passer via SSH.
    $psFilter = $search ? " -Filter \"Name -like '*$search*'\" " : " -Filter * ";
    $psCommand = "powershell -NoProfile -NonInteractive -Command \"Import-Module ActiveDirectory; "
        . "Get-ADUser $psFilter -Properties Name,SamAccountName,EmailAddress | "
        . "Select-Object Name,SamAccountName,EmailAddress | ConvertTo-Json -Depth 4\"";

    if ($keyPath && file_exists($keyPath)) {
        $command = [
            'ssh',
            '-i', $keyPath,
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
        return response()->json([
            'success' => false,
            'message' => 'Aucune méthode d\'authentification configurée',
        ], 500);
    }

    try {
        $process = new Process($command);
        // Si le catalogue AD est grand, augmenter le timeout
        $process->setTimeout(60);
        $process->run();

        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        $output = trim($process->getOutput());

        // Essayer de décoder le JSON renvoyé par PowerShell
        $decoded = json_decode($output, true);

        // PowerShell renvoie un objet si 1 élément, ou un tableau si >1
        if ($decoded === null) {
            // Tentative de correction d'encodage (UTF-8) ou fallback à extraction par regex
            $outputUtf8 = mb_convert_encoding($output, 'UTF-8', 'auto');
            $decoded = json_decode($outputUtf8, true);

            if ($decoded === null) {
                \Log::error("AD JSON decode failed. Raw output length: " . strlen($outputUtf8));
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de parser la sortie PowerShell (JSON). Voir logs serveur.',
                    'raw' => $outputUtf8,
                ], 500);
            }
        }

        // Normaliser en tableau d'éléments
        if (isset($decoded['Name']) && isset($decoded['SamAccountName'])) {
            $users = [$decoded]; // un seul objet -> transformer en tableau
        } else {
            $users = $decoded;
        }

        // Défensive: s'assurer que chaque user a les clés attendues
        $users = array_map(function($u) {
            return [
                'name' => Arr::get($u, 'Name', ''),
                'sam' => Arr::get($u, 'SamAccountName', ''),
                'email' => Arr::get($u, 'EmailAddress', ''),
            ];
        }, $users);

        // Pagination côté serveur
        $total = count($users);
        $offset = ($page - 1) * $perPage;
        $paged = array_slice($users, $offset, $perPage);

        // Renvoyer vers une interface Inertia (ou JSON si API)
        // Ex: si tu veux une page Inertia:
        if ($request->wantsJson() === false && $request->header('X-Inertia')) {
            return Inertia::render('Ad/UsersList', [
                'users' => $paged,
                'meta' => [
                    'total' => $total,
                    'page' => $page,
                    'per_page' => $perPage
                ]
            ]);
        }

        // Sinon renvoyer JSON API
        return response()->json([
            'success' => true,
            'users' => $paged,
            'meta' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage
            ],
        ]);
    } catch (\Throwable $e) {
        \Log::error('adUsers error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération AD : ' . $e->getMessage(),
        ], 500);
    }
}

}