import React, { useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import Layout from "@/Layouts/layout/layout.jsx";

export default function ManageUserStatus() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]); // Tableau pour la DataTable
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    sam: null,
    action: null,
    userName: null,
  });

  // 🔹 Formatage de la date AD
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

  // 🔹 Recherche d’un utilisateur
  const handleSearch = async () => {
    if (!search.trim()) {
      alert("Veuillez saisir un SamAccountName");
      return;
    }

    try {
      const response = await axios.post("/ad/users/find", { search });
     
if (response.data.success && Array.isArray(response.data.users)) {
  const mappedUsers = response.data.users.map(user => ({
    name: user.name,
    sam: user.sam,
    email: user.email,
    enabled: user.enabled,
    lastLogon: user.last_logon, // déjà formaté par le backend
  }));
  setUsers(mappedUsers);
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
  const handleToggleClick = (user, action) => {
    setConfirmDialog({
      visible: true,
      sam: user.sam,
      action,
      userName: user.name,
    });
  };

  // 🔹 Confirmation du blocage/déblocage
  const confirmToggle = () => {
    router.post(
      "/ad/users/toggle",
      {
        sam: confirmDialog.sam,
        action: confirmDialog.action,
      },
      {
        onSuccess: () => {
          setConfirmDialog({
            visible: false,
            sam: null,
            action: null,
            userName: null,
          });
          handleSearch(); // rafraîchir les données
        },
        onError: () => {
          alert("Erreur lors du changement de statut");
        },
      }
    );
  };

  // 🔹 Templates pour le tableau
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

  const statusTemplate = (rowData) => (
    <div className="flex align-items-center gap-3">
      {rowData.enabled ? (
        <>
          <Tag severity="success" value="Actif" icon="pi pi-check-circle" />
          <Button
            icon="pi pi-lock"
            label="Bloquer"
            severity="danger"
            text
            size="small"
            onClick={() => handleToggleClick(rowData, "block")}
          />
        </>
      ) : (
        <>
          <Tag severity="danger" value="Bloqué" icon="pi pi-ban" />
          <Button
            icon="pi pi-unlock"
            label="Débloquer"
            severity="success"
            text
            size="small"
            onClick={() => handleToggleClick(rowData, "unblock")}
          />
        </>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="grid">
        <div className="col-12">
          <Card className="shadow-2">
            <div className="flex flex-column gap-3 p-4">
              <div className="flex align-items-center gap-3 mb-2">
                <i className="pi pi-lock text-3xl text-indigo-600"></i>
                <div>
                  <h1 className="text-900 text-2xl font-bold m-0">
                    Blocage / Déblocage AD
                  </h1>
                  <p className="text-600 m-0">
                    Rechercher un utilisateur par son SAMAccountName
                  </p>
                </div>
              </div>

              {/* Champ de recherche */}
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-search"></i>
                </span>
                <InputText
                  placeholder="Rechercher un utilisateur dans LDAP (nom, samaccountname, email)..."
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

              {/* Tableau utilisateur */}
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
                  style={{ minWidth: "200px" }}
                />
                <Column
                  field="enabled"
                  header="Statut"
                  body={statusTemplate}
                  style={{ minWidth: "180px" }}
                />
              </DataTable>
            </div>
          </Card>
        </div>
      </div>

      {/* Pop-up de confirmation */}
      <Dialog
        visible={confirmDialog.visible}
        onHide={() =>
          setConfirmDialog({
            visible: false,
            sam: null,
            action: null,
            userName: null,
          })
        }
        header={
          <div className="flex align-items-center gap-3">
            <div
              className="inline-flex align-items-center justify-content-center border-circle"
              style={{
                width: "48px",
                height: "48px",
                background:
                  confirmDialog.action === "block" ? "#fef2f2" : "#f0fdf4",
              }}
            >
              <i
                className={`pi ${
                  confirmDialog.action === "block" ? "pi-lock" : "pi-unlock"
                } text-2xl`}
                style={{
                  color:
                    confirmDialog.action === "block" ? "#dc2626" : "#16a34a",
                }}
              ></i>
            </div>
            <span className="text-xl font-bold">
              {confirmDialog.action === "block"
                ? "Bloquer"
                : "Débloquer"}{" "}
              l'utilisateur
            </span>
          </div>
        }
        style={{ width: "450px" }}
        modal
      >
        <div className="py-3">
          <p className="text-700 text-lg mb-3">
            Êtes-vous sûr de vouloir{" "}
            <strong
              className={
                confirmDialog.action === "block"
                  ? "text-red-600"
                  : "text-green-600"
              }
            >
              {confirmDialog.action === "block" ? "bloquer" : "débloquer"}
            </strong>{" "}
            cet utilisateur ?
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
              setConfirmDialog({
                visible: false,
                sam: null,
                action: null,
                userName: null,
              })
            }
          />
          <Button
            label="Confirmer"
            icon="pi pi-check"
            onClick={confirmToggle}
            severity={
              confirmDialog.action === "block" ? "danger" : "success"
            }
          />
        </div>
      </Dialog>
    </Layout>
  );
}
