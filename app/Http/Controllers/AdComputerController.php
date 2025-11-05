<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Illuminate\Support\Facades\Log;
use App\Models\AdHiddenAccount;

class AdComputerController extends Controller
{
    public function getLapsPassword(Request $request)
    {
        $this->authorize('getaduser');

        $request->validate([
            'sam' => 'required|string|max:100'
        ]);

        $sam = trim($request->input('sam'));

        $host = env('SSH_HOST');
        $user = env('SSH_USER');
        $password = env('SSH_PASSWORD');
        $keyPath = env('SSH_KEY_PATH');

        if (!$host || !$user) {
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
                throw new ProcessFailedException($process);
            }

            $output = trim($process->getOutput());

            if (empty($output)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun mot de passe LAPS trouvé pour cet ordinateur'
                ]);
            }

            $passwordValue = json_decode($output, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $passwordValue = $output;
            }

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

            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur : ' . $e->getMessage()
            ], 500);
        }
    }

    public function showFindPage()
    {
        return inertia('Ad/FindComputerLaps');
    }

    /**
     * Streaming des ordinateurs LAPS un par un en temps réel
     * Utilise Server-Sent Events (SSE)
     */
    public function streamAllLapsComputers(Request $request)
    {
        $this->authorize('getaduser');

        $host = env('SSH_HOST');
        $user = env('SSH_USER');
        $password = env('SSH_PASSWORD');
        $keyPath = env('SSH_KEY_PATH');

        if (!$host || !$user) {
            return response()->json(['success' => false, 'message' => 'Configuration SSH manquante']);
        }

        // Headers pour Server-Sent Events
        return response()->stream(function () use ($host, $user, $password, $keyPath) {
            
            // Script PowerShell qui traite les ordinateurs un par un et les affiche immédiatement
            $psScript = <<<'PS'
try {
    # Récupérer tous les ordinateurs
    $computers = Get-ADComputer -Filter * -Properties Enabled | Sort-Object -Property Name
    
    # Envoyer le nombre total en premier
    $total = $computers.Count
    Write-Output "TOTAL:$total"
    
    # Traiter chaque ordinateur un par un
    foreach ($c in $computers) {
        $pwd = $null
        try {
            $laps = Get-LapsADPassword -Identity $c.Name -AsPlainText -ErrorAction Stop
            if ($laps -and $laps.Password) {
                $pwd = $laps.Password
            } elseif ($laps -is [string]) {
                $pwd = $laps
            }
        } catch {
            # Pas de mot de passe LAPS disponible
        }

        # Créer l'objet et l'afficher immédiatement en JSON sur une ligne
        $item = [PSCustomObject]@{
            Name = $c.Name
            Enabled = $c.Enabled
            LapsPassword = $pwd
        }
        
        # Afficher chaque ordinateur sur une ligne séparée avec un marqueur
        Write-Output "COMPUTER:$($item | ConvertTo-Json -Compress -Depth 2)"
    }
    
    Write-Output "DONE"
} catch {
    Write-Output "ERROR:$($_.Exception.Message)"
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
                $process->setTimeout(300); // 5 minutes max
                
                // Callback pour traiter la sortie ligne par ligne en temps réel
                $process->start(function ($type, $buffer) {
                    if ($type === Process::OUT) {
                        $lines = explode("\n", $buffer);
                        
                        foreach ($lines as $line) {
                            $line = trim($line);
                            if (empty($line)) continue;

                            // Envoyer le nombre total
                            if (strpos($line, 'TOTAL:') === 0) {
                                $total = (int) str_replace('TOTAL:', '', $line);
                                echo "data: " . json_encode([
                                    'type' => 'total',
                                    'count' => $total
                                ]) . "\n\n";
                                ob_flush();
                                flush();
                                continue;
                            }

                            // Envoyer un ordinateur
                            if (strpos($line, 'COMPUTER:') === 0) {
                                $json = str_replace('COMPUTER:', '', $line);
                                $computer = json_decode($json, true);
                                
                                if ($computer) {
                                    echo "data: " . json_encode([
                                        'type' => 'computer',
                                        'data' => [
                                            'name' => $computer['Name'] ?? null,
                                            'enabled' => (bool)($computer['Enabled'] ?? false),
                                            'laps_password' => $computer['LapsPassword'] ?? null,
                                        ]
                                    ]) . "\n\n";
                                    ob_flush();
                                    flush();
                                }
                                continue;
                            }

                            // Fin du traitement
                            if ($line === 'DONE') {
                                echo "data: " . json_encode(['type' => 'done']) . "\n\n";
                                ob_flush();
                                flush();
                                continue;
                            }

                            // Erreur
                            if (strpos($line, 'ERROR:') === 0) {
                                $error = str_replace('ERROR:', '', $line);
                                echo "data: " . json_encode([
                                    'type' => 'error',
                                    'message' => $error
                                ]) . "\n\n";
                                ob_flush();
                                flush();
                            }
                        }
                    }
                });

                // Attendre la fin du processus
                $process->wait();

                if (!$process->isSuccessful()) {
                    echo "data: " . json_encode([
                        'type' => 'error',
                        'message' => 'Erreur lors de l\'exécution du processus'
                    ]) . "\n\n";
                    ob_flush();
                    flush();
                }

            } catch (\Throwable $e) {
                Log::error('streamAllLapsComputers error', [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]);

                echo "data: " . json_encode([
                    'type' => 'error',
                    'message' => 'Erreur serveur : ' . $e->getMessage()
                ]) . "\n\n";
                ob_flush();
                flush();
            }

        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ]);
    }

    /**
     * Alternative : Pagination classique (plus simple mais moins fluide)
     */
    public function getAllLapsComputersPaginated(Request $request)
    {
        $this->authorize('getaduser');

        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 50);

        $host = env('SSH_HOST');
        $user = env('SSH_USER');
        $password = env('SSH_PASSWORD');
        $keyPath = env('SSH_KEY_PATH');

        if (!$host || !$user) {
            return response()->json(['success' => false, 'message' => 'Configuration SSH manquante']);
        }

        // Script PowerShell avec pagination côté serveur
        $psScript = <<<PS
