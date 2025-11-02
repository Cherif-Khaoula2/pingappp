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
    $host = env('SSH_HOST');
    $user = env('SSH_USER');
    $password = env('SSH_PASSWORD');
    $keyPath = env('SSH_KEY_PATH');

    if (!$host || !$user) {
        return back()->withErrors('Configuration SSH manquante dans .env');
    }

    // 📄 Pagination
    $page = max(1, (int) $request->input('page', 1));
    $perPage = max(10, min(100, (int) $request->input('per_page', 50)));

    // 🔍 Recherche facultative
    $search = trim($request->input('search', ''));

    // 📘 Commande PowerShell avec ou sans filtre
    if ($search !== '') {
        // Rechercher dans le nom, le SAM ou l’email
       $psCommand = "powershell -NoProfile -NonInteractive -Command \"" .
            "Import-Module ActiveDirectory; " .
            "Get-ADUser -Identity '$search' " .  // Sans les *
            "-Properties Name,SamAccountName,EmailAddress,LastLogonDate,PasswordLastSet,Enabled | " .
            "Select-Object Name,SamAccountName,EmailAddress,LastLogonDate,PasswordLastSet,Enabled | ConvertTo-Json -Depth 4\"";
    } else {
        // Liste complète
        $psCommand = "powershell -NoProfile -NonInteractive -Command \"" .
            "Import-Module ActiveDirectory; " .
            "Get-ADUser -Filter * -Properties Name,SamAccountName,EmailAddress,LastLogonDate,PasswordLastSet,Enabled | " .
            "Select-Object Name,SamAccountName,EmailAddress,LastLogonDate,PasswordLastSet,Enabled | ConvertTo-Json -Depth 4\"";
    }

    // 🔐 SSH avec clé ou mot de passe
    $command = $keyPath && file_exists($keyPath)
        ? ['ssh', '-i', $keyPath, '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $psCommand]
        : ['sshpass', '-p', $password, 'ssh', '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $psCommand];

    try {
        $process = new Process($command);
        $process->setTimeout(90);
        $process->run();

        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        $output = trim($process->getOutput());
        $decoded = json_decode($output, true);

        if ($decoded === null) {
            $decoded = json_decode(mb_convert_encoding($output, 'UTF-8', 'auto'), true);
        }

        // Normalisation des données
        $users = isset($decoded['Name']) ? [$decoded] : $decoded;
        $users = array_map(fn($u) => [
            'name' => $u['Name'] ?? '',
            'sam' => $u['SamAccountName'] ?? '',
            'email' => $u['EmailAddress'] ?? '',
            'lastLogon' => $u['LastLogonDate'] ?? '',
            'passwordLastSet' => $u['PasswordLastSet'] ?? '',
            'enabled' => $u['Enabled'] ?? false,
        ], $users ?? []);

        // 📊 Pagination manuelle
        $total = count($users);
        $paged = array_slice($users, ($page - 1) * $perPage, $perPage);

        // 📄 Rendu Inertia avec le champ de recherche
        return Inertia::render('Ad/UsersList', [
            'users' => $paged,
            'meta' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
            ],
            'filters' => [
                'search' => $search,
            ],
        ]);
    } catch (\Throwable $e) {
       
        return Inertia::render('Ad/UsersList', [
            'users' => [],
            'meta' => [],
        ]);
    }
}
public function toggleUserStatus(Request $request)
{
    $request->validate([
        'sam' => 'required|string',
        'action' => 'required|in:block,unblock',
    ]);

    $host = env('SSH_HOST');
    $user = env('SSH_USER');
    $password = env('SSH_PASSWORD');
    $keyPath = env('SSH_KEY_PATH');

    if (!$host || !$user) {
        return response()->json(['success' => false, 'message' => 'Configuration SSH manquante'], 500);
    }

    $sam = $request->input('sam');
    $action = $request->input('action');

    // Définir la commande PowerShell
    $psCommand = "powershell -NoProfile -NonInteractive -Command \"" .
        "Import-Module ActiveDirectory; " .
        ($action === 'block' 
            ? "Disable-ADAccount -Identity '$sam'" 
            : "Enable-ADAccount -Identity '$sam'") . "\"";

    // Préparer la commande SSH
    $command = $keyPath && file_exists($keyPath)
        ? ['ssh', '-i', $keyPath, '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $psCommand]
        : ['sshpass', '-p', $password, 'ssh', '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $psCommand];

    try {
        $process = new Process($command);
        $process->setTimeout(30);
        $process->run();

        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        return response()->json([
            'success' => true,
            'message' => $action === 'block' ? 'Utilisateur bloqué' : 'Utilisateur débloqué'
        ]);
    } catch (\Throwable $e) {
        \Log::error('toggleUserStatus error: ' . $e->getMessage());
        return response()->json(['success' => false, 'message' => 'Erreur SSH : ' . $e->getMessage()], 500);
    }
}

}