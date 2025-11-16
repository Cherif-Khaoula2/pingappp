<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Mailbox;
use Inertia\Inertia;

class MailboxController extends Controller
{
    // Lister toutes les mailboxes
   public function index()
{
    $mailboxes = Mailbox::all();

    // Passer les mailboxes à la vue Inertia
    return Inertia::render('Mailbox/Index', [
        'mailboxes' => $mailboxes
    ]);
}
public function store(Request $request)
{
    $request->validate([
        'name' => 'required|string|unique:mailboxes,name',
        'active' => 'sometimes|boolean'
    ]);

    if ($request->active) {
        Mailbox::query()->update(['active' => false]);
    }

    $mailbox = Mailbox::create($request->only('name', 'active'));

   
}

public function update(Request $request, $id)
{
    $mailbox = Mailbox::findOrFail($id);

    $request->validate([
        'name' => 'sometimes|string|unique:mailboxes,name,' . $id,
        'active' => 'sometimes|boolean'
    ]);

    if ($request->has('active') && $request->active) {
        Mailbox::query()->where('id', '!=', $id)->update(['active' => false]);
    }

    $mailbox->update($request->only('name', 'active'));

}

public function destroy($id)
{
    $mailbox = Mailbox::findOrFail($id);
    $mailbox->delete();

}

public function active()
{
    $mailbox = Mailbox::where('active', true)->first();

}

}
