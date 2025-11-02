<?php

namespace App\Http\Controllers;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mailer\Mailer as SymfonyMailer;
use Symfony\Component\Mime\Email;
use Illuminate\Support\Facades\Password;
use App\Http\Requests\UserDeleteRequest;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;
use LdapRecord\Models\ActiveDirectory\User as LdapUser;

use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UsersController extends Controller
{
  public function index(Request $request): Response
{
    $search = $request->input('search', '');
    $perPage = $request->input('per_page', 10);
    
    $users = User::query()
        ->when($search, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        })
        ->with('roles')
        ->orderBy('first_name')
        ->paginate($perPage);

    return Inertia::render('Users/Index', [
        'permissions' => auth()->user()->getAllPermissions()->pluck('name'),
        'users' => $users,
        'search' => $search,
    ]);
}
public function create(): Response
{
    $roles = \Spatie\Permission\Models\Role::all(['id', 'name']);

    return Inertia::render('Users/Create', [
         'permissions' => auth()->user()->getAllPermissions()->pluck('name'),
        'roles' => $roles->map(fn($role) => [
            'value' => $role->name, // ou $role->id si tu veux utiliser l'id
            'label' => ucfirst($role->name),
        ]),
    ]);
}


 public function store(UserStoreRequest $request): RedirectResponse
{
    $data = $request->validated();

    // Nettoyer le prénom et le nom pour créer le samaccountname
    $firstName = strtolower(trim($data['first_name']));
    $lastName  = strtolower(trim($data['last_name']));

    // Retirer tout caractère non alphanumérique
    $firstName = preg_replace('/[^a-z0-9]/', '', $firstName);
    $lastName  = preg_replace('/[^a-z0-9]/', '', $lastName);

    $samaccountname = $firstName . '.' . $lastName;

    $email = strtolower(trim($data['email']));

    // Vérifier dans LDAP
    $ldapUserSam = LdapUser::where('samaccountname', $samaccountname)->first();
    $ldapUserEmail = LdapUser::where('mail', $email)->first();

    if ($ldapUserSam || $ldapUserEmail) {
        return Redirect::back()->withErrors([
            'first_name' => "Impossible de créer ce compte : le nom d'utilisateur ou l'email existe déjà dans Active Directory."
        ]);
    }

    // Vérifier dans la base locale
    if (User::where('samaccountname', $samaccountname)->exists() || User::where('email', $email)->exists()) {
        return Redirect::back()->withErrors([
            'first_name' => "Impossible de créer ce compte : le nom d'utilisateur ou l'email existe déjà localement."
        ]);
    }

    // Supprimer 'role' pour éviter l'erreur SQL
    $roles = $data['role'] ?? [];
    unset($data['role']);

   

    // Créer l'utilisateur avec samaccountname
    $user = User::create(array_merge($data, [
        'samaccountname' => $samaccountname,
    ]));
    // Assigner plusieurs rôles
    if (!empty($roles)) {
        $user->assignRole($roles); // ✅ accepte un tableau
    } else {
        $user->assignRole('user'); // rôle par défaut
    }

    // Envoi manuel de l'email ici
    $token = Password::createToken($user);
    $resetUrl = url(route('password.reset', ['token' => $token, 'email' => $user->email], false));

    $transport = Transport::fromDsn('smtp://mail.sarpi-dz.com:25?encryption=null&auto_tls=false');
    $mailer = new SymfonyMailer($transport);

    $html = "
<style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f9f9f9;
        color: #333;
        padding: 20px;
    }
    .container {
        background-color: #ffffff;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 20px;
        max-width: 600px;
        margin: auto;
    }
    h2 {
        color: #2c3e50;
    }
    a.button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #3498db;
        color: #fff;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 10px;
    }
    a.button:hover {
        background-color: #2980b9;
    }
    .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #888;
    }
</style>

<div class='container'>
    <h2>Bienvenue {$user->first_name} {$user->last_name},</h2>
    <p>Un administrateur sur <strong>" . config('app.name') . "</strong> a créé un compte pour vous.</p>
    <p>Vous pouvez maintenant définir votre mot de passe en cliquant sur le bouton ci-dessous :</p>
    <p><a href='{$resetUrl}' class='button'>Définir mon mot de passe</a></p>
    <p>Ce lien ne peut être utilisé qu'une seule fois.</p>
    <p><strong>Nom d'utilisateur :</strong> {$user->email}</p>
    <p><strong>Mot de passe :</strong> celui que vous avez défini</p>
    <div class='footer'>
        — L'équipe " . config('app.name') . "
    </div>
</div>
";

    $email = (new Email())
        ->from('SARPI GMAT')
        ->to($user->email)
        ->subject('Un administrateur a créé un compte pour vous sur ' . config('app.name'))
        ->html($html);

    try {
        $mailer->send($email);
    } catch (\Exception $e) {
        \Log::error('Erreur SMTP : ' . $e->getMessage());
    }
    
    return Redirect::route('users')->with('success', 'User created.');
}

public function update(Request $request, User $user)
{
    $validated = $request->validate([
        'first_name' => 'required|string|max:255',
        'last_name'  => 'required|string|max:255',
        'email'      => 'required|email|unique:users,email,' . $user->id,
        'password'   => 'nullable|string|min:6|confirmed', // <-- Ajout de confirmed
        'role'       => 'required|array',
        'role.*'     => 'exists:roles,name',
    ]);

    $user->first_name = $validated['first_name'];
    $user->last_name  = $validated['last_name'];
    $user->email      = $validated['email'];

    if (!empty($validated['password'])) {
        $user->password = bcrypt($validated['password']);
    }

    $user->save();

    $user->syncRoles($validated['role']);

    return redirect()->route('users')->with('success', 'Utilisateur a été mis à jour avec succès');
}

public function edit(User $user): Response
{
    $roles = Role::all(['id', 'name']);
    $user->load('roles');

    return Inertia::render('Users/Edit', [
         'permissions' => auth()->user()->getAllPermissions()->pluck('name'),
        'user' => [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
          
            'deleted_at' => $user->deleted_at,
            'roles' => $user->roles->pluck('name'), // ✅ renvoie ["admin"] par ex.
        ],
        'roles' => $roles->map(fn($role) => [
            'value' => $role->name,
            'label' => ucfirst($role->name),
        ]),
    ]);
}



  public function destroy(User $user)
{
    $user->forceDelete(); // 👈 supprime définitivement
    return redirect()->route('users')->with('success', 'Utilisateur supprimé définitivement.');
}

}
