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
    $request->validate([
        'search' => 'required|string'
    ]);

    $search = $request->input('search');

    $host = env('SSH_HOST');
    $user = env('SSH_USER');
    $password = env('SSH_PASSWORD');
    $keyPath = env('SSH_KEY_PATH');

    if (!$host || !$user) {
        return response()->json(['success' => false, 'message' => 'Configuration SSH manquante']);
    }

    $psCommand = "powershell -NoProfile -NonInteractive -Command \""
        . "Import-Module ActiveDirectory; "
        . "Get-ADUser -Identity '$search' " 
        . "-Properties Name,SamAccountName,EmailAddress,Enabled,LastLogonDate | "
        . "Select-Object Name,SamAccountName,EmailAddress,Enabled,LastLogonDate | ConvertTo-Json\"";

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
        $users = json_decode($output, true);

        if (!$users) {
            return response()->json(['success' => false, 'message' => 'Aucun utilisateur trouvé']);
        }

        return response()->json(['success' => true, 'users' => is_array($users) ? $users : [$users]]);
    } catch (\Throwable $e) {
        \Log::error('findUser error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Erreur serveur : ' . $e->getMessage(),
        ]);
    }
}
public function managePassword()
{
    return inertia('Ad/ManagePassword');
}
public function manageAddUser()
{
    // Page React pour ajouter un utilisateur AD
    return inertia('Ad/ManageAddUser');
}
public function createAdUser(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:100',
        'sam' => 'required|string|max:50',
        'email' => 'required|email|max:150',
        'password' => [
            'required',
            'string',
            'min:12',
            'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/'
        ],
    ], [
        'password.regex' => 'Le mot de passe doit contenir : 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial (@$!%*?&#)',
        'password.min' => 'Le mot de passe doit contenir au moins 12 caractères',
    ]);

    $host = env('SSH_HOST');
    $user = env('SSH_USER');
    $password = env('SSH_PASSWORD');
    $keyPath = env('SSH_KEY_PATH');

    if (!$host || !$user) {
        return response()->json(['success' => false, 'message' => 'Configuration SSH manquante'], 500);
    }

    $name = $request->input('name');
    $sam = $request->input('sam');
    $email = $request->input('email');
    $plainPassword = $request->input('password');
    $ouPath = "OU=OuTempUsers,DC=sarpi-dz,DC=sg";

    // 🔹 Vérifier si l'utilisateur existe déjà
    $checkScript = "try { " .
        "\$existingUser = Get-ADUser -Identity '$sam' -ErrorAction SilentlyContinue; " .
        "if (\$existingUser) { Write-Output 'EXISTS'; exit 0 } else { Write-Output 'NOT_EXISTS'; exit 0 } " .
        "} catch { Write-Output 'NOT_EXISTS'; exit 0 }";
    
    $checkEncoded = base64_encode(mb_convert_encoding($checkScript, 'UTF-16LE', 'UTF-8'));
    $checkCommand = "powershell -NoProfile -NonInteractive -EncodedCommand $checkEncoded";
    
    $command = $keyPath && file_exists($keyPath)
        ? ['ssh', '-i', $keyPath, '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $checkCommand]
        : ['sshpass', '-p', $password, 'ssh', '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $checkCommand];

    try {
        $process = new Process($command);
        $process->setTimeout(30);
        $process->run();
        
        if (str_contains(trim($process->getOutput()), 'EXISTS')) {
            return response()->json([
                'success' => false,
                'message' => "L'utilisateur $sam existe déjà dans Active Directory.",
            ], 422);
        }

        // 🔹 Créer l'utilisateur DÉSACTIVÉ d'abord
        $psScript = "try { " .
            "Import-Module ActiveDirectory; " .
            "\$securePassword = ConvertTo-SecureString '$plainPassword' -AsPlainText -Force; " .
            "New-ADUser -Name '$name' " .
            "-SamAccountName '$sam' " .
            "-UserPrincipalName '$email' " .
            "-EmailAddress '$email' " .
            "-Path '$ouPath' " .
            "-AccountPassword \$securePassword " .
            "-Enabled \$false " .
            "-PasswordNeverExpires \$false " .
            "-ChangePasswordAtLogon \$false; " .
            // 🔹 Puis activer immédiatement après
            "Enable-ADAccount -Identity '$sam'; " .
            "\$verifyUser = Get-ADUser -Identity '$sam' -Properties Enabled; " .
            "if (\$verifyUser.Enabled -eq \$true) { " .
            "Write-Output 'SUCCESS: User $sam created and enabled' " .
            "} else { " .
            "Write-Output 'WARNING: User created but not enabled' " .
            "} " .
            "} catch { " .
            "Write-Output ('ERROR: ' + \$_.Exception.Message); " .
            "exit 1 " .
            "}";

        $encodedCommand = base64_encode(mb_convert_encoding($psScript, 'UTF-16LE', 'UTF-8'));
        $sshCommand = "powershell -NoProfile -NonInteractive -EncodedCommand $encodedCommand";

        $command = $keyPath && file_exists($keyPath)
            ? ['ssh', '-i', $keyPath, '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $sshCommand]
            : ['sshpass', '-p', $password, 'ssh', '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $sshCommand];

        $process = new Process($command);
        $process->setTimeout(90);
        $process->run();

        $output = trim($process->getOutput());
        $errorOutput = trim($process->getErrorOutput());

        \Log::info('PowerShell Output: ' . $output);
        \Log::info('PowerShell Error: ' . $errorOutput);

        // 🔹 Vérification stricte
        if (str_contains($output, 'ERROR:')) {
            $errorMsg = trim(str_replace('ERROR:', '', $output));
            
            // Message d'erreur spécifique pour politique de mot de passe
            if (str_contains($errorMsg, 'password does not meet') || str_contains($errorMsg, '1325')) {
                throw new \Exception('Le mot de passe ne respecte pas la politique du domaine. Veuillez utiliser un mot de passe plus complexe (12+ caractères, majuscules, minuscules, chiffres et caractères spéciaux).');
            }
            
            throw new \Exception($errorMsg);
        }

        if (!str_contains($output, 'SUCCESS')) {
            throw new \Exception('La création de l\'utilisateur a échoué sans message d\'erreur explicite.');
        }

        $this->logAdActivity(
            action: 'create_user',
            targetUser: $sam,
            targetUserName: $name,
            success: true,
            additionalDetails: ['email' => $email, 'ou' => $ouPath]
        );

        return response()->json([
            'success' => true,
            'message' => "Utilisateur $sam créé et activé avec succès dans Active Directory.",
        ]);

    } catch (\Throwable $e) {
        \Log::error('createAdUser error: ' . $e->getMessage());

        $this->logAdActivity(
            action: 'create_user',
            targetUser: $sam,
            targetUserName: $name,
            success: false,
            errorMessage: $e->getMessage()
        );

        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la création : ' . $e->getMessage(),
        ], 500);
    }
}
}