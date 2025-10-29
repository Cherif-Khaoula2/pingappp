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
    $validated = $request->validate([
        'address' => 'required|string|regex:/^[a-zA-Z0-9\.\-]+$/',
        'count' => 'nullable|integer|min:1|max:10',
        'timeout' => 'nullable|integer|min:100|max:10000',
        'ip_version' => 'nullable|in:4,6',
        'resolve' => 'nullable|boolean',
    ]);

    $address = escapeshellarg($validated['address']);
    $os = PHP_OS_FAMILY; // "Windows", "Linux", "Darwin" ...

    if ($os === 'Windows') {
        $command = "ping";
        if (!empty($validated['resolve']) && $validated['resolve']) {
            $command .= " -a";
        }
        $command .= " -n " . (!empty($validated['count']) ? intval($validated['count']) : 4);
        if (!empty($validated['timeout'])) {
            $command .= " -w " . intval($validated['timeout']);
        }
        if (!empty($validated['ip_version'])) {
            $command .= " -" . $validated['ip_version'];
        }
    } else { // Linux / Mac
        $command = "ping";
        $command .= !empty($validated['ip_version']) ? " -" . $validated['ip_version'] : " -4";
        $command .= " -c " . (!empty($validated['count']) ? intval($validated['count']) : 4);
        if (!empty($validated['timeout'])) {
            // Convertir ms en secondes pour Linux
            $timeoutSec = ceil(intval($validated['timeout']) / 1000);
            $command .= " -W " . max(1, $timeoutSec); 
        }
        // L'option -a (résolution nom) n'existe pas sur Linux, donc on l'ignore
    }

    // Exécution de la commande
    exec($command, $outputLines, $returnVar);

    $result = ($returnVar === 0) ? 'Réussi' : 'Échec';

    return Inertia::render('ping/ping', [
        'address' => $validated['address'],
        'result' => $result,
        'options' => $validated,
    ]);
}


}
