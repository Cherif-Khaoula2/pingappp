<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Inertia\Inertia;
use App\Traits\LogsAdActivity;
use Symfony\Component\Mailer\Mailer as SymfonyMailer;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mime\Email;
use Illuminate\Support\Facades\Log;
use App\Models\User;
class AdUserController extends Controller
{
    use LogsAdActivity;

    public function index()
    {
        $permissions = Auth::user()->getAllPermissions()->pluck('name')->toArray();
        return Inertia::render('Ad/IpConfigPage', [
    'userPermissions' => $permissions,
]);}

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
        $this->authorize('getalladuser'); 
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
        $this->authorize('blockaduser'); 
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

        // 📧 Envoyer la notification email
        $userData = [
            'sam' => $sam,
            'name' => $userName ?? $sam,
            'email' => $userEmail ?? null,
            'ouPath' => $ouPath ?? null,
        ];
        
        $this->sendBlockNotification(auth()->user(), $userData, $action);
            
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
        $this->authorize('resetpswaduser'); 
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

           // 📧 Envoyer la notification email
        $userData = [
            'sam' => $sam,
            'name' => $userName ?? $sam,
            'email' => $userEmail ?? null,
            'ouPath' => $ouPath ?? null,
        ];
        
        $this->sendPasswordResetNotification(auth()->user(), $userData);
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
    $this->authorize('getaduser');

    $request->validate([
        'search' => 'nullable|string'
    ]);

    $search = trim($request->input('search', ''));

    $host = env('SSH_HOST');
    $user = env('SSH_USER');
    $password = env('SSH_PASSWORD');
    $keyPath = env('SSH_KEY_PATH');

    if (!$host || !$user) {
        return response()->json(['success' => false, 'message' => 'Configuration SSH manquante']);
    }

    // 🔍 Construction du filtre PowerShell
    if (empty($search)) {
        $filter = 'Name -like "*"';
    } else {
        $escapedSearch = str_replace(['"', "'"], ['`"', "''"], $search);
        $filter = "Name -like \"*{$escapedSearch}*\" -or SamAccountName -like \"*{$escapedSearch}*\" -or EmailAddress -like \"*{$escapedSearch}*\"";
    }

    $psScript = "Import-Module ActiveDirectory; " .
                "\$users = Get-ADUser -Filter {" . $filter . "} -ResultSetSize 50 " .
                "-Properties Name,SamAccountName,EmailAddress,Enabled,LastLogonDate,userAccountControl; " .
                "\$users | Select-Object Name,SamAccountName,EmailAddress,Enabled,LastLogonDate,userAccountControl | " .
                "ConvertTo-Json -Depth 3";

    $psScriptBase64 = base64_encode(mb_convert_encoding($psScript, 'UTF-16LE', 'UTF-8'));
    $psCommand = "powershell -NoProfile -NonInteractive -EncodedCommand {$psScriptBase64}";

    \Log::info('PowerShell command prepared', [
        'script' => $psScript,
        'filter' => $filter
    ]);

    $sshOptions = [
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'UserKnownHostsFile=/dev/null',
        '-o', 'LogLevel=ERROR'
    ];

    $command = $keyPath && file_exists($keyPath)
        ? array_merge(['ssh', '-i', $keyPath], $sshOptions, ["{$user}@{$host}", $psCommand])
        : array_merge(['sshpass', '-p', $password, 'ssh'], $sshOptions, ["{$user}@{$host}", $psCommand]);

