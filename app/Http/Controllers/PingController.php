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
        'address' => 'required|string',
        'count' => 'nullable|integer|min:1|max:10',
        'timeout' => 'nullable|integer|min:100|max:10000',
        'ip_version' => 'nullable|in:4,6',
        'resolve' => 'nullable|boolean',
    ]);

    $address = $validated['address'];
    $count = !empty($validated['count']) ? intval($validated['count']) : 4;
    $timeout = !empty($validated['timeout']) ? intval($validated['timeout']) : 4000; // ms
    $ipVersion = !empty($validated['ip_version']) ? $validated['ip_version'] : null;

    $os = PHP_OS_FAMILY; // Windows, Linux, Darwin
   
    if ($os === 'Windows') {
        $cmd = "ping";
        if ($ipVersion) $cmd .= " -$ipVersion";
        $cmd .= " -n $count -w $timeout " . escapeshellarg($address);
    } else { // Linux / Mac
        $cmd = "ping";
        $cmd .= $ipVersion ? " -$ipVersion" : " -4";
        $cmd .= " -c $count -W " . max(1, ceil($timeout / 1000)) . " " . escapeshellarg($address);
    }

    exec($cmd, $outputLines, $returnVar);

    // Vérifie si au moins un paquet a répondu sous Linux
    if ($os !== 'Windows' && !empty($outputLines)) {
        $joinedOutput = implode("\n", $outputLines);
        // Si aucune réponse reçue → Échec
        $result = (preg_match('/(\d+) received/', $joinedOutput, $matches) && intval($matches[1]) > 0) ? 'Réussi' : 'Échec';
    } else {
        // Windows → code de retour
        $result = ($returnVar === 0) ? 'Réussi' : 'Échec';
    }

    return Inertia::render('ping/ping', [
        'address' => $address,
        'result' => $result,
        'options' => $validated,
    ]);
}



}
