<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Inertia\Inertia;
use App\Traits\LogsAdActivity;

class AdUserController extends Controller
{
    use LogsAdActivity;

    public function index()
    {
        return Inertia::render('Ad/IpConfigPage');
    }

    public function ipConfig(Request $request)
    {
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

        if ($keyPath && file_exists($keyPath)) {
            $command = [
                'ssh',
                '-i', $keyPath,
                '-o', 'StrictHostKeyChecking=no',
                "{$user}@{$host}",
                'ipconfig'
            ];
        } elseif ($password) {
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

        $page = max(1, (int) $request->input('page', 1));
        $perPage = max(10, min(100, (int) $request->input('per_page', 50)));
        $search = trim($request->input('search', ''));

        if ($search !== '') {
            $psCommand = "powershell -NoProfile -NonInteractive -Command \"" .
                "Import-Module ActiveDirectory; " .
                "Get-ADUser -Identity '$search' " .  
                "-Properties Name,SamAccountName,EmailAddress,LastLogonDate,PasswordLastSet,Enabled | " .
                "Select-Object Name,SamAccountName,EmailAddress,LastLogonDate,PasswordLastSet,Enabled | ConvertTo-Json -Depth 4\"";
        } else {
            $psCommand = "powershell -NoProfile -NonInteractive -Command \"" .
                "Import-Module ActiveDirectory; " .
                "Get-ADUser -Filter * -Properties Name,SamAccountName,EmailAddress,LastLogonDate,PasswordLastSet,Enabled | " .
                "Select-Object Name,SamAccountName,EmailAddress,LastLogonDate,PasswordLastSet,Enabled | ConvertTo-Json -Depth 4\"";
        }

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

            $users = isset($decoded['Name']) ? [$decoded] : $decoded;
            $users = array_map(fn($u) => [
                'name' => $u['Name'] ?? '',
                'sam' => $u['SamAccountName'] ?? '',
                'email' => $u['EmailAddress'] ?? '',
                'lastLogon' => $u['LastLogonDate'] ?? '',
                'passwordLastSet' => $u['PasswordLastSet'] ?? '',
                'enabled' => $u['Enabled'] ?? false,
            ], $users ?? []);

            $total = count($users);
            $paged = array_slice($users, ($page - 1) * $perPage, $perPage);

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
        $userName = $request->input('user_name'); // Optionnel depuis le frontend

        $adCommand = $action === 'block'
            ? "powershell -Command \"Disable-ADAccount -Identity '$sam'\""
            : "powershell -Command \"Enable-ADAccount -Identity '$sam'\"";

        $command = $keyPath && file_exists($keyPath)
            ? ['ssh', '-i', $keyPath, '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $adCommand]
            : ['sshpass', '-p', $password, 'ssh', '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $adCommand];

        try {
            $process = new Process($command);
            $process->setTimeout(30);
            $process->run();

            if (!$process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }

            // ✅ Log de l'action réussie
            $this->logAdActivity(
                action: $action === 'block' ? 'block_user' : 'unblock_user',
                targetUser: $sam,
                targetUserName: $userName,
                success: true,
                additionalDetails: [
                    'method' => 'AD Command',
                    'action_type' => $action
                ]
            );

            return response()->json([
                'success' => true,
                'message' => $action === 'block' ? 'Utilisateur bloqué' : 'Utilisateur débloqué',
            ]);

        } catch (\Throwable $e) {
            \Log::error('toggleUserStatus error: ' . $e->getMessage());

            // ❌ Log de l'échec
            $this->logAdActivity(
                action: $action === 'block' ? 'block_user' : 'unblock_user',
                targetUser: $sam,
                targetUserName: $userName,
                success: false,
                errorMessage: $e->getMessage()
            );

            return response()->json([
                'success' => false,
                'message' => 'Erreur AD : ' . $e->getMessage(),
            ], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'sam' => 'required|string',
            'new_password' => 'required|string|min:8',
        ]);

        $host = env('SSH_HOST');
        $user = env('SSH_USER');
        $password = env('SSH_PASSWORD');
        $keyPath = env('SSH_KEY_PATH');

        if (!$host || !$user) {
            return response()->json(['success' => false, 'message' => 'Configuration SSH manquante'], 500);
        }

        $sam = $request->input('sam');
        $newPassword = $request->input('new_password');
        $userName = $request->input('user_name');

        $psCommand = "powershell -NoProfile -NonInteractive -Command \""
            . "Import-Module ActiveDirectory; "
            . "Set-ADAccountPassword -Identity '$sam' -Reset -NewPassword (ConvertTo-SecureString '$newPassword' -AsPlainText -Force); "
            . "Unlock-ADAccount -Identity '$sam'; "
            . "Write-Output 'Password reset successfully'\"";

        $command = $keyPath && file_exists($keyPath)
            ? ['ssh', '-i', $keyPath, '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $psCommand]
            : ['sshpass', '-p', $password, 'ssh', '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $psCommand];

        try {
            $process = new Process($command);
            $process->setTimeout(60);
            $process->run();

            if (!$process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }

            // ✅ Log de réinitialisation réussie
            $this->logAdActivity(
                action: 'reset_password',
                targetUser: $sam,
                targetUserName: $userName,
                success: true,
                additionalDetails: [
                    'unlocked' => true,
                    'method' => 'PowerShell AD'
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Mot de passe réinitialisé avec succès',
            ]);
        } catch (\Throwable $e) {
            \Log::error('resetPassword error: ' . $e->getMessage());

            // ❌ Log de l'échec
            $this->logAdActivity(
                action: 'reset_password',
                targetUser: $sam,
                targetUserName: $userName,
                success: false,
                errorMessage: $e->getMessage()
            );

        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la réinitialisation du mot de passe : ' . $e->getMessage(),
        ], 500);
    }
}
public function manageLock()
{
    return inertia('Ad/ManageUserStatus'); // ton composant React (ex: resources/js/Pages/Ad/ManageLock.jsx)
}
public function findUser(Request $request)
{
    $host = env('SSH_HOST');
    $user = env('SSH_USER');
    $password = env('SSH_PASSWORD');
    $keyPath = env('SSH_KEY_PATH');

    if (!$host || !$user) {
        return response()->json(['success' => false, 'message' => 'Configuration SSH manquante'], 500);
    }

    $search = trim($request->input('search', ''));

    if ($search === '') {
        return response()->json(['success' => false, 'message' => 'Veuillez saisir un identifiant'], 400);
    }

    $psCommand = "powershell -NoProfile -NonInteractive -Command \"" .
        "Import-Module ActiveDirectory; " .
        "Get-ADUser -Filter 'SamAccountName -like \"*$search*\"' " .
        "-Properties Name,SamAccountName,EmailAddress,Enabled | " .
        "Select-Object Name,SamAccountName,EmailAddress,Enabled | ConvertTo-Json -Depth 4\"";

    $command = $keyPath && file_exists($keyPath)
        ? ['ssh', '-i', $keyPath, '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $psCommand]
        : ['sshpass', '-p', $password, 'ssh', '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $psCommand];

    try {
        $process = new Process($command);
        $process->setTimeout(60);
        $process->run();

        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        $output = trim($process->getOutput());
        $decoded = json_decode($output, true);

        if (!$decoded) {
            return response()->json(['success' => false, 'message' => 'Aucun utilisateur trouvé']);
        }

        $users = isset($decoded['Name']) ? [$decoded] : $decoded;

        return response()->json([
            'success' => true,
            'users' => array_map(fn($u) => [
                'name' => $u['Name'] ?? '',
                'sam' => $u['SamAccountName'] ?? '',
                'email' => $u['EmailAddress'] ?? '',
                'enabled' => $u['Enabled'] ?? false,
            ], $users),
        ]);

    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur SSH : ' . $e->getMessage(),
        ], 500);
    }
}


}