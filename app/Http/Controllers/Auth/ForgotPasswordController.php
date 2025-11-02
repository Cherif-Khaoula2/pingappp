<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mailer\Mailer as SymfonyMailer;

class ForgotPasswordController extends Controller
{
    public function create()
    {
        return inertia('Auth/ForgotPassword');
    }

    public function store(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = DB::table('users')->where('email', $request->email)->first();

        if (!$user) {
            return back()->with('status', 'Si cet email existe, un lien a été envoyé.');
        }

        // 🔐 Générer le token en clair
        $token = Str::random(64);

        // 💾 Stocker le token haché
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );

        // 🔗 Créer le lien avec le token en clair
        $resetUrl = route('password.reset', [
            'token' => $token,
            'email' => $user->email,
        ]);

        // 📤 Créer le transport SMTP personnalisé
        $transport = Transport::fromDsn('smtp://mail.sarpi-dz.com:25?encryption=null&auto_tls=false');
        $mailer = new SymfonyMailer($transport);

        // 📧 Préparer l'email
        $email = (new Email())
            ->from('Tosys <no-reply@sarpi-dz.com>')
            ->to($user->email)
            ->subject('Réinitialisation de votre mot de passe')
            ->html("
                <p>Bonjour,</p>
                <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                <p><a href='{$resetUrl}' target='_blank'>Réinitialiser mon mot de passe</a></p>
                <p>Ce lien expirera dans 60 minutes.</p>
                <p>Si vous n'avez pas fait cette demande, ignorez simplement cet email.</p>
            ");

        // 📬 Envoyer l'email via ton transport
        try {
           $mailer->send($email);
        }
         catch (\Symfony\Component\Mailer\Exception\TransportExceptionInterface $e) {
             \Log::error('Erreur d’envoi de mail (mot de passe oublié) : ' . $e->getMessage());
             return back()->withErrors([
               'email' => 'Le serveur de messagerie est temporairement indisponible. Veuillez réessayer plus tard.'
            ]);
        } 

        return back()->with('status', 'Si cet email existe, un lien a été envoyé.');
    }
}