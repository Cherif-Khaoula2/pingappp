import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import Layout from "@/Layouts/layout/layout.jsx";

export default function ManageUserStatus() {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, action: null });
  const [resetDialog, setResetDialog] = useState({ visible: false });
  const [newPassword, setNewPassword] = useState("");

  const handleSearch = async () => {
    if (!search.trim()) return alert("Saisir un SAMAccountName !");
    setLoading(true);
    try {
      const response = await axios.post("/ad/users/find", { sam: search });
      if (response.data.success && response.data.users) {
        setUser(response.data.users);
      } else {
        alert("Utilisateur introuvable.");
      }
    } catch (err) {
      alert("Erreur lors de la recherche de l'utilisateur.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (action) => {
    setConfirmDialog({ visible: false });
    try {
      const res = await axios.post("/ad/users/toggle", { sam: user.SamAccountName, action });
      if (res.data.success) {
        setUser((prev) => ({ ...prev, Enabled: action === "unblock" }));
        alert(res.data.message);
      }
    } catch {
      alert("Erreur lors du changement de statut.");
    }
  };

  const confirmResetPassword = async () => {
    if (!newPassword.trim()) return alert("Saisir un nouveau mot de passe !");
    try {
      const res = await axios.post("/ad/users/reset-password", {
        sam: user.SamAccountName,
        new_password: newPassword,
      });
      if (res.data.success) {
        alert("Mot de passe réinitialisé avec succès !");
        setResetDialog({ visible: false });
        setNewPassword("");
      }
    } catch {
      alert("Erreur lors de la réinitialisation du mot de passe.");
    }
  };

  const tableHeader = (
    <div className="flex align-items-center gap-3">
      <InputText
        placeholder="Saisir le SAMAccountName"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        style={{ width: "300px" }}
      />
      <Button
        label="Rechercher"
        icon="pi pi-search"
        onClick={handleSearch}
        loading={loading}
      />
    </div>
  );

  return (
    <Layout>
      <Card title="Gestion des comptes AD">
        <DataTable
          value={user ? [user] : []}
          header={tableHeader}
          emptyMessage="Aucun utilisateur trouvé"
        >
          <Column field="Name" header="Nom" />
          <Column field="SamAccountName" header="SAMAccount" />
          <Column field="EmailAddress" header="Email" />
         
          <Column
            header="Actions"
            body={() => (
              <div className="flex gap-2">
                
                <Button
                  icon="pi pi-refresh"
                  label="Réinitialiser"
                  severity="info"
                  onClick={() => setResetDialog({ visible: true })}
                />
              </div>
            )}
          />
        </DataTable>
      </Card>

     

      {/* Popup réinitialisation */}
      <Dialog
        visible={resetDialog.visible}
        onHide={() => setResetDialog({ visible: false })}
        header="Réinitialiser le mot de passe"
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Annuler" outlined onClick={() => setResetDialog({ visible: false })} />
            <Button label="Confirmer" onClick={confirmResetPassword} />
          </div>
        }
      >
        <InputText
          type="password"
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </Dialog>
    </Layout>
  );
}
