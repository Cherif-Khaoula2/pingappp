<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Password;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mailer\Mailer as SymfonyMailer;
use Symfony\Component\Mime\Email;
class UserCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        //
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
{
    $token = Password::createToken($notifiable);
    $resetUrl = url(route('password.reset', ['token' => $token, 'email' => $notifiable->email], false));

    // Créer le mail Symfony directement
    $transport = Transport::fromDsn('smtp://mail.sarpi-dz.com:25?encryption=null&auto_tls=false');
    $mailer = new SymfonyMailer($transport);

    $email = (new Email())
        ->from('noreply@gestion-materiels.com')
        ->to($notifiable->email)
        ->subject('Un administrateur a créé un compte pour vous sur ' . config('app.name'))
        ->html("
            <p>Bonjour {$notifiable->first_name} {$notifiable->last_name},</p>
            <p>Un administrateur sur " . config('app.name') . " a créé un compte pour vous.</p>
            <p>Vous pouvez maintenant définir votre mot de passe en cliquant sur le lien ci-dessous :</p>
            <p><a href='{$resetUrl}'>Définir mon mot de passe</a></p>
            <p>Ce lien ne peut être utilisé qu'une seule fois.</p>
            <p>Nom d'utilisateur : {$notifiable->email}</p>
            <p>Mot de passe : celui que vous avez défini</p>
            <p>— L’équipe " . config('app.name') . "</p>
        ");

    try {
        $mailer->send($email);
    } catch (\Exception $e) {
        \Log::error('Erreur SMTP : ' . $e->getMessage());
    }
}
}