    try {
        $process = new Process($command);
        $process->setTimeout(60);
        $process->run();

        if (!$process->isSuccessful()) {
            \Log::error('PowerShell SSH Error', [
                'exit_code' => $process->getExitCode(),
                'error' => $process->getErrorOutput(),
                'output' => $process->getOutput(),
                'filter' => $filter
            ]);
            throw new ProcessFailedException($process);
        }

        $output = trim($process->getOutput());
        \Log::info('AD raw output', ['output' => substr($output, 0, 500)]);

        if (empty($output)) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun utilisateur trouvé',
                'users' => []
            ]);
        }

        $adUsers = json_decode($output, true);
        \Log::info('AD decoded', ['data' => $adUsers]);

        if (!$adUsers || json_last_error() !== JSON_ERROR_NONE) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de décodage JSON',
                'users' => []
            ]);
        }

        // ✅ Si un seul objet, on le met dans un tableau
        if (isset($adUsers['Name'])) {
            $adUsers = [$adUsers];
        }

        // ✅ Récupérer tous les samaccountname masqués depuis la BDD
        $hiddenSamAccounts = AdHiddenAccount::pluck('samaccountname')
            ->map(fn($sam) => strtolower($sam))
            ->toArray();

        $existingEmails = User::pluck('email')->map(fn($email) => strtolower($email))->toArray();

        $users = collect($adUsers)->map(function ($user) use ($existingEmails, $hiddenSamAccounts) {
            $email = strtolower($user['EmailAddress'] ?? '');
            $sam = strtolower($user['SamAccountName'] ?? '');
            $lastLogonRaw = $user['LastLogonDate'] ?? null;

            // Conversion du format /Date(1761666126376)/ en date lisible
            $lastLogon = null;
            if ($lastLogonRaw && preg_match('/Date\((\d+)\)/', $lastLogonRaw, $matches)) {
                $timestamp = intval($matches[1]) / 1000;
                $lastLogon = date('Y-m-d H:i:s', $timestamp);
            }

            return [
                'name' => $user['Name'] ?? '',
                'sam' => $user['SamAccountName'] ?? '',
                'email' => $email,
                'enabled' => (bool)($user['Enabled'] ?? false),
                'is_local' => in_array($email, $existingEmails),
                'last_logon' => $lastLogon,
                'source' => 'active_directory'
            ];
        })->filter(fn($user) =>
            !empty($user['name']) &&
            !empty($user['sam']) &&
            !in_array(strtolower($user['sam']), $hiddenSamAccounts)
        )->values()->toArray();

        return response()->json([
            'success' => true,
            'users' => $users,
            'count' => count($users)
        ]);

    } catch (\Throwable $e) {
        \Log::error('findUser error', [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Erreur serveur : ' . $e->getMessage(),
            'users' => []
        ], 500);
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
{ $this->authorize('addaduser'); 
    $request->validate([
        'name' => 'required|string',
        'sam' => 'required|string|max:25',
        'email' => 'nullable|email',
        'logmail' => 'required|string',
        'password' => 'required|string|min:8',
    ]);

    $host = env('SSH_HOST');
    $user = env('SSH_USER');
    $password = env('SSH_PASSWORD');
    $keyPath = env('SSH_KEY_PATH');

    if (!$host || !$user) {
        return response()->json([
            'success' => false,
            'message' => 'Configuration SSH manquante'
        ], 500);
    }

    $name = $request->input('name');
    $sam = $request->input('sam');
    $email = $request->input('email');
    $logmail = $request->input('logmail');
    $userPassword = $request->input('password');
    $ouPath = $request->input('ou_path');
    $accountType = $request->input('accountType'); 
$userPrincipalName = $accountType === "AD+Exchange" ? $email : "$sam@sarpi-dz.sg";
$emailAddress = $accountType === "AD+Exchange" ? $email : null;

// ✅ Vérification si SamAccountName existe déjà
    $checkCommand = "powershell -NoProfile -NonInteractive -Command \"Import-Module ActiveDirectory; Get-ADUser -Filter {SamAccountName -eq '$sam'} | Select-Object SamAccountName\"";

    $sshOptions = ['-o', 'StrictHostKeyChecking=no', '-o', 'UserKnownHostsFile=/dev/null', '-o', 'LogLevel=ERROR'];
    $checkProcess = new Process(
        $keyPath && file_exists($keyPath)
            ? array_merge(['ssh', '-i', $keyPath], $sshOptions, ["{$user}@{$host}", $checkCommand])
            : array_merge(['sshpass', '-p', $password, 'ssh'], $sshOptions, ["{$user}@{$host}", $checkCommand])
    );

    $checkProcess->setTimeout(30);
    $checkProcess->run();

    if ($checkProcess->isSuccessful() && trim($checkProcess->getOutput()) !== '') {
        return response()->json([
            'success' => false,
            'message' => "Un utilisateur avec le SamAccountName '$sam' existe déjà dans Active Directory."
        ], 409);
    }

    // ✅ Commande AD exécutée directement (sans préfixe powershell/import)
   $adCommand = "
    New-ADUser -Name '$name' `
        -SamAccountName '$sam' `
        -UserPrincipalName '$userPrincipalName' `
        -EmailAddress '$emailAddress' `
        -Path '$ouPath' `
        -AccountPassword (ConvertTo-SecureString '$userPassword' -AsPlainText -Force) `
        -Enabled \$true;
    Write-Output 'User created successfully';
";

    // ✅ Préparation de la commande SSH
    $command = $keyPath && file_exists($keyPath)
        ? ['ssh', '-i', $keyPath, '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $adCommand]
        : ['sshpass', '-p', $password, 'ssh', '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $adCommand];

    try {
        $process = new Process($command);
        $process->setTimeout(60);
        $process->run();

        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        $output = trim($process->getOutput());

        // ✅ Log de succès
        $this->logAdActivity(
            action: 'create_user',
            targetUser: $sam,
            targetUserName: $name,
            success: true,
            additionalDetails: [
                'email' => $email,
                'method' => 'Direct AD over SSH'
            ]
        );
 // ✉️ Envoi de notification avant le return
        $this->sendAdUserCreationNotification(
            $request->user(),
            [
                'name' => $name,
                'sam' => $sam,
                'email' => $email,
                'ouPath' => $ouPath,
                'accountType' => $accountType
            ]
        );
        return response()->json([
            'success' => true,
            'message' => 'Utilisateur créé avec succès.',
            'output' => $output
        ]);

    } catch (\Throwable $e) {
        \Log::error('createUserAd error: ' . $e->getMessage());

        // ❌ Log de l’échec
        $this->logAdActivity(
            action: 'create_user',
            targetUser: $sam,
            targetUserName: $name,
            success: false,
            errorMessage: $e->getMessage()
        );

        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la création de l’utilisateur : ' . $e->getMessage(),
        ], 500);
    }
}

protected function sendAdUserCreationNotification($creator, $newUser)
{
    $usersToNotify = User::permission('superviserusers')->get();

    // ✅ Ajouter le créateur seulement s'il n'est pas déjà dans la liste
    if (!$usersToNotify->contains('id', $creator->id)) {
        $usersToNotify->push($creator);
    }

    // 🔍 Filtrer les utilisateurs sans email
    $usersToNotify = $usersToNotify->filter(function($user) {
        if (!$user->email) {
            \Log::warning("Utilisateur {$user->id} n'a pas d'email, mail non envoyé.");
            return false;
        }
        return true;
    });

    // ⚙️ Configurer le transport SMTP
    $transport = Transport::fromDsn('smtp://mail.sarpi-dz.com:25?encryption=null&verify_peer=false');
    $mailer = new SymfonyMailer($transport);

    foreach ($usersToNotify as $user) {
        $firstName = $user->first_name ?? '';
        $lastName = $user->last_name ?? '';
        $lien = '#';

       $email = (new Email())
            ->from('TOSYS <contact@tosys.sarpi-dz.com>')
            ->to($user->email)
            ->subject("[TOSYSAPP] Nouvel utilisateur AD créé : {$newUser['sam']}")
            ->html("
                <div style='font-family: Arial, sans-serif; font-size: 15px; color: #333;'>
                    <p>Bonjour <strong>" . htmlspecialchars($firstName) . " " . htmlspecialchars($lastName) . "</strong>,</p>
                     <div style='background-color: #182848; color: white; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                        <p style='margin: 0; font-size: 16px;'>
                            👤 <strong>Création d'un nouvel utilisateur Active Directory</strong>
                        </p>
                    </div>
                   

                    <p>L'utilisateur <strong>" . htmlspecialchars($creator->name) . "</strong> ({$creator->email}) a créé un nouveau compte AD :</p>

                    <table style='border-collapse: collapse; margin: 15px 0; width: 100%; max-width: 600px;'>
                        <tr style='background-color: #f8f9fa;'>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'><strong>Nom :</strong></td>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'>" . htmlspecialchars($newUser['name'] ?? '-') . "</td>
                        </tr>
                        <tr>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'><strong>SamAccountName :</strong></td>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'>" . htmlspecialchars($newUser['sam']) . "</td>
                        </tr>
                        <tr style='background-color: #f8f9fa;'>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'><strong>Email :</strong></td>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'>" . htmlspecialchars($newUser['email'] ?? '-') . "</td>
                        </tr>
                        <tr>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'><strong>Direction :</strong></td>
                         <td style='padding: 10px; border: 1px solid #dee2e6;'>
                                   " . htmlspecialchars($this->extractOuName($newUser['ouPath'] ?? '-')) . "
                            </td>
                            </tr>

                        <tr style='background-color: #f8f9fa;'>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'><strong>Type de compte :</strong></td>
                            <td style='padding: 10px; border: 1px solid #dee2e6; color: #4B6CB7; font-weight: bold;'>
                                " . htmlspecialchars(strtoupper($newUser['accountType'] ?? '-')) . "
                            </td>
                        </tr>
                        <tr>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'><strong>Date/Heure :</strong></td>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'>" . now()->format('d/m/Y à H:i') . "</td>
                        </tr>
                    </table>

                    <div style='background-color: #eaf1ff; border-left: 4px solid #4B6CB7; padding: 15px; margin: 20px 0;'>
                        <p style='margin: 0; color: #182848;'>
                            ✅ <strong>Information :</strong> Ce compte a été activé automatiquement après sa création.
                        </p>
                    </div>

                    <hr style='margin-top: 30px; border: none; border-top: 1px solid #ccc;'>
                    <p style='font-size: 13px; color: #777;'>Ce message est généré automatiquement par le système <strong>TOSYSAPP</strong>.</p>
                </div>
            ");

        try {
            $mailer->send($email);
            \Log::info("Email envoyé avec succès à : {$user->email}");
        } catch (\Symfony\Component\Mailer\Exception\TransportExceptionInterface $e) {
            \Log::error("Erreur d'envoi de mail (notification AD) à {$user->email} : " . $e->getMessage());
        }
    }
}

protected function sendBlockNotification($creator, $userData, $action)
{
    $usersToNotify = User::permission('superviserusers')->get();

    // ✅ Ajouter le créateur seulement s'il n'est pas déjà dans la liste
    if (!$usersToNotify->contains('id', $creator->id)) {
        $usersToNotify->push($creator);
    }

    // 🔍 Filtrer les utilisateurs sans email
    $usersToNotify = $usersToNotify->filter(function($user) {
        if (!$user->email) {
            \Log::warning("Utilisateur {$user->id} n'a pas d'email, mail non envoyé.");
            return false;
        }
        return true;
    });

    // ⚙️ Configurer le transport SMTP
    $transport = Transport::fromDsn('smtp://mail.sarpi-dz.com:25?encryption=null&verify_peer=false');
    $mailer = new SymfonyMailer($transport);

    // 🎨 Définir les couleurs et textes selon l'action
    $actionText = $action === 'block' ? 'bloqué' : 'débloqué';
    $actionColor = $action === 'block' ? '#e74c3c' : '#27ae60';
    $actionIcon = $action === 'block' ? '🔒' : '🔓';

    foreach ($usersToNotify as $user) {
        $firstName = $user->first_name ?? '';
        $lastName = $user->last_name ?? '';

        $email = (new Email())
            ->from('TOSYS <contact@tosys.sarpi-dz.com>')
            ->to($user->email)
            ->subject("[TOSYSAPP] Compte AD {$actionText} : {$userData['sam']}")
            ->html("
                <div style='font-family: Arial, sans-serif; font-size: 15px; color: #333;'>
                    <p>Bonjour <strong>" . htmlspecialchars($firstName) . " " . htmlspecialchars($lastName) . "</strong>,</p>
                    
                    <div style='background-color: {$actionColor}; color: white; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                        <p style='margin: 0; font-size: 16px;'>
                            {$actionIcon} <strong>Compte utilisateur {$actionText}</strong>
                        </p>
                    </div>

                    <p>L'utilisateur <strong>" . htmlspecialchars($creator->name) . "</strong> ({$creator->email}) a <strong>{$actionText}</strong> le compte AD suivant :</p>

                    <table style='border-collapse: collapse; margin: 15px 0; width: 100%; max-width: 600px;'>
                        <tr style='background-color: #f8f9fa;'>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'><strong>Nom :</strong></td>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'>" . htmlspecialchars($userData['name'] ?? '-') . "</td>
                        </tr>
                        <tr>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'><strong>SamAccountName :</strong></td>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'>" . htmlspecialchars($userData['sam']) . "</td>
                        </tr>
                       
                        <tr style='background-color: #f8f9fa;'>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'><strong>Action :</strong></td>
                            <td style='padding: 10px; border: 1px solid #dee2e6; color: {$actionColor}; font-weight: bold;'>
                                " . strtoupper($actionText) . "
                            </td>
                        </tr>
                        <tr>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'><strong>Date/Heure :</strong></td>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'>" . now()->format('d/m/Y à H:i') . "</td>
                        </tr>
                    </table>

                    <hr style='margin-top: 30px; border: none; border-top: 1px solid #ccc;'>
                    <p style='font-size: 13px; color: #777;'>Ce message est généré automatiquement par le système TOSYSAPP.</p>
                </div>
            ");

        try {
            $mailer->send($email);
            \Log::info("Email de notification ({$actionText}) envoyé avec succès à : {$user->email}");
        } catch (\Symfony\Component\Mailer\Exception\TransportExceptionInterface $e) {
            \Log::error("Erreur d'envoi de mail (notification {$actionText}) à {$user->email} : " . $e->getMessage());
        }
    }
}
protected function sendPasswordResetNotification($creator, $userData)
{
    $usersToNotify = User::permission('superviserusers')->get();

    // ✅ Ajouter le créateur seulement s'il n'est pas déjà dans la liste
    if (!$usersToNotify->contains('id', $creator->id)) {
        $usersToNotify->push($creator);
    }

    // 🔍 Filtrer les utilisateurs sans email
    $usersToNotify = $usersToNotify->filter(function($user) {
        if (!$user->email) {
            \Log::warning("Utilisateur {$user->id} n'a pas d'email, mail non envoyé.");
            return false;
        }
        return true;
    });

    // ⚙️ Configurer le transport SMTP
    $transport = Transport::fromDsn('smtp://mail.sarpi-dz.com:25?encryption=null&verify_peer=false');
    $mailer = new SymfonyMailer($transport);

    foreach ($usersToNotify as $user) {
        $firstName = $user->first_name ?? '';
        $lastName = $user->last_name ?? '';

        $email = (new Email())
            ->from('TOSYS <contact@tosys.sarpi-dz.com>')
            ->to($user->email)
            ->subject("[TOSYSAPP] Mot de passe AD réinitialisé : {$userData['sam']}")
            ->html("
                <div style='font-family: Arial, sans-serif; font-size: 15px; color: #333;'>
                    <p>Bonjour <strong>" . htmlspecialchars($firstName) . " " . htmlspecialchars($lastName) . "</strong>,</p>
                    
                    <div style='background-color: #f39c12; color: white; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                        <p style='margin: 0; font-size: 16px;'>
                            🔑 <strong>Mot de passe réinitialisé</strong>
                        </p>
                    </div>

                    <p>L'utilisateur <strong>" . htmlspecialchars($creator->name) . "</strong> ({$creator->email}) a réinitialisé le mot de passe du compte AD suivant :</p>

                    <table style='border-collapse: collapse; margin: 15px 0; width: 100%; max-width: 600px;'>
                        <tr style='background-color: #f8f9fa;'>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'><strong>Nom :</strong></td>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'>" . htmlspecialchars($userData['name'] ?? '-') . "</td>
                        </tr>
                        <tr>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'><strong>SamAccountName :</strong></td>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'>" . htmlspecialchars($userData['sam']) . "</td>
                        </tr>
                      
                        <tr style='background-color: #f8f9fa;'>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'><strong>Action :</strong></td>
                            <td style='padding: 10px; border: 1px solid #dee2e6; color: #f39c12; font-weight: bold;'>
                                RÉINITIALISATION MOT DE PASSE
                            </td>
                        </tr>
                        <tr>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'><strong>Compte déverrouillé :</strong></td>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'>✅ Oui</td>
                        </tr>
                        <tr style='background-color: #f8f9fa;'>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'><strong>Date/Heure :</strong></td>
                            <td style='padding: 10px; border: 1px solid #dee2e6;'>" . now()->format('d/m/Y à H:i') . "</td>
                        </tr>
                    </table>

                    <div style='background-color: #fff3cd; border-left: 4px solid #f39c12; padding: 15px; margin: 20px 0;'>
                        <p style='margin: 0; color: #856404;'>
                            ⚠️ <strong>Important :</strong> Le compte a été automatiquement déverrouillé lors de cette opération.
                        </p>
                    </div>

                    <hr style='margin-top: 30px; border: none; border-top: 1px solid #ccc;'>
                    <p style='font-size: 13px; color: #777;'>Ce message est généré automatiquement par le système TOSYSAPP.</p>
                </div>
            ");

        try {
            $mailer->send($email);
            \Log::info("Email de notification (reset password) envoyé avec succès à : {$user->email}");
        } catch (\Symfony\Component\Mailer\Exception\TransportExceptionInterface $e) {
            \Log::error("Erreur d'envoi de mail (notification reset password) à {$user->email} : " . $e->getMessage());
        }
    }
}
protected function extractOuName($ouPath)
{
    if (!$ouPath) return '-';
    if (preg_match('/OU=([^,]+)/i', $ouPath, $matches)) {
        return $matches[1];
    }
    return $ouPath;
}

}