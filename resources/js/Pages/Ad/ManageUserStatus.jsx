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
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import Layout from "@/Layouts/layout/layout.jsx";
import { Head } from '@inertiajs/react';
import 'primereact/resources/themes/lara-light-indigo/theme.css';  // Thème
import 'primereact/resources/primereact.min.css';                   // Core CSS
import 'primeicons/primeicons.css';                                 // Icônes
import 'primeflex/primeflex.css';  
export default function ManageUserStatus() {
   
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    sam: null,
    action: null,
    userName: null,
  });
  const [successDialog, setSuccessDialog] = useState({
    visible: false,
    action: null,
    userName: null,
    sam: null,
  });

  // 🔹 Recherche d'un utilisateur
// 🔹 Recherche d'un utilisateur
const handleSearch = async () => {
  if (!search.trim()) {
    setError("Veuillez saisir un nom d'utilisateur ou SamAccountName");
    return;
  }
  setLoading(true);
  setError(null);
  
  try {
    const response = await axios.post("/ad/users/find", { search });
    if (response.data.success && Array.isArray(response.data.users)) {
      const mappedUsers = response.data.users.map((user) => ({
        name: user.name || user.sam,
        sam: user.sam,
        email: user.email,
        enabled: user.enabled,
        lastLogon: user.last_logon,
        dn: user.dn,  // 🆕 AJOUTER
      }));
      setUsers(mappedUsers);
      setError(null);
    } else {
      setUsers([]);
      setError("Aucun utilisateur trouvé pour cette recherche.");
    }
  } catch (err) {
    console.error("Erreur lors de la recherche :", err);
    setError("Erreur lors de la recherche de l'utilisateur. Veuillez réessayer.");
    setUsers([]);
  } finally {
    setLoading(false);
  }
};

  // 🔹 Ouverture du dialog de confirmation
const handleToggleClick = (user, action) => {
    setConfirmDialog({
      visible: true,
      sam: user.sam,
      action,
      userName: user.name,
      userEmail: user.email,  // 🆕
      userDn: user.dn,        // 🆕
    });
};

  // 🔹 Confirmer blocage/déblocage
// 🔹 Confirmer blocage/déblocage
const confirmToggle = () => {
  setIsToggling(true);
  
  router.post(
    "/ad/users/toggle",
    { 
      sam: confirmDialog.sam, 
      action: confirmDialog.action, 
      user_name: confirmDialog.userName,
      user_email: confirmDialog.userEmail,  // 🆕 AJOUTER
      user_dn: confirmDialog.userDn,        // 🆕 AJOUTER
    },
    {
      onSuccess: () => {
        setSuccessDialog({
          visible: true,
          action: confirmDialog.action,
          userName: confirmDialog.userName,
          sam: confirmDialog.sam,
        });
        setConfirmDialog({ visible: false, sam: null, action: null, userName: null });
        setIsToggling(false);
        handleSearch();
      },
      onError: () => {
        setError("Erreur lors du changement de statut");
        setConfirmDialog({ visible: false, sam: null, action: null, userName: null });
        setIsToggling(false);
      },
    }
  );
};

  // 🔹 Templates pour la table
  const nameTemplate = (rowData) => {
    const initial = rowData.name ? rowData.name.charAt(0).toUpperCase() : "U";
    return (
      <div className="flex align-items-center gap-3">
        
        <div>
          <div className="font-semibold text-900 text-lg">{rowData.name}</div>
          <div className="text-sm text-600 flex align-items-center gap-1">
            {rowData.sam}
          </div>
        </div>
      </div>
    );
  };

  const emailTemplate = (rowData) => (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-envelope text-primary"></i>
      <span className="text-900">{rowData.email || "—"}</span>
    </div>
  );

  const statusTemplate = (row) => (
    <div className="flex align-items-center gap-3">
      {row.enabled ? (
        <>
          <Tag 
            severity="success" 
            value="Actif" 
            icon="pi pi-check-circle"
            style={{ fontSize: "0.95rem", padding: "0.5rem 1rem" }}
          />
          <Button
            icon="pi pi-lock"
            label="Bloquer"
            severity="danger"
            outlined
            size="small"
            onClick={() => handleToggleClick(row, "block")}
            className="custom-action-btn"
          />
        </>
      ) : (
        <>
          <Tag 
            severity="danger" 
            value="Bloqué" 
            icon="pi pi-ban"
            style={{ fontSize: "0.95rem", padding: "0.5rem 1rem" }}
          />
          <Button
            icon="pi pi-unlock"
            label="Débloquer"
            severity="success"
            outlined
            size="small"
            onClick={() => handleToggleClick(row, "unblock")}
            className="custom-action-btn"
          />
        </>
      )}
    </div>
  );

  return (
    <Layout>
      <Head title="Gestion Blocage / Déblocage" />
      <div className="grid">
        <div className="col-12">
          <Card className="shadow-3 border-round-xl">
            <DataTable
              value={users}
              stripedRows
              responsiveLayout="scroll"
              className="custom-datatable"
              header={
                <div className="flex flex-column gap-4">
                  <div className="flex align-items-center gap-3">
                    <div
                      
                    >
                    </div>
                    <div>
                      <h1 className="text-900 text-3xl font-bold m-0 mb-1">
                        Gestion Blocage / Déblocage
                      </h1>
                      <p className="text-600 m-0 text-lg">
                        Recherchez un utilisateur Active Directory et gérez son accès
                      </p>
                    </div>
                  </div>

                  <div className="p-inputgroup" style={{ height: "52px" }}>
                   
                    <InputText
                      placeholder="Rechercher un utilisateur dans AD (nom, samaccountname , email)..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      style={{ height: "52px", fontSize: "1.05rem" }}
                    />
                    <Button
                      label={loading ? "Recherche..." : "Rechercher"}
                      icon={loading ? "pi pi-spin pi-spinner" : "pi pi-search"}
                      onClick={handleSearch}
                      disabled={loading}
                      style={{ 
                        background: "linear-gradient(135deg, #6366f1, #4f46e5)", 
                        border: "none",
                        height: "52px",
                        minWidth: "150px",
                        fontWeight: "600"
                      }}
                    />
                  </div>

                  {error && (
                    <Message 
                      severity="error" 
                      text={error}
                      style={{ width: "100%" }}
                      className="custom-error-message"
                    />
                  )}
                </div>
              }
              emptyMessage={
                <div className="text-center py-8">
                  <div className="mb-4">
                    <i className="pi pi-users text-400" style={{ fontSize: "4rem" }}></i>
                  </div>
                  <h3 className="text-900 text-2xl font-semibold mb-2">Aucun utilisateur affiché</h3>
                  <p className="text-600 text-lg">Utilisez la barre de recherche pour trouver un utilisateur</p>
                </div>
              }
            >
              <Column field="name" header="Utilisateur" body={nameTemplate} style={{ minWidth: "280px" }} />
              <Column field="email" header="Email" body={emailTemplate} style={{ minWidth: "250px" }} />
              <Column header="Statut & Action" body={statusTemplate} style={{ minWidth: "280px" }} />
            </DataTable>
          </Card>
        </div>
      </div>

      {/* Dialog de confirmation */}
      <Dialog
        visible={confirmDialog.visible}
        onHide={() => setConfirmDialog({ visible: false, sam: null, action: null, userName: null })}
        modal
        dismissableMask
        style={{ width: "500px" }}
        className="custom-dialog"
      >
        <div className="p-4">
          {/* Header personnalisé */}
          <div className="text-center mb-4">
            <div
              className="inline-flex align-items-center justify-content-center border-circle mb-3"
              style={{
                width: "70px",
                height: "70px",
                background: confirmDialog.action === "block" 
                  ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                  : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow: confirmDialog.action === "block"
                  ? "0 8px 20px rgba(239, 68, 68, 0.3)"
                  : "0 8px 20px rgba(16, 185, 129, 0.3)",
              }}
            >
              <i 
                className={`pi ${confirmDialog.action === "block" ? "pi-lock" : "pi-unlock"} text-white`}
                style={{ fontSize: "2rem" }}
              />
            </div>
            <h2 className="text-900 font-bold text-2xl mb-2">
              {confirmDialog.action === "block" ? "Bloquer" : "Débloquer"} l'utilisateur
            </h2>
            <p className="text-600 text-lg">
              Confirmez cette action pour cet utilisateur
            </p>
          </div>

          {/* Infos utilisateur */}
          <div className={`p-3 border-round-lg mb-4 border-1 ${
            confirmDialog.action === "block" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
          }`}>
            <div className="flex align-items-center gap-2 mb-2">
              <i className={`pi pi-user ${confirmDialog.action === "block" ? "text-red-600" : "text-green-600"}`}></i>
              <span className="font-semibold text-900 text-lg">{confirmDialog.userName}</span>
            </div>
            <div className="flex align-items-center gap-2">
              <i className={`pi pi-id-card ${confirmDialog.action === "block" ? "text-red-600" : "text-green-600"}`}></i>
              <span className="text-600">{confirmDialog.sam}</span>
            </div>
          </div>

          {/* Message d'avertissement */}
          <div className={`p-3 border-round-lg mb-4 ${
            confirmDialog.action === "block" ? "bg-orange-50" : "bg-blue-50"
          }`}>
            <div className="flex align-items-start gap-2">
              <i className={`pi pi-info-circle mt-1 ${
                confirmDialog.action === "block" ? "text-orange-600" : "text-blue-600"
              }`}></i>
              <div>
                <div className={`font-semibold mb-1 ${
                  confirmDialog.action === "block" ? "text-orange-900" : "text-blue-900"
                }`}>
                  {confirmDialog.action === "block" 
                    ? "Attention !" 
                    : "Information"}
                </div>
                <small className={confirmDialog.action === "block" ? "text-orange-700" : "text-blue-700"}>
                  {confirmDialog.action === "block"
                    ? "L'utilisateur ne pourra plus se connecter à son compte Active Directory."
                    : "L'utilisateur pourra de nouveau se connecter à son compte Active Directory."}
                </small>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 mt-4">
            <Button
              label="Annuler"
              outlined
              severity="secondary"
              onClick={() => setConfirmDialog({ visible: false, sam: null, action: null, userName: null })}
              className="flex-1"
              style={{ height: "50px" }}
              disabled={isToggling}
            />
            <Button
              label={isToggling ? "Confirmer..." : "Confirmer"}
              onClick={confirmToggle}
              severity={confirmDialog.action === "block" ? "danger" : "success"}
              className="flex-1"
              style={{ height: "50px" }}
              disabled={isToggling}
            />
          </div>
        </div>
      </Dialog>

      {/* Dialog de succès */}
      <Dialog
        visible={successDialog.visible}
        onHide={() => setSuccessDialog({ visible: false, action: null, userName: null, sam: null })}
        modal
        dismissableMask
        style={{ width: "550px" }}
        className="custom-dialog"
      >
        <div className="p-5">
          {/* Icône de succès */}
          <div className="text-center mb-4">
            <div
              className="inline-flex align-items-center justify-content-center border-circle mb-3"
              style={{
                width: "90px",
                height: "90px",
                background: successDialog.action === "block"
                  ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                  : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow: successDialog.action === "block"
                  ? "0 8px 25px rgba(239, 68, 68, 0.35)"
                  : "0 8px 25px rgba(16, 185, 129, 0.35)",
              }}
            >
              <i className="pi pi-check text-white" style={{ fontSize: "3rem" }}></i>
            </div>
            <h2 className="text-900 font-bold text-2xl mb-2">
              {successDialog.action === "block" ? "Utilisateur bloqué !" : "Utilisateur débloqué !"}
            </h2>
            <p className="text-600 text-lg">
              L'opération a été effectuée avec succès dans Active Directory
            </p>
          </div>

          <Divider />

          {/* Détails */}
          <div className="surface-100 border-round-lg p-4 mb-4">
            <div className="flex align-items-start gap-3 mb-3 pb-3 border-bottom-1 surface-border">
              <i className="pi pi-user text-primary text-xl mt-1"></i>
              <div className="flex-1">
                <div className="text-500 text-sm mb-1 font-medium">Nom complet</div>
                <div className="text-900 font-semibold text-lg">{successDialog.userName}</div>
              </div>
            </div>

            <div className="flex align-items-start gap-3 mb-3 pb-3 border-bottom-1 surface-border">
              <i className="pi pi-id-card text-primary text-xl mt-1"></i>
              <div className="flex-1">
                <div className="text-500 text-sm mb-1 font-medium">Nom d'utilisateur</div>
                <div className="text-900 font-semibold text-lg">{successDialog.sam}</div>
              </div>
            </div>

            <div className="flex align-items-start gap-3">
              <i className={`pi ${successDialog.action === "block" ? "pi-lock" : "pi-unlock"} text-xl mt-1`}
                 style={{ color: successDialog.action === "block" ? "#ef4444" : "#10b981" }}></i>
              <div className="flex-1">
                <div className="text-500 text-sm mb-1 font-medium">Nouveau statut</div>
                <Tag 
                  severity={successDialog.action === "block" ? "danger" : "success"}
                  value={successDialog.action === "block" ? "Compte bloqué" : "Compte actif"}
                  icon={`pi ${successDialog.action === "block" ? "pi-ban" : "pi-check-circle"}`}
                  style={{ fontSize: "1rem", padding: "0.6rem 1.2rem" }}
                />
              </div>
            </div>
          </div>

          {/* Message informatif */}
          <div className={`p-3 border-round-lg mb-4 ${
            successDialog.action === "block" ? "bg-red-50" : "bg-green-50"
          }`}>
            <div className="flex align-items-start gap-2">
              <i className={`pi ${successDialog.action === "block" ? "pi-info-circle" : "pi-check-circle"} mt-1`}
                 style={{ color: successDialog.action === "block" ? "#dc2626" : "#059669" }}></i>
              <small className="font-medium" style={{ color: successDialog.action === "block" ? "#991b1b" : "#065f46" }}>
                {successDialog.action === "block"
                  ? "L'utilisateur ne pourra plus se connecter jusqu'à ce que son compte soit débloqué."
                  : "L'utilisateur peut maintenant se connecter normalement à son compte."}
              </small>
            </div>
          </div>

          {/* Bouton OK */}
          <Button
            label="OK, j'ai compris"
            onClick={() => setSuccessDialog({ visible: false, action: null, userName: null, sam: null })}
            severity={successDialog.action === "block" ? "danger" : "success"}
            className="w-full"
            style={{ 
              height: "55px", 
              fontSize: "1.1rem",
              fontWeight: "600"
            }}
          />
        </div>
      </Dialog>

      <style jsx>{`
        .custom-datatable :global(.p-datatable-header) {
          background: var(--surface-50);
          border-radius: 12px 12px 0 0;
          padding: 1.5rem;
        }

        .custom-datatable :global(.p-datatable-thead > tr > th) {
          background: var(--primary-50);
          color: var(--primary-700);
          font-weight: 600;
          font-size: 1rem;
        }

        .custom-datatable :global(.p-datatable-tbody > tr) {
          transition: all 0.2s ease;
        }

        .custom-datatable :global(.p-datatable-tbody > tr:hover) {
          background: var(--surface-100);
          transform: scale(1.01);
        }

        :global(.custom-dialog .p-dialog-content) {
          padding: 0 !important;
          border-radius: 12px;
        }

        :global(.custom-dialog .p-dialog-header) {
          display: none;
        }

        :global(.custom-action-btn:hover) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
        }

        :global(.custom-error-message) {
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Layout>
  );
}