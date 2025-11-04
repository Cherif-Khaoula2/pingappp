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
}
