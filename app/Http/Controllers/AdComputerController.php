<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Illuminate\Support\Facades\Log;
use App\Models\AdHiddenAccount;
use App\Traits\LogsAdActivity;

class AdComputerController extends Controller
{
    use LogsAdActivity;

    public function getLapsPassword(Request $request)
    {
        $this->authorize('getadpc');

        $request->validate([
            'sam' => 'required|string|max:100'
        ]);

        $sam = trim($request->input('sam'));

        // 📝 Log de recherche LAPS
        $this->logAdActivity(
            action: 'get_laps_password',
            targetUser: $sam,
            targetUserName: null,
            success: true,
            additionalDetails: [
                'search_query' => $sam,
                'search_type' => 'laps_password_retrieval',
                'timestamp' => now()->toDateTimeString()
            ]
        );

        $host = env('SSH_HOST');
        $user = env('SSH_USER');
        $password = env('SSH_PASSWORD');
        $keyPath = env('SSH_KEY_PATH');

        if (!$host || !$user) {
            $this->logAdActivity(
                action: 'get_laps_password',
                targetUser: $sam,
                targetUserName: null,
                success: false,
                errorMessage: 'Configuration SSH manquante'
            );
            
            return response()->json(['success' => false, 'message' => 'Configuration SSH manquante']);
        }

        // Script PowerShell LAPS
        $escapedSam = str_replace(['"', "'"], ['`"', "''"], $sam);
        $psScript = "Get-LapsADPassword -Identity \"{$escapedSam}\" -AsPlainText | Select-Object -ExpandProperty Password | ConvertTo-Json";

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
                Log::error('PowerShell SSH Error', [
                    'exit_code' => $process->getExitCode(),
                    'error' => $process->getErrorOutput(),
                    'output' => $process->getOutput(),
                    'sam' => $sam
                ]);

                $this->logAdActivity(
                    action: 'get_laps_password',
                    targetUser: $sam,
                    targetUserName: null,
                    success: false,
                    errorMessage: 'Erreur SSH lors de la récupération : ' . $process->getErrorOutput()
                );

                throw new ProcessFailedException($process);
            }

            $output = trim($process->getOutput());

            if (empty($output)) {
                $this->logAdActivity(
                    action: 'get_laps_password',
                    targetUser: $sam,
                    targetUserName: null,
                    success: false,
                    errorMessage: 'Aucun mot de passe LAPS trouvé'
                );

                return response()->json([
                    'success' => false,
                    'message' => 'Aucun mot de passe LAPS trouvé pour cet ordinateur'
                ]);
            }

            $passwordValue = json_decode($output, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $passwordValue = $output;
            }

            // ✅ Log de succès avec détails
            $this->logAdActivity(
                action: 'get_laps_password',
                targetUser: $sam,
                targetUserName: null,
                success: true,
                additionalDetails: [
                    'password_retrieved' => true,
                    'method' => 'PowerShell LAPS',
                    'timestamp' => now()->toDateTimeString()
                ]
            );

