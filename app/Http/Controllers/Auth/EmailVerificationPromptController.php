<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;

class EmailVerificationPromptController
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended('/');
        }

        return view('auth.verify-email');
    }
}
