<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Inertia\Inertia;

class AdUserController extends Controller
{
    public function index()
    {
        // Page Inertia (React) contenant le bouton
        return Inertia::render('Ad/IpConfigPage');
    }

    public function ipConfig(Request $request)
    {
        // Validation minimale — adapte selon ton besoin
        $data = $request->validate([
            'host' => 'required|string',
            'user' => 'required|string',
            // si tu veux permettre mot de passe via frontend (déconseillé)
            'password' => 'nullable|string',
            // si tu utilises clé, tu n'as pas besoin de password
        ]);

        $host = $data['host'];
        $user = $data['user'];
        $password = $data['password'] ?? null;

        // Construire la commande SSH. Ici: ipconfig (Windows)
        // NOTE: StrictHostKeyChecking=no pour éviter prompt host key
        if ($password) {
            // Utilisation sshpass (exemple)
            $command = [
                'sshpass', '-p', $password,
                'ssh', '-o', 'StrictHostKeyChecking=no',
                "{$user}@{$host}", 'ipconfig'
            ];
        } else {
            // Sans mot de passe (clé SSH configurée)
            $command = [
                'ssh', '-o', 'StrictHostKeyChecking=no',
                "{$user}@{$host}", 'ipconfig'
            ];
        }

        try {
            $process = new Process($command);
            $process->setTimeout(15); // en secondes
            $process->run();

            if (! $process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }

            $output = $process->getOutput();

            // Extraire les adresses IPv4 de la sortie Windows ipconfig
            // Pattern couvre "IPv4 Address. . . . . . . . . . . : 192.168.0.10"
            preg_match_all('/IPv4 Address[^\:]*:\s*([0-9]{1,3}(?:\.[0-9]{1,3}){3})/i', $output, $matches);

            $ips = $matches[1] ?? [];

            // Si tu veux renvoyer toute la sortie pour debug :
            // return response()->json(['raw' => $output, 'ips' => $ips]);

            return response()->json([
                'success' => true,
                'ips' => $ips,
                'raw' => $output,
            ]);
        } catch (\Throwable $e) {
            // Log l'erreur côté serveur
            \Log::error('ipConfig error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'exécution SSH : '.$e->getMessage(),
            ], 500);
        }
    }
}
