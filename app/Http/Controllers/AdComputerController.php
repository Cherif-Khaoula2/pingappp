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

public function getAllLapsComputers(Request $request)
{
    $this->authorize('getaduser');

    // Optionnel : tu peux filtrer par statut si tu veux (ici on récupère tout)
    // $onlyEnabled = $request->boolean('onlyEnabled', false);

    $host = env('SSH_HOST');
    $user = env('SSH_USER');
    $password = env('SSH_PASSWORD');
    $keyPath = env('SSH_KEY_PATH');

    if (!$host || !$user) {
        return response()->json(['success' => false, 'message' => 'Configuration SSH manquante']);
    }

    // Script PowerShell qui récupère tous les ordinateurs, tente d'obtenir le mot de passe LAPS
    // et renvoie un tableau d'objets JSON : { Name, Enabled, LapsPassword }
    $psScript = <<<'PS'
try {
    # Récupérer tous les ordinateurs (ajuster le filtre si besoin)
    $computers = Get-ADComputer -Filter * -Properties Enabled | Sort-Object -Property Name

    $result = foreach ($c in $computers) {
        $pwd = $null
        try {
            $laps = Get-LapsADPassword -Identity $c.Name -AsPlainText -ErrorAction Stop
            # Si Get-LapsADPassword retourne un objet, extraire la propriété Password
            if ($laps -and $laps.Password) {
                $pwd = $laps.Password
            } elseif ($laps -is [string]) {
                $pwd = $laps
            }
        } catch {
            # on ignore l'erreur (pas de mot de passe / droits), laisse $pwd = $null
        }

        [PSCustomObject]@{
            Name = $c.Name
            Enabled = $c.Enabled
            LapsPassword = $pwd
        }
    }

    # Convertir en JSON
    $result | ConvertTo-Json -Depth 5
} catch {
    # En cas d'erreur globale, retourner un objet d'erreur en JSON
    @{ error = $_.Exception.Message } | ConvertTo-Json -Depth 2
}
PS;

    // Encodage en UTF-16LE puis Base64 pour -EncodedCommand
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
        // plus de temps si l'AD est volumineux
        $process->setTimeout(120);
        $process->run();

        if (!$process->isSuccessful()) {
            Log::error('getAllLapsComputers PowerShell SSH Error', [
                'exit_code' => $process->getExitCode(),
                'error' => $process->getErrorOutput(),
                'output' => $process->getOutput(),
            ]);
            throw new ProcessFailedException($process);
        }

        $output = trim($process->getOutput());

        if (empty($output)) {
            return response()->json([
                'success' => false,
                'message' => 'Aucune sortie depuis le serveur distant'
            ]);
        }

        $decoded = json_decode($output, true);

        // Si le script a retourné une erreur encapsulée
        if (is_array($decoded) && array_key_exists('error', $decoded) && count($decoded) === 1) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur PowerShell: ' . $decoded['error']
            ], 500);
        }

        // Normaliser la structure : s'assurer que c'est un tableau d'objets
        if (is_array($decoded) && array_values($decoded) !== $decoded) {
            // Cas improbable où json_decode retourne un assoc non-numérique, on convertit en tableau
            $computers = [$decoded];
        } else {
            $computers = (array) $decoded;
        }

        // Nettoyage / formatage : garder seulement les champs nécessaires et convertir bool en int si tu veux
        $computersFormatted = array_map(function ($item) {
            return [
                'name' => $item['Name'] ?? ($item['name'] ?? null),
                'enabled' => array_key_exists('Enabled', $item) ? (bool)$item['Enabled'] : (isset($item['enabled']) ? (bool)$item['enabled'] : null),
                'laps_password' => $item['LapsPassword'] ?? ($item['lapsPassword'] ?? null),
            ];
        }, $computers);

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

        return response()->json([
            'success' => false,
            'message' => 'Erreur serveur : ' . $e->getMessage()
        ], 500);
    }
}
public function showAllComputersPage()
{
    // Ne pas retourner les 1000+ items ici — laisse le front les charger
    return inertia('Ad/FindAllComputersLaps');
}


}
