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
use App\Models\AdHiddenAccount;
use App\Models\Dn;
use App\Traits\ValidatesAdUsers;
class AdUserController extends Controller
{
    use LogsAdActivity, ValidatesAdUsers;

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
            'sam' => 'required|string|max:25|regex:/^[a-zA-Z0-9._-]+$/',
            'action' => 'required|in:block,unblock',
        ]);

        $sam = $request->input('sam');
        $action = $request->input('action');

        // 🔒 VALIDATION CRITIQUE : Vérifier l'accès
        $validation = $this->validateAdUserAccess($sam);
        
        if (!$validation['authorized']) {
            Log::warning('Tentative de modification non autorisée', [
                'sam' => $sam,
                'action' => $action,
                'user_id' => auth()->id(),
                'ip' => request()->ip(),
                'error' => $validation['error']
            ]);

            return response()->json([
                'success' => false,
                'message' => $validation['error']
            ], 403);
        }

        $adUser = $validation['user'];

        $host = env('SSH_HOST');
        $user = env('SSH_USER');
        $password = env('SSH_PASSWORD');
        $keyPath = env('SSH_KEY_PATH');

        if (!$host || !$user) {
            return response()->json(['success' => false, 'message' => 'Configuration SSH manquante'], 500);
        }

        // ✅ Échapper le SamAccountName
        $escapedSam = $this->escapePowerShellString($sam);

        $adCommand = $action === 'block'
            ? "powershell -Command \"Disable-ADAccount -Identity '$escapedSam'\""
            : "powershell -Command \"Enable-ADAccount -Identity '$escapedSam'\"";

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

            $this->logAdActivity(
                action: $action === 'block' ? 'block_user' : 'unblock_user',
                targetUser: $sam,
                targetUserName: $adUser['name'],
                success: true,
                additionalDetails: [
                    'email' => $adUser['email'],
                    'dn' => $adUser['dn'],
                    'method' => 'AD Command',
                    'action_type' => $action,
                    'previous_status' => $action === 'block' ? 'enabled' : 'disabled'
                ]
            );

            $this->sendBlockNotification(auth()->user(), [
                'sam' => $sam,
                'name' => $adUser['name'],
                'email' => $adUser['email'],
            ], $action);

          
            
        } catch (\Throwable $e) {
            Log::error('toggleUserStatus error: ' . $e->getMessage());

            $this->logAdActivity(
                action: $action === 'block' ? 'block_user' : 'unblock_user',
                targetUser: $sam,
                targetUserName: $adUser['name'],
                success: false,
                errorMessage: $e->getMessage()
            );

            return response()->json([
                'success' => false,
                'message' => 'Erreur AD : ' . $e->getMessage(),
            ], 500);
        }
    }

    // ✅ FONCTION SÉCURISÉE : resetPassword
    public function resetPassword(Request $request)
    {
        $this->authorize('resetpswaduser'); 
        
        $request->validate([
            'sam' => 'required|string|max:25|regex:/^[a-zA-Z0-9._-]+$/',
            'new_password' => [
                'required',
                'string',
                'min:8',
                'max:128',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/'
            ],
        ]);

        $sam = $request->input('sam');

        // 🔒 VALIDATION CRITIQUE : Vérifier l'accès
        $validation = $this->validateAdUserAccess($sam);
        
        if (!$validation['authorized']) {
            Log::warning('Tentative de reset password non autorisée', [
                'sam' => $sam,
                'user_id' => auth()->id(),
                'ip' => request()->ip(),
                'error' => $validation['error']
            ]);

            return response()->json([
                'success' => false,
                'message' => $validation['error']
            ], 403);
        }

        $adUser = $validation['user'];
        $newPassword = $request->input('new_password');

        $host = env('SSH_HOST');
        $user = env('SSH_USER');
        $password = env('SSH_PASSWORD');
        $keyPath = env('SSH_KEY_PATH');

        if (!$host || !$user) {
            return response()->json(['success' => false, 'message' => 'Configuration SSH manquante'], 500);
        }

        // ✅ Échapper le mot de passe et le sam
        $escapedSam = $this->escapePowerShellString($sam);
        $escapedPassword = str_replace("'", "''", $newPassword);

        $psCommand = "powershell -NoProfile -NonInteractive -Command \""
            . "Import-Module ActiveDirectory; "
            . "Set-ADAccountPassword -Identity '$escapedSam' -Reset -NewPassword (ConvertTo-SecureString '$escapedPassword' -AsPlainText -Force); "
            . "Enable-ADAccount -Identity '$escapedSam'; "
            . "Unlock-ADAccount -Identity '$escapedSam'; "
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

            $this->logAdActivity(
                action: 'reset_password',
                targetUser: $sam,
                targetUserName: $adUser['name'],
                success: true,
                additionalDetails: [
                    'email' => $adUser['email'],
                    'dn' => $adUser['dn'],
                    'unlocked' => true,
                    'method' => 'PowerShell AD',
                    'password_strength' => 'strong'
                ]
            );

            $this->sendPasswordResetNotification(auth()->user(), [
                'sam' => $sam,
                'name' => $adUser['name'],
            ]);

        

        } catch (\Throwable $e) {
            Log::error('resetPassword error: ' . $e->getMessage());

            $this->logAdActivity(
                action: 'reset_password',
                targetUser: $sam,
                targetUserName: $adUser['name'],
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
    
    $this->logAdActivity(
        action: 'search_user',
        targetUser: $search,
        targetUserName: null,
        success: true,
        additionalDetails: [
            'search_query' => $search,
            'search_type' => 'active_directory',
            'timestamp' => now()->toDateTimeString()
        ]
    );

    $host = env('SSH_HOST');
    $user = env('SSH_USER');
    $password = env('SSH_PASSWORD');
    $keyPath = env('SSH_KEY_PATH');

    if (!$host || !$user) {
        $this->logAdActivity(
            action: 'search_user',
            targetUser: $search,
            targetUserName: null,
            success: false,
            errorMessage: 'Configuration SSH manquante'
        );
        
        return response()->json(['success' => false, 'message' => 'Configuration SSH manquante']);
    }
    

 if (empty($search) || $search === '.') {
    $userAuthDns = auth()->user()->dns()->pluck('path')->toArray();
    $psScripts = [];

  
        $psScripts[] = "Get-ADUser -Filter *   -Properties Name,SamAccountName,EmailAddress,Enabled,DistinguishedName";
 

    $psScript = implode(";", $psScripts) .
        " | Select-Object Name,SamAccountName,EmailAddress,Enabled,DistinguishedName | ConvertTo-Json -Depth 3 -Compress";

    // Variable de log à utiliser à la place de $filter
    $logFilter = implode(" OR ", $userAuthDns);

} else {

    $escapedSearch = $this->escapePowerShellStringForFilter($search);
    $filter = "(Name -like '*{$escapedSearch}*') -or (SamAccountName -like '*{$escapedSearch}*') -or (EmailAddress -like '*{$escapedSearch}*')";
    $psScript =
        "\$users = Get-ADUser -Filter {" . $filter . "} -ResultSetSize 100 " .
        "-Properties Name,SamAccountName,EmailAddress,Enabled,DistinguishedName; " .
        "\$users | Select-Object Name,SamAccountName,EmailAddress,Enabled,DistinguishedName | " .
        "ConvertTo-Json -Depth 3 -Compress";

    $logFilter = $filter;
}

    

    $psScriptBase64 = base64_encode(mb_convert_encoding($psScript, 'UTF-16LE', 'UTF-8'));
    $psCommand = "powershell -NoProfile -NonInteractive -EncodedCommand {$psScriptBase64}";

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
            Log::error('PowerShell SSH Error', [
                'exit_code' => $process->getExitCode(),
                'error' => $process->getErrorOutput(),
                'output' => $process->getOutput(),
                'filter' => $logFilter,
                'search' => $search
            ]);
            
            $this->logAdActivity(
                action: 'search_user',
                targetUser: $search,
                targetUserName: null,
                success: false,
                errorMessage: 'Erreur SSH lors de la recherche : ' . $process->getErrorOutput()
            );
            
            throw new ProcessFailedException($process);
        }

        $output = trim($process->getOutput());
        
        if (empty($output) || $output === 'null') {
            Log::info("Aucun utilisateur trouvé dans AD pour la recherche : $search");
            
            return response()->json([
                'success' => false, 
                'message' => 'Aucun utilisateur trouvé', 
                'users' => [],
                'count' => 0
            ]);
        }
// Nettoyer l'output
$cleanOutput = str_replace([
    '\\u0027',  // Apostrophe échappée
    "\r",       // Carriage return
], [
    "'",
    ""
], $output);

// Essayer de décoder avec options pour gérer UTF-8
$adUsers = json_decode($cleanOutput, true, 512, JSON_INVALID_UTF8_SUBSTITUTE);

if (!$adUsers || json_last_error() !== JSON_ERROR_NONE || empty($adUsers)) {
    Log::warning("Données AD invalides ou vides pour : $search", [
        'output' => substr($output, 0, 500), // Limiter pour le log
        'json_error' => json_last_error_msg(),
        'json_error_code' => json_last_error()
    ]);
    
    return response()->json([
        'success' => false, 
        'message' => 'Erreur lors de la récupération des données', 
        'users' => [],
        'count' => 0
    ]);
}
       
        if (isset($adUsers['Name'])) {
            $adUsers = [$adUsers];
        }

       

        $userAuthDns = auth()->user()->dns()->pluck('path')->toArray();
        $hiddenSamAccounts = AdHiddenAccount::pluck('samaccountname')->map(fn($sam) => strtolower($sam))->toArray();
        $existingEmails = User::pluck('email')->map(fn($email) => strtolower($email))->toArray();

        $users = collect($adUsers)->map(function ($adUser) use ($existingEmails, $hiddenSamAccounts, $userAuthDns) {
            $email = strtolower($adUser['EmailAddress'] ?? '');
            $sam = strtolower($adUser['SamAccountName'] ?? '');
            $dn = $adUser['DistinguishedName'] ?? '';
            $enabled = (bool)($adUser['Enabled'] ?? false);
            $isLocal = in_array($email, $existingEmails);

          $isAuthorizedDn = $this->isDnAuthorized($dn, $userAuthDns);

            return [
                'name' => $adUser['Name'] ?? '',
                'sam' => $adUser['SamAccountName'] ?? '',
                'email' => $email,
                'enabled' => $enabled,
                'is_local' => $isLocal,
                'dn' => $dn,
                'is_authorized_dn' => $isAuthorizedDn,
                'source' => 'active_directory'
            ];
        })
        ->filter(fn($u) =>
            !empty($u['name']) &&
            !empty($u['sam']) &&
            !in_array(strtolower($u['sam']), $hiddenSamAccounts)
        )
        ->values();

        $authorizedUsers = $users->where('is_authorized_dn', true)->values();
        $unauthorizedUsers = $users->where('is_authorized_dn', false)->values();

      

        

        return response()->json([
            'users' => $authorizedUsers,
        ]);

    } catch (\Throwable $e) {
        Log::error('findUser error', [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'search' => $search
        ]);

        $this->logAdActivity(
            action: 'search_user',
            targetUser: $search,
            targetUserName: null,
            success: false,
            errorMessage: 'Erreur serveur : ' . $e->getMessage(),
            additionalDetails: [
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine()
            ]
        );

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
    $directions = Dn::select('id', 'nom', 'path')
        ->orderBy('nom', 'asc')
        ->get();
    
    return inertia('Ad/ManageAddUser', [
        'directions' => $directions
    ]);
}
public function createAdUser(Request $request)
    { 
        $this->authorize('addaduser'); 
        
        $request->validate([
            'name' => 'required|string|max:100',
            'sam' => [
                'required',
                'max:25',
                'regex:/^[A-Za-z0-9._-]+$/',
            ],
            'email' => 'nullable|email',
            'logmail' => 'required|string',
            'password' => [
                'required',
                'string',
                'min:8',
                'max:128',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/'
            ],
            'direction_id' => 'required|exists:dns,id',
        ]);

        $directionId = $request->input('direction_id');

        // 🔒 VALIDATION CRITIQUE : Vérifier l'accès à la direction
        $validation = $this->validateDirectionAccess($directionId);
        
        if (!$validation['authorized']) {
            Log::warning('Tentative de création dans une direction non autorisée', [
                'direction_id' => $directionId,
                'user_id' => auth()->id(),
                'ip' => request()->ip()
            ]);

            return response()->json([
                'success' => false,
                'message' => $validation['error']
            ], 403);
        }

        $direction = $validation['direction'];

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
        $userPassword = $request->input('password');
        $accountType = $request->input('accountType');
        $ouPath = $direction->path;

        // ✅ Échapper toutes les entrées
        $escapedName = $this->escapePowerShellString($name);
        $escapedSam = $this->escapePowerShellString($sam);
        $escapedEmail = $this->escapePowerShellString($email ?? '');
        $escapedPassword = str_replace("'", "''", $userPassword);
        $escapedOuPath = $this->escapePowerShellString($ouPath);

        $userPrincipalName = $accountType === "AD+Exchange" ? $escapedEmail : "$escapedSam@sarpi-dz.sg";
        $emailAddress = $accountType === "AD+Exchange" ? $escapedEmail : 'null';

        // ✅ Vérification existence
        $checkCommand = "powershell -NoProfile -NonInteractive -Command \"Import-Module ActiveDirectory; Get-ADUser -Filter {SamAccountName -eq '$escapedSam'} | Select-Object SamAccountName\"";

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
                'message' => "Un utilisateur avec le SamAccountName '$sam' existe déjà."
            ], 409);
        }
