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

        // Pagination
        $page = max(1, (int) $request->input('page', 1));
        $perPage = max(10, min(100, (int) $request->input('per_page', 20)));

        // ✅ Commande PowerShell enrichie avec formatage des dates
        $psCommand = "powershell -NoProfile -NonInteractive -Command \""
            . "Import-Module ActiveDirectory; "
            . "\$users = Get-ADUser -Filter * -Properties Name,SamAccountName,EmailAddress,LastLogonDate,PasswordLastSet,Enabled; "
            . "\$users | Select-Object Name,SamAccountName,EmailAddress,"
            . "@{Name='LastLogonDate';Expression={if(\$_.LastLogonDate){\$_.LastLogonDate.ToString('yyyy-MM-dd HH:mm')}}},"
            . "@{Name='PasswordLastSet';Expression={if(\$_.PasswordLastSet){\$_.PasswordLastSet.ToString('yyyy-MM-dd HH:mm')}}},"
            . "Enabled | ConvertTo-Json -Depth 4\"";

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

            // Normalisation
            $users = isset($decoded['Name']) ? [$decoded] : $decoded;
            $users = array_map(fn($u) => [
                'name' => $u['Name'] ?? '',
                'sam' => $u['SamAccountName'] ?? '',
                'email' => $u['EmailAddress'] ?? '',
                'lastLogon' => $u['LastLogonDate'] ?? '',
                'passwordLastSet' => $u['PasswordLastSet'] ?? '',
                'enabled' => $u['Enabled'] ?? false,
            ], $users ?? []);

            // Pagination manuelle
            $total = count($users);
            $paged = array_slice($users, ($page - 1) * $perPage, $perPage);

            return Inertia::render('Ad/UsersList', [
                'users' => $paged,
                'meta' => [
                    'total' => $total,
                    'page' => $page,
                    'per_page' => $perPage,
                ],
            ]);
        } catch (\Throwable $e) {
            \Log::error('adUsers error: ' . $e->getMessage());
            return Inertia::render('Ad/UsersList', [
                'users' => [],
                'meta' => [],
                'error' => 'Erreur : ' . $e->getMessage(),
            ]);
        }
    }

}