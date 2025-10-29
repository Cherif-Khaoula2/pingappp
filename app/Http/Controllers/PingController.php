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
        $request->validate([
            'address' => 'required|string'
        ]);

        $address = escapeshellarg($request->input('address'));

        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $command = "ping -n 4 $address";
        } else {
            $command = "ping -c 4 $address";
        }

        $output = shell_exec($command);

        // ✅ Conversion en UTF-8 pour éviter l'erreur
        $output = mb_convert_encoding($output ?? '', 'UTF-8', 'auto');

        return Inertia::render('ping/ping', [
            'address' => $request->input('address'),
            'result' => nl2br($output),
        ]);
    }
}