            return response()->json([
                'success' => true,
                'sam' => $sam,
                'laps_password' => $passwordValue
            ]);

        } catch (\Throwable $e) {
            Log::error('getLapsPassword error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'sam' => $sam
            ]);

            $this->logAdActivity(
                action: 'get_laps_password',
                targetUser: $sam,
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
                'message' => 'Erreur serveur : ' . $e->getMessage()
            ], 500);
        }
    }

    public function showFindPage()
    {
        // 📝 Log de consultation de la page de recherche LAPS
        $this->logAdActivity(
            action: 'view_laps_search_page',
            targetUser: null,
            targetUserName: null,
            success: true,
            additionalDetails: [
                'page' => 'FindComputerLaps',
                'action_type' => 'page_view',
                'timestamp' => now()->toDateTimeString()
            ]
        );

        return inertia('Ad/FindComputerLaps');
    }

    public function getAllLapsComputers(Request $request)
    {
        $this->authorize('getadpc');

        // 📝 Log de récupération de tous les ordinateurs LAPS
        $this->logAdActivity(
            action: 'get_all_laps_computers',
            targetUser: null,
            targetUserName: null,
            success: true,
            additionalDetails: [
                'search_type' => 'all_computers_laps',
                'timestamp' => now()->toDateTimeString()
            ]
        );

        $host = env('SSH_HOST');
        $user = env('SSH_USER');
        $password = env('SSH_PASSWORD');
        $keyPath = env('SSH_KEY_PATH');

        if (!$host || !$user) {
            $this->logAdActivity(
                action: 'get_all_laps_computers',
                targetUser: null,
                targetUserName: null,
                success: false,
                errorMessage: 'Configuration SSH manquante'
            );

            return response()->json(['success' => false, 'message' => 'Configuration SSH manquante']);
        }

        $psScript = <<<'PS'
try {
    # Récupérer tous les ordinateurs
    $computers = Get-ADComputer -Filter * -Properties Enabled,DistinguishedName | Sort-Object -Property Name

    $result = foreach ($c in $computers) {
        $pwd = $null
        try {
            $laps = Get-LapsADPassword -Identity $c.Name -AsPlainText -ErrorAction Stop
            if ($laps -and $laps.Password) {
                $pwd = $laps.Password
            } elseif ($laps -is [string]) {
                $pwd = $laps
            }
        } catch {
            # pas de mot de passe / droits
        }

        [PSCustomObject]@{
            Name = $c.Name
            Enabled = $c.Enabled
            LapsPassword = $pwd
            DistinguishedName = $c.DistinguishedName
        }
    }

    $result | ConvertTo-Json -Depth 5
} catch {
    @{ error = $_.Exception.Message } | ConvertTo-Json -Depth 2
}
PS;

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
            $process->setTimeout(120);
            $process->run();

            if (!$process->isSuccessful()) {
                Log::error('getAllLapsComputers PowerShell SSH Error', [
                    'exit_code' => $process->getExitCode(),
                    'error' => $process->getErrorOutput(),
                    'output' => $process->getOutput(),
                ]);

                $this->logAdActivity(
                    action: 'get_all_laps_computers',
                    targetUser: null,
                    targetUserName: null,
                    success: false,
                    errorMessage: 'Erreur SSH lors de la récupération : ' . $process->getErrorOutput()
                );

                throw new ProcessFailedException($process);
            }

            $output = trim($process->getOutput());

            if (empty($output)) {
                $this->logAdActivity(
                    action: 'get_all_laps_computers',
                    targetUser: null,
                    targetUserName: null,
                    success: false,
                    errorMessage: 'Aucune sortie depuis le serveur distant'
                );

                return response()->json([
                    'success' => false,
                    'message' => 'Aucune sortie depuis le serveur distant'
                ]);
            }

            $decoded = json_decode($output, true);

            if (is_array($decoded) && array_key_exists('error', $decoded) && count($decoded) === 1) {
                $this->logAdActivity(
                    action: 'get_all_laps_computers',
                    targetUser: null,
                    targetUserName: null,
                    success: false,
                    errorMessage: 'Erreur PowerShell: ' . $decoded['error']
                );

                return response()->json([
                    'success' => false,
                    'message' => 'Erreur PowerShell: ' . $decoded['error']
                ], 500);
            }

            if (is_array($decoded) && array_values($decoded) !== $decoded) {
                $computers = [$decoded];
            } else {
                $computers = (array) $decoded;
            }

            $computersFormatted = array_map(function ($item) {
                return [
                    'name' => $item['Name'] ?? ($item['name'] ?? null),
                    'enabled' => array_key_exists('Enabled', $item) ? (bool)$item['Enabled'] : (isset($item['enabled']) ? (bool)$item['enabled'] : null),
                    'laps_password' => $item['LapsPassword'] ?? ($item['lapsPassword'] ?? null),
                    'distinguished_name' => $item['DistinguishedName'] ?? ($item['distinguishedName'] ?? null),
                ];
            }, $computers);

            // ✅ Log de succès avec le nombre d'ordinateurs
            $this->logAdActivity(
                action: 'get_all_laps_computers',
                targetUser: null,
                targetUserName: null,
                success: true,
                additionalDetails: [
                    'computers_count' => count($computersFormatted),
                    'method' => 'PowerShell AD',
                    'timestamp' => now()->toDateTimeString()
                ]
            );

            return response()->json([
                'success' => true,
                'count' => count($computersFormatted),
                'computers' => $computersFormatted
            ]);

        } catch (\Throwable $e) {
            Log::error('getAllLapsComputers error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            $this->logAdActivity(
                action: 'get_all_laps_computers',
                targetUser: null,
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
                'message' => 'Erreur serveur : ' . $e->getMessage()
            ], 500);
        }
    }

    public function showAllComputersPage()
    {
        // 📝 Log de consultation de la page de tous les ordinateurs LAPS
        $this->logAdActivity(
            action: 'view_all_laps_computers_page',
            targetUser: null,
            targetUserName: null,
            success: true,
            additionalDetails: [
                'page' => 'FindAllComputersLaps',
                'action_type' => 'page_view',
                'timestamp' => now()->toDateTimeString()
            ]
        );

        return inertia('Ad/FindAllComputersLaps');
    }
}