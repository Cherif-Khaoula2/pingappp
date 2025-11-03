import React, { useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Password } from "primereact/password";
import Layout from "@/Layouts/layout/layout.jsx";

export default function ResetUserPassword() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    sam: null,
    userName: null,
  });

  // 🔹 Format date AD
  const formatAdDate = (value) => {
    if (!value) return "—";
    const match = /\/Date\((\d+)\)\//.exec(value);
    if (match) {
      const date = new Date(parseInt(match[1], 10));
      return date.toLocaleString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return value;
  };

  // 🔹 Recherche d’utilisateur
  const handleSearch = async () => {
    if (!search.trim()) {
      alert("Veuillez saisir un SamAccountName");
      return;
    }

    try {
      const response = await axios.post("/ad/users/find", { search });

      if (response.data.success && response.data.users) {
        setUsers([
          {
            name: response.data.users.Name,
            sam: response.data.users.SamAccountName,
            email: response.data.users.EmailAddress,
            lastLogon: formatAdDate(response.data.users.LastLogonDate),
          },
        ]);
        setError(null);
      } else {
        setUsers([]);
        setError("Aucun utilisateur trouvé.");
      }
    } catch (error) {
      console.error("Erreur lors de la recherche :", error);
      setError("Erreur lors de la recherche de l'utilisateur.");
    }
  };

  // 🔹 Ouverture du popup de confirmation
  const handleResetClick = (user) => {
    if (!newPassword.trim()) {
      alert("Veuillez saisir un nouveau mot de passe.");
      return;
    }

    setConfirmDialog({
      visible: true,
      sam: user.sam,
      userName: user.name,
    });
  };

  // 🔹 Confirmation
  const confirmReset = () => {
    router.post(
      "/ad/users/reset-password",
      {
        sam: confirmDialog.sam,
        new_password: newPassword,
      },
      {
        onSuccess: () => {
          setConfirmDialog({ visible: false, sam: null, userName: null });
          setNewPassword("");
          alert("Mot de passe réinitialisé avec succès !");
        },
        onError: () => {
          alert("Erreur lors de la réinitialisation du mot de passe.");
        },
      }
    );
  };

  // 🔹 Templates du tableau
  const nameTemplate = (rowData) => (
    <div className="flex align-items-center gap-3">
      <div
        className="inline-flex align-items-center justify-content-center border-circle text-white font-bold"
        style={{
          width: "40px",
          height: "40px",
          background: "linear-gradient(135deg, #6366f1, #a855f7)",
        }}
      >
        {rowData.name?.charAt(0).toUpperCase() || "U"}
      </div>
      <div>
        <div className="font-medium text-900">{rowData.name}</div>
        <div className="text-sm text-600">{rowData.sam}</div>
      </div>
    </div>
  );

  const passwordInputTemplate = () => (
    <Password
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      toggleMask
      feedback={false}
      placeholder="Saisir un nouveau mot de passe..."
      className="w-full"
    />
  );

  const actionTemplate = (rowData) => (
    <Button
      icon="pi pi-refresh"
      label="Réinitialiser"
      severity="info"
      text
      size="small"
      onClick={() => handleResetClick(rowData)}
      disabled={!newPassword}
    />
  );

  return (
    <Layout>
      <div className="grid">
        <div className="col-12">
          <Card className="shadow-2">
            <div className="flex flex-column gap-3 p-4">
              <div className="flex align-items-center gap-3 mb-2">
                <i className="pi pi-key text-3xl text-indigo-600"></i>
                <div>
                  <h1 className="text-900 text-2xl font-bold m-0">
                    Réinitialisation du mot de passe AD
                  </h1>
                  <p className="text-600 m-0">
                    Recherchez un utilisateur et saisissez un nouveau mot de
                    passe.
                  </p>
                </div>
              </div>

              {/* 🔹 Barre de recherche */}
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-search"></i>
                </span>
                <InputText
                  placeholder="Saisir le SAMAccountName..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button
                  label="Rechercher"
                  icon="pi pi-search"
                  onClick={handleSearch}
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                    border: "none",
                  }}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border-round flex align-items-center gap-2">
                  <i className="pi pi-exclamation-triangle text-red-600"></i>
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              {/* 🔹 Tableau utilisateur */}
              <DataTable
                value={users}
                emptyMessage="Aucun utilisateur affiché."
                stripedRows
                responsiveLayout="scroll"
              >
                <Column
                  field="name"
                  header="Utilisateur"
                  body={nameTemplate}
                  style={{ minWidth: "250px" }}
                />
                <Column
                  field="email"
                  header="Email"
                  style={{ minWidth: "220px" }}
                />
                <Column
                  header="Nouveau mot de passe"
                  body={passwordInputTemplate}
                  style={{ minWidth: "250px" }}
                />
                <Column
                  header="Action"
                  body={actionTemplate}
                  style={{ minWidth: "180px" }}
                />
              </DataTable>
            </div>
          </Card>
        </div>
      </div>

      {/* 🔹 Popup confirmation */}
      <Dialog
        visible={confirmDialog.visible}
        onHide={() =>
          setConfirmDialog({ visible: false, sam: null, userName: null })
        }
        header={
          <div className="flex align-items-center gap-3">
            <div
              className="inline-flex align-items-center justify-content-center border-circle"
              style={{
                width: "48px",
                height: "48px",
                background: "#eef2ff",
              }}
            >
              <i className="pi pi-key text-indigo-600 text-2xl"></i>
            </div>
            <span className="text-xl font-bold">
              Confirmer la réinitialisation
            </span>
          </div>
        }
        style={{ width: "450px" }}
        modal
      >
        <div className="py-3">
          <p className="text-700 text-lg mb-3">
            Êtes-vous sûr de vouloir{" "}
            <strong className="text-indigo-600">réinitialiser</strong> le mot de
            passe de :
          </p>

          <div className="p-3 bg-gray-50 border-round">
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-user text-600"></i>
              <span className="font-semibold text-900">
                {confirmDialog.userName}
              </span>
            </div>
            <div className="flex align-items-center gap-2">
              <i className="pi pi-id-card text-600"></i>
              <span className="text-600 text-sm">{confirmDialog.sam}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-content-end gap-2 mt-4">
          <Button
            label="Annuler"
            icon="pi pi-times"
            outlined
            onClick={() =>
              setConfirmDialog({ visible: false, sam: null, userName: null })
            }
          />
          <Button
            label="Confirmer"
            icon="pi pi-check"
            onClick={confirmReset}
            severity="info"
          />
        </div>
      </Dialog>
    </Layout>
  );
}
