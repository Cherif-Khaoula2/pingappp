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

        
        $command = "ping";

       
        if (!empty($validated['resolve']) && $validated['resolve']) {
            $command .= " -a";
        }

        if (!empty($validated['count'])) {
            $command .= " -n " . intval($validated['count']);
        } else {
            $command .= " -n 4"; 
        }

        if (!empty($validated['timeout'])) {
            $command .= " -w " . intval($validated['timeout']);
        }

        if (!empty($validated['ip_version'])) {
            $command .= " -" . $validated['ip_version'];
        }

        $command .= " $address";

      
        $output = shell_exec($command);
        $output = mb_convert_encoding($output ?? '', 'UTF-8', 'auto');

        return Inertia::render('ping/ping', [
            'address' => $validated['address'],
            'result' => nl2br($output),
            'options' => $validated,
        ]);
    }
}