$adCommand = "New-ADUser -Name '$escapedName' `
    -SamAccountName '$escapedSam' `
    -UserPrincipalName '$userPrincipalName' ";

// Ajouter Email seulement si c’est AD+Exchange
if ($accountType === "AD+Exchange") {
    $adCommand .= " -EmailAddress '$escapedEmail' ";
}

$adCommand .= " -Path '$escapedOuPath' `
    -AccountPassword (ConvertTo-SecureString '$escapedPassword' -AsPlainText -Force) `
    -Enabled \$true;
Write-Output 'User created successfully';";


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

            $this->logAdActivity(
                action: 'create_user',
                targetUser: $sam,
                targetUserName: $name,
                success: true,
                additionalDetails: [
                    'email' => $email,
                    'direction' => $direction->nom,
                    'method' => 'Direct AD over SSH'
                ]
            );
            
            $this->sendAdUserCreationNotification(
                $request->user(),
                [
                    'name' => $name,
                    'sam' => $sam,
                    'email' => $email,
                    'ouPath' => $ouPath,
                    'directionName' => $direction->nom,
                    'accountType' => $accountType
                ]
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Utilisateur créé avec succès.'
            ]);

        } catch (\Throwable $e) {
            Log::error('createUserAd error: ' . $e->getMessage());

            $this->logAdActivity(
                action: 'create_user',
                targetUser: $sam,
                targetUserName: $name,
                success: false,
                errorMessage: $e->getMessage()
            );

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'utilisateur : ' . $e->getMessage(),
            ], 500);
        }
    }
public function getDirections()
{
    try {
        $directions = Dn::select('id', 'nom', 'path')
            ->orderBy('nom', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'directions' => $directions
        ]);
    } catch (\Throwable $e) {
        \Log::error('Erreur lors de la récupération des directions: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors du chargement des directions',
            'directions' => []
        ], 500);
    }
}
protected function sendAdUserCreationNotification($creator, $newUser)
{
    $usersToNotify = User::permission('superviserusers')->get();

    if (!$usersToNotify->contains('id', $creator->id)) {
        $usersToNotify->push($creator);
    }

    $usersToNotify = $usersToNotify->filter(function($user) {
        if (!$user->email) {
            \Log::warning("Utilisateur {$user->id} n'a pas d'email, mail non envoyé.");
            return false;
        }
        return true;
    });

    $transport = Transport::fromDsn('smtp://mail.sarpi-dz.com:25?encryption=null&verify_peer=false');
    $mailer = new SymfonyMailer($transport);

    foreach ($usersToNotify as $user) {
        $firstName = $user->first_name ?? '';
        $lastName = $user->last_name ?? '';

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
                            <td style='padding: 10px; border: 1px solid #dee2e6;'>" . htmlspecialchars($newUser['directionName'] ?? '-') . "</td>
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
        " . mb_strtoupper($actionText, 'UTF-8') . "
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
  public function listMailboxes()
    {
        // Exemple statique, tu peux remplacer par une requête DB si nécessaire
        $mailboxes = [
            ['id' => 1, 'name' => 'mailbox.A'],
            ['id' => 2, 'name' => 'mailbox.B'],
            ['id' => 3, 'name' => 'mailbox.C'],
        ];

        return response()->json([
            'success' => true,
            'mailboxes' => $mailboxes
        ]);
    }

public function getAllAdOUs()
    {
        $this->authorize('getaduser');

        $host = env('SSH_HOST');
        $user = env('SSH_USER');
        $password = env('SSH_PASSWORD');
        $keyPath = env('SSH_KEY_PATH');

        if (!$host || !$user) {
            return response()->json(['success' => false, 'message' => 'Configuration SSH manquante'], 500);
        }

        $baseDn = "OU=NewUsersOU,DC=sarpi-dz,DC=sg";
        $psCommand = "Get-ADOrganizationalUnit -Filter * -SearchBase '$baseDn' | Select-Object Name,DistinguishedName | ConvertTo-Json";
        $adCommand = "powershell -Command \"$psCommand\"";

        $command = $keyPath && file_exists($keyPath)
            ? ['ssh', '-i', $keyPath, '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $adCommand]
            : ['sshpass', '-p', $password, 'ssh', '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $adCommand];

        try {
            $process = new Process($command);
            $process->setTimeout(40);
            $process->run();

            if (!$process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }

            $output = trim($process->getOutput());
            $data = json_decode($output, true);

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Throwable $e) {
            Log::error('getAllAdOUs error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur PowerShell : ' . $e->getMessage()
            ], 500);
        }
    }

    public function getUsersByOU(Request $request)
    {
        $this->authorize('getaduser');

        $request->validate([
            'ou_dn' => 'required|string'
        ]);

        $ouDn = $this->escapePowerShellString($request->input('ou_dn'));

        if (!str_contains($ouDn, "OU=NewUsersOU,DC=sarpi-dz,DC=sg")) {
            return response()->json(['success' => false, 'message' => 'OU non autorisée'], 403);
        }

        $host = env('SSH_HOST');
        $user = env('SSH_USER');
        $password = env('SSH_PASSWORD');
        $keyPath = env('SSH_KEY_PATH');

        if (!$host || !$user) {
            return response()->json(['success' => false, 'message' => 'Configuration SSH manquante'], 500);
        }

        $psCommand = "Get-ADUser -Filter * -SearchBase '$ouDn' -Properties Name,SamAccountName,EmailAddress | Select-Object Name,SamAccountName,EmailAddress | ConvertTo-Json";
        $adCommand = "powershell -Command \"$psCommand\"";

        $command = $keyPath && file_exists($keyPath)
            ? ['ssh', '-i', $keyPath, '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $adCommand]
            : ['sshpass', '-p', $password, 'ssh', '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $adCommand];

        try {
            $process = new Process($command);
            $process->setTimeout(40);
            $process->run();

            if (!$process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }

            $output = trim($process->getOutput());
            $data = json_decode($output, true);

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Throwable $e) {
            Log::error('getUsersByOU error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur PowerShell : ' . $e->getMessage()
            ], 500);
        }
    }
    private function fetchAdOUs()
{
    $host = env('SSH_HOST');
    $user = env('SSH_USER');
    $password = env('SSH_PASSWORD');
    $keyPath = env('SSH_KEY_PATH');

    if (!$host || !$user) {
        throw new \Exception('Configuration SSH manquante');
    }

    $baseDn = "OU=NewUsersOU,DC=sarpi-dz,DC=sg";
    $psCommand = "Get-ADOrganizationalUnit -Filter * -SearchBase '$baseDn' | Select-Object Name,DistinguishedName | ConvertTo-Json";
    $adCommand = "powershell -Command \"$psCommand\"";

    $command = $keyPath && file_exists($keyPath)
        ? ['ssh', '-i', $keyPath, '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $adCommand]
        : ['sshpass', '-p', $password, 'ssh', '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $adCommand];

    $process = new Process($command);
    $process->setTimeout(40);
    $process->run();

    if (!$process->isSuccessful()) {
        throw new ProcessFailedException($process);
    }

    $output = trim($process->getOutput());
    return json_decode($output, true);
}

public function showOuPage()
{
    $this->authorize('getaduser');

    try {
        $ous = $this->fetchAdOUs();

        return Inertia::render('Ad/AdOuList', [
            'ous' => $ous
        ]);
    } catch (\Throwable $e) {
        Log::error('Erreur lors de la récupération des OUs : ' . $e->getMessage());

        return Inertia::render('Ad/AdOuList', [
            'ous' => [],
            'error' => 'Impossible de récupérer les unités organisationnelles.'
        ]);
    }
}

public function showUsersByOU($ou_dn)
{
    $this->authorize('getaduser');

    $ouDn = $this->escapePowerShellString(urldecode($ou_dn));

    if (!str_contains($ouDn, "OU=NewUsersOU,DC=sarpi-dz,DC=sg")) {
        abort(403, 'OU non autorisée');
    }

    try {
        $users = $this->fetchUsersFromOU($ouDn); // méthode privée à créer
        return Inertia::render('Ad/AdUsersList', [
            'ou_dn' => $ouDn,
            'users' => $users
        ]);
    } catch (\Throwable $e) {
        Log::error('Erreur récupération utilisateurs : ' . $e->getMessage());
        return Inertia::render('Ad/AdUsersList', [
            'ou_dn' => $ouDn,
            'users' => [],
            'error' => 'Impossible de récupérer les utilisateurs.'
        ]);
    }
}
private function fetchUsersFromOU($ouDn)
{
    $host = env('SSH_HOST');
    $user = env('SSH_USER');
    $password = env('SSH_PASSWORD');
    $keyPath = env('SSH_KEY_PATH');

    $psCommand = "Get-ADUser -Filter * -SearchBase '$ouDn' -Properties Name,SamAccountName,EmailAddress | Select-Object Name,SamAccountName,EmailAddress | ConvertTo-Json";
    $adCommand = "powershell -Command \"$psCommand\"";

    $command = $keyPath && file_exists($keyPath)
        ? ['ssh', '-i', $keyPath, '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $adCommand]
        : ['sshpass', '-p', $password, 'ssh', '-o', 'StrictHostKeyChecking=no', "{$user}@{$host}", $adCommand];

    $process = new Process($command);
    $process->setTimeout(40);
    $process->run();

    if (!$process->isSuccessful()) {
        throw new ProcessFailedException($process);
    }

    $output = trim($process->getOutput());
    return json_decode($output, true);
}



}
