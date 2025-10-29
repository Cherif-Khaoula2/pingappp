<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class PingController extends Controller
{
    public function index()
    {
        return Inertia::render('ping/ping', [
            'address' => null,
            'result' => null,
        ]);
    }

    public function ping(Request $request)
    {
        // Validation des données d’entrée
        $validated = $request->validate([
            'address' => 'required|string|regex:/^[a-zA-Z0-9\.\-]+$/',
            'count' => 'nullable|integer|min:1|max:10',
            'timeout' => 'nullable|integer|min:100|max:10000',
            'ip_version' => 'nullable|in:4,6',
        ]);

        // Empêche les pings trop longs
        set_time_limit(5);

        $address = escapeshellarg($validated['address']);
        $count = $validated['count'] ?? 4; // nombre de paquets
        $timeout = intval(($validated['timeout'] ?? 1000) / 1000); // en secondes

        // Commande de base pour Linux
        $command = "ping -c " . intval($count) . " -W " . $timeout;

        // Si l’utilisateur choisit IPv4 ou IPv6
        if (!empty($validated['ip_version'])) {
            $command .= " -" . intval($validated['ip_version']);
        }

        $command .= " $address 2>&1"; // Redirige les erreurs vers la sortie standard

        // Exécution sécurisée
        $output = shell_exec($command);
        $output = mb_convert_encoding($output ?? '', 'UTF-8', 'auto');

        // Si aucune sortie, on affiche un message clair
        if (empty(trim($output))) {
            $output = "Aucune réponse. L’hôte est peut-être injoignable ou le ping est bloqué.";
        }

        return Inertia::render('ping/ping', [
            'address' => $validated['address'],
            'result' => nl2br($output),
            'options' => $validated,
        ]);
    }
}
