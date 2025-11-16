import React, { useState } from 'react';
import { router } from '@inertiajs/react'; // <-- ici
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import Layout from '@/Layouts/layout/layout.jsx';
export default function MailboxIndex({ mailboxes }) {
  const [showDialog, setShowDialog] = useState(false);
  const [currentMailbox, setCurrentMailbox] = useState({ name: '', active: false, id: null });

  const openDialog = (mailbox = null) => {
    if (mailbox) {
      setCurrentMailbox({ ...mailbox });
    } else {
      setCurrentMailbox({ name: '', active: false, id: null });
    }
    setShowDialog(true);
  };
const handleDeactivate = (id) => {
  router.put(`/mailboxes/${id}`, { active: false }, { preserveState: true });
};

  const closeDialog = () => setShowDialog(false);

  const handleSave = () => {
    if (currentMailbox.id) {
      router.put(`/mailboxes/${currentMailbox.id}`, currentMailbox, { preserveState: true });
    } else {
      router.post('/mailboxes', currentMailbox, { preserveState: true });
    }
    closeDialog();
  };

  const handleDelete = (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette mailbox ?')) return;
    router.delete(`/mailboxes/${id}`, { preserveState: true });
  };

  const handleActivate = (id) => {
    router.put(`/mailboxes/${id}`, { active: true }, { preserveState: true });
  };

  return (
         <Layout>
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Gestion des Mailboxes</h2>
      <Button label="Nouvelle Mailbox" icon="pi pi-plus" onClick={() => openDialog()} className="mb-3" />

      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 border">Nom</th>
            <th className="px-4 py-2 border">Active</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mailboxes.map((mailbox) => (
            <tr key={mailbox.id} className="border-t">
              <td className="px-4 py-2 border">{mailbox.name}</td>
              <td className="px-4 py-2 border">{mailbox.active ? 'Oui' : 'Non'}</td>
              <td className="px-4 py-2 border">
                <Button icon="pi pi-pencil" className="p-button-text p-mr-2" onClick={() => openDialog(mailbox)} />
                <Button icon="pi pi-trash" className="p-button-text p-button-danger p-mr-2" onClick={() => handleDelete(mailbox.id)} />
                {mailbox.active ? (
    <Button
      icon="pi pi-ban"
      className="p-button-text p-button-warning"
      onClick={() => handleDeactivate(mailbox.id)}
    />
  ) : (
    <Button
      icon="pi pi-check"
      className="p-button-text p-button-success"
      onClick={() => handleActivate(mailbox.id)}
    />
  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog header={currentMailbox.id ? "Modifier Mailbox" : "Nouvelle Mailbox"} visible={showDialog} onHide={closeDialog} style={{ width: '400px' }}>
        <div className="p-field mb-3">
          <label>Nom</label>
          <InputText value={currentMailbox.name} onChange={(e) => setCurrentMailbox({ ...currentMailbox, name: e.target.value })} className="w-full" />
        </div>
        <div className="p-field-checkbox mb-3">
          <input type="checkbox" checked={currentMailbox.active} onChange={(e) => setCurrentMailbox({ ...currentMailbox, active: e.target.checked })} />
          <label className="ml-2">Active</label>
        </div>
        <Button label="Sauvegarder" icon="pi pi-check" onClick={handleSave} className="mt-2" />
      </Dialog>
    </div>
    </Layout>
  );
}