try {
    \$page = $page
    \$perPage = $perPage
    \$skip = (\$page - 1) * \$perPage

    # Récupérer tous les ordinateurs (pour avoir le total)
    \$allComputers = Get-ADComputer -Filter * -Properties Enabled | Sort-Object -Property Name
    \$total = \$allComputers.Count
    
    # Prendre uniquement la page demandée
    \$computers = \$allComputers | Select-Object -Skip \$skip -First \$perPage

    \$result = foreach (\$c in \$computers) {
        \$pwd = \$null
        try {
            \$laps = Get-LapsADPassword -Identity \$c.Name -AsPlainText -ErrorAction Stop
            if (\$laps -and \$laps.Password) {
                \$pwd = \$laps.Password
            } elseif (\$laps -is [string]) {
                \$pwd = \$laps
            }
        } catch {
            # Pas de mot de passe
        }

        [PSCustomObject]@{
            Name = \$c.Name
            Enabled = \$c.Enabled
            LapsPassword = \$pwd
        }
    }

    # Retourner les données avec métadonnées de pagination
    @{
        total = \$total
        page = \$page
        per_page = \$perPage
        data = \$result
    } | ConvertTo-Json -Depth 5
} catch {
    @{ error = \$_.Exception.Message } | ConvertTo-Json -Depth 2
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
                Log::error('getAllLapsComputersPaginated Error', [
                    'exit_code' => $process->getExitCode(),
                    'error' => $process->getErrorOutput(),
                ]);
                throw new ProcessFailedException($process);
            }

            $output = trim($process->getOutput());
            $decoded = json_decode($output, true);

            if (isset($decoded['error'])) {
                return response()->json([
                    'success' => false,
                    'message' => $decoded['error']
                ], 500);
            }

            $computers = array_map(function ($item) {
                return [
                    'name' => $item['Name'] ?? null,
                    'enabled' => (bool)($item['Enabled'] ?? false),
                    'laps_password' => $item['LapsPassword'] ?? null,
                ];
            }, $decoded['data'] ?? []);

            return response()->json([
                'success' => true,
                'total' => $decoded['total'] ?? 0,
                'page' => $decoded['page'] ?? $page,
                'per_page' => $decoded['per_page'] ?? $perPage,
                'computers' => $computers
            ]);

        } catch (\Throwable $e) {
            Log::error('getAllLapsComputersPaginated error', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur : ' . $e->getMessage()
            ], 500);
        }
    }

    public function showAllComputersPage()
    {
        return inertia('Ad/FindAllComputersLaps');
    }
}