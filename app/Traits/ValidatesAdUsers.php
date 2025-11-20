<?php

namespace App\Traits;

use App\Models\AdHiddenAccount;
use App\Models\Dn;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

trait ValidatesAdUsers
{
    /**
     * Vérifie si un utilisateur AD est autorisé pour l'utilisateur connecté
     * 
     * @param string $samAccountName
     * @return array ['authorized' => bool, 'user' => array|null, 'error' => string|null]
     */
    protected function validateAdUserAccess(string $samAccountName): array
    {
        // 1️⃣ Vérifier si le compte est caché
        if ($this->isHiddenAccount($samAccountName)) {
            Log::warning("Tentative d'accès à un compte caché", [
                'sam' => $samAccountName,
                'user_id' => auth()->id(),
                'ip' => request()->ip()
            ]);
            
            return [
                'authorized' => false,
                'user' => null,
                'error' => 'Ce compte n\'est pas accessible'
            ];
        }

        // 2️⃣ Récupérer l'utilisateur depuis AD
        $adUser = $this->getAdUserBySam($samAccountName);
        
        if (!$adUser) {
            return [
                'authorized' => false,
                'user' => null,
                'error' => 'Utilisateur introuvable dans Active Directory'
            ];
        }

        // 3️⃣ Vérifier si le DN est autorisé
        $userAuthDns = auth()->user()->dns()->pluck('path')->toArray();
        $isAuthorized = $this->isDnAuthorized($adUser['dn'], $userAuthDns);

        if (!$isAuthorized) {
            Log::warning("Tentative d'accès à un DN non autorisé", [
                'sam' => $samAccountName,
                'dn' => $adUser['dn'],
                'user_id' => auth()->id(),
                'authorized_dns' => $userAuthDns,
                'ip' => request()->ip()
            ]);
            
            return [
                'authorized' => false,
                'user' => $adUser,
                'error' => 'Vous n\'avez pas les permissions pour accéder à cet utilisateur'
            ];
        }

        return [
            'authorized' => true,
            'user' => $adUser,
            'error' => null
        ];
    }

    /**
     * Vérifie si un compte est dans la liste des comptes cachés
     */
    protected function isHiddenAccount(string $samAccountName): bool
    {
        return AdHiddenAccount::where('samaccountname', strtolower($samAccountName))->exists();
    }

    /**
     * Récupère un utilisateur AD par SamAccountName
     */
    protected function getAdUserBySam(string $samAccountName): ?array
    {
        $host = env('SSH_HOST');
        $user = env('SSH_USER');
        $password = env('SSH_PASSWORD');
        $keyPath = env('SSH_KEY_PATH');

        if (!$host || !$user) {
            Log::error('Configuration SSH manquante');
            return null;
        }

        // ✅ Échapper les caractères dangereux
        $escapedSam = $this->escapePowerShellString($samAccountName);

        $psScript = 
            "\$user = Get-ADUser -Identity '$escapedSam' " .
            "-Properties Name,SamAccountName,EmailAddress,Enabled,DistinguishedName,GivenName,Surname -ErrorAction Stop; " .
            "\$user | Select-Object Name,SamAccountName,EmailAddress,Enabled,DistinguishedName,GivenName,Surname | " .
            "ConvertTo-Json -Depth 2";

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
            $process->setTimeout(30);
            $process->run();

            if (!$process->isSuccessful()) {
                Log::error('Erreur récupération utilisateur AD', [
                    'sam' => $samAccountName,
                    'exit_code' => $process->getExitCode(),
                    'error' => $process->getErrorOutput()
                ]);
                return null;
            }

            $output = trim($process->getOutput());
            $adUser = json_decode($output, true);

            if (!$adUser || json_last_error() !== JSON_ERROR_NONE) {
                return null;
            }

            return [
                'name' => $adUser['Name'] ?? '',
                'firstName' => $adUser['GivenName'] ?? '',
                'lastName' => $adUser['Surname'] ?? '',
                'sam' => $adUser['SamAccountName'] ?? '',
                'email' => $adUser['EmailAddress'] ?? '',
                'enabled' => (bool)($adUser['Enabled'] ?? false),
                'dn' => $adUser['DistinguishedName'] ?? ''
            ];

        } catch (\Throwable $e) {
            Log::error('Exception getAdUserBySam', [
                'sam' => $samAccountName,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Vérifie si un DN est dans la liste des DNs autorisés
     */
protected function isDnAuthorized(string $dn, array $authorizedDns): bool
{
    if (empty($authorizedDns)) {
        return false;
    }

    $normalizedDn = strtolower(trim($dn));

    foreach ($authorizedDns as $allowedDn) {
        $normalizedAllowedDn = strtolower(trim($allowedDn));

        // Match exact
        if ($normalizedDn === $normalizedAllowedDn) {
            return true;
        }

        // Le DN doit se terminer par ",allowedDn"
        if (!str_ends_with($normalizedDn, ',' . $normalizedAllowedDn)) {
            continue; // teste le prochain DN autorisé
        }

        // Vérification stricte : pas d'OU avant le DN autorisé
        $beforeAllowedDn = substr($normalizedDn, 0, -(strlen(',' . $normalizedAllowedDn)));
        if (preg_match('/\bou=/i', $beforeAllowedDn)) {
            continue; // passe au DN autorisé suivant
        }

        return true; // trouvé un DN autorisé valide
    }

    return false; // aucun DN autorisé ne correspond
}


    /**
     * Échappe les caractères dangereux pour PowerShell (pour -Identity)
     */
    protected function escapePowerShellString(string $input): string
    {
        // Remplacer les caractères dangereux
        $input = str_replace(['`', '$', '"', "'", ';', '&', '|', '<', '>', "\n", "\r"], '', $input);
        
        // Limiter la longueur
        return substr($input, 0, 100);
    }

    /**
     * ✅ NOUVELLE MÉTHODE : Échappe les caractères pour les filtres PowerShell (recherche)
     * Cette méthode est moins restrictive car elle doit permettre les wildcards
     */
    protected function escapePowerShellStringForFilter(string $string): string
    {
        if (empty($string)) {
            return '';
        }
        
        // Échapper uniquement les caractères vraiment dangereux pour l'injection
        // Mais garder les wildcards fonctionnels
        $escaped = str_replace([
            '`',      // Backtick (escape char PowerShell)
            '"',      // Guillemets
            "'",      // Apostrophes
            '$',      // Variables
            ';',      // Séparateur de commandes
            '|',      // Pipe
            '&',      // Opérateur
            '<',      // Redirection
            '>',      // Redirection
            "\n",     // Newline
            "\r",     // Carriage return
        ], [
            '``',
            '`"',
            "`'",
            '`$',
            '`;',
            '`|',
            '`&',
            '`<',
            '`>',
            '',
            '',
        ], $string);
        
        // Limiter la longueur
        return substr($escaped, 0, 100);
    }

    /**
     * Valide qu'une direction est autorisée pour l'utilisateur
     */
    protected function validateDirectionAccess(int $directionId): array
    {
        $direction = Dn::find($directionId);
        
        if (!$direction) {
            return [
                'authorized' => false,
                'direction' => null,
                'error' => 'Direction introuvable'
            ];
        }

        $userAuthDns = auth()->user()->dns()->pluck('dns.id')->toArray();
        
        if (!in_array($directionId, $userAuthDns)) {
            Log::warning("Tentative d'accès à une direction non autorisée", [
                'direction_id' => $directionId,
                'user_id' => auth()->id(),
                'ip' => request()->ip()
            ]);
            
            return [
                'authorized' => false,
                'direction' => null,
                'error' => 'Vous n\'avez pas accès à cette direction'
            ];
        }

        return [
            'authorized' => true,
            'direction' => $direction,
            'error' => null
        ];
    }


    protected function doesExchangeMailboxExist(string $samAccountName): bool
{
    $exHost = env('SSH_HOST_EX');
    $exUser = env('SSH_USER_EX');
    $exPassword = env('SSH_PASSWORD_EX');
    $exKeyPath = env('SSH_KEY_PATH_EX');

    if (!$exHost || !$exUser) {
        Log::error('Configuration SSH Exchange manquante');
        return false;
    }

    $escapedSam = $this->escapePowerShellString($samAccountName);

    $psCommand = "powershell -NoProfile -NonInteractive -Command \"try { Get-Mailbox -Identity '$escapedSam' -ErrorAction Stop | Select-Object Name } catch { exit 1 }\"";

    $sshOptions = [
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'UserKnownHostsFile=/dev/null',
        '-o', 'LogLevel=ERROR'
    ];

    $command = $exKeyPath && file_exists($exKeyPath)
        ? array_merge(['ssh', '-i', $exKeyPath], $sshOptions, ["{$exUser}@{$exHost}", $psCommand])
        : array_merge(['sshpass', '-p', $exPassword, 'ssh'], $sshOptions, ["{$exUser}@{$exHost}", $psCommand]);

    try {
        $process = new Process($command);
        $process->setTimeout(30);
        $process->run();

        // Si le code de sortie est 0, la mailbox existe
        return $process->isSuccessful();

    } catch (\Throwable $e) {
        Log::error('Erreur vérification mailbox Exchange', [
            'sam' => $samAccountName,
            'error' => $e->getMessage()
        ]);
        return false;
    }
}

protected function doesExchangeDatabaseExist(string $dbName): bool
{
    $exHost = env('SSH_HOST_EX');
    $exUser = env('SSH_USER_EX');
    $exPassword = env('SSH_PASSWORD_EX');
    $exKeyPath = env('SSH_KEY_PATH_EX');

    if (!$exHost || !$exUser) {
        Log::error('Configuration SSH Exchange manquante');
        return false;
    }

    $escapedDb = $this->escapePowerShellString($dbName);

    $psCommand = "powershell -NoProfile -NonInteractive -Command \"try { Get-MailboxDatabase -Identity '$escapedDb' -ErrorAction Stop | Select-Object Name } catch { exit 1 }\"";

    $sshOptions = [
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'UserKnownHostsFile=/dev/null',
        '-o', 'LogLevel=ERROR'
    ];

    $command = $exKeyPath && file_exists($exKeyPath)
        ? array_merge(['ssh', '-i', $exKeyPath], $sshOptions, ["{$exUser}@{$exHost}", $psCommand])
        : array_merge(['sshpass', '-p', $exPassword, 'ssh'], $sshOptions, ["{$exUser}@{$exHost}", $psCommand]);

    try {
        $process = new Process($command);
        $process->setTimeout(30);
        $process->run();

        // Si le code de sortie est 0, la DB existe
        return $process->isSuccessful();

    } catch (\Throwable $e) {
        Log::error('Erreur vérification DB Exchange', [
            'db' => $dbName,
            'error' => $e->getMessage()
        ]);
        return false;
    }
}

}