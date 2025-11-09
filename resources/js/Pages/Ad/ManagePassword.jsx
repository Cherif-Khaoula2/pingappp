import React, { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import Layout from "@/Layouts/layout/layout.jsx";
import { router } from "@inertiajs/react";
import { Head } from '@inertiajs/react';
import 'primereact/resources/themes/lara-light-indigo/theme.css';  // Thème
import 'primereact/resources/primereact.min.css';                   // Core CSS
import 'primeicons/primeicons.css';                                 // Icônes
import 'primeflex/primeflex.css';  
// Fonction pour générer un mot de passe automatique
const generatePassword = () => {
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4 chiffres
  return `S@rpi${randomNumber}`;
};

export default function ResetUserPassword() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordMode, setPasswordMode] = useState("auto");
  const [resetDialog, setResetDialog] = useState({ visible: false, sam: null, userName: null });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [resetSuccessDetails, setResetSuccessDetails] = useState(null);
  const [showManualPassword, setShowManualPassword] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(25);
  
  const onPageChange = (event) => {
  setFirst(event.first);
  setRows(event.rows);
};
  // 🔹 Changement du mode de mot de passe
  const handlePasswordModeChange = (mode) => {
    setPasswordMode(mode);
    setResetError(null); // Réinitialiser l'erreur
    if (mode === "auto") {
      const pwd = generatePassword();
      setNewPassword(pwd);
    } else {
      setNewPassword("");
      setShowManualPassword(false);
    }
  };

// 🔹 Recherche d'un utilisateur

const handleSearch = async () => {
  // ✅ Autoriser "." ou vide (on laisse le backend gérer)
  if (!search.trim() && search.trim() !== ".") {
    setError("Veuillez saisir un nom d'utilisateur ou SamAccountName");
    return;
  }

  setLoading(true);
  setError(null);
  setFirst(0);

  try {
    const response = await axios.post("/ad/users/find", { search });

    // ✅ Afficher les utilisateurs même si success = false
    if (Array.isArray(response.data.users) && response.data.users.length > 0) {
      const mappedUsers = response.data.users.map((user) => ({
        name: user.name || user.sam,
        sam: user.sam,
        email: user.email,
        enabled: user.enabled,
        lastLogon: user.last_logon,
        dn: user.dn,
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


// 🔹 Ouvrir le dialog de réinitialisation
const handleResetClick = (user) => {
  setResetDialog({ 
    visible: true, 
    sam: user.sam, 
    userName: user.name,
    userEmail: user.email,  // 🆕 AJOUTER
    userDn: user.dn,        // 🆕 AJOUTER
  });
  setResetError(null);
  if (passwordMode === "auto") {
    setNewPassword(generatePassword());
  } else {
    setNewPassword("");
    setShowManualPassword(false);
  }
};


// 🔹 Confirmer la réinitialisation
const confirmResetPassword = () => {
  if (!newPassword.trim()) {
    setResetError("Veuillez saisir un mot de passe.");
    return;
  }

  setIsResetting(true);
  setResetError(null);

  router.post(
    "/ad/users/reset-password",
    { 
      sam: resetDialog.sam, 
      new_password: newPassword, 
    },
    {
      onSuccess: () => {
        setResetSuccessDetails({
          name: resetDialog.userName,
          sam: resetDialog.sam,
          password: passwordMode === "auto" ? newPassword : null,
        });
        setShowSuccessDialog(true);
        setResetDialog({ visible: false, sam: null, userName: null });
        setNewPassword("");
        setIsResetting(false);
      },
      onError: (errors) => {
        const errorMsg =
          errors?.message ||
          "Erreur lors de la réinitialisation du mot de passe. Le mot de passe doit contenir au moins 8 caractères avec une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&).";
        setResetError(errorMsg);
        setIsResetting(false);
      },
    }
  );
};

  // 🔹 Copier le mot de passe dans le presse-papiers
  const copyPasswordToClipboard = () => {
    if (resetSuccessDetails?.password) {
      navigator.clipboard.writeText(resetSuccessDetails.password);
      // Optionnel: ajouter un toast de confirmation
    }
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

  const actionTemplate = (rowData) => (
    <Button
      icon="pi pi-refresh"
      label="Réinitialiser"
      severity="warning"
      size="small"
      outlined
      onClick={() => handleResetClick(rowData)}
      className="custom-reset-btn"
    />
  );

  return (
    <Layout>
    <Head title="Réinitialisation des mots de passe" />

      <div className="grid">
        <div className="col-12">
          <Card className="shadow-3 border-round-xl">
            <DataTable
              value={users}
              stripedRows
              paginator
              rows={rows}
              first={first}
              onPage={onPageChange}
              rowsPerPageOptions={[25, 50, 100 , 200]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} utilisateurs"
              paginatorClassName="custom-paginator"
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
                        Réinitialisation des mots de passe
                      </h1>
                      <p className="text-600 m-0 text-lg">
                        Recherchez un utilisateur Active Directory et réinitialisez son mot de passe
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
              <Column header="Action" body={actionTemplate} style={{ minWidth: "200px" }} />
            </DataTable>
          </Card>
        </div>
      </div>

      {/* Dialog de réinitialisation */}
      <Dialog
        visible={resetDialog.visible}
        onHide={() => {
          setResetDialog({ visible: false, sam: null, userName: null });
          setResetError(null);
        }}
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
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                boxShadow: "0 8px 20px rgba(245, 158, 11, 0.3)",
              }}
            >
              <i className="pi pi-key text-white" style={{ fontSize: "2rem" }}></i>
            </div>
            <h2 className="text-900 font-bold text-2xl mb-2">Réinitialiser le mot de passe</h2>
            <p className="text-600 text-lg">Définissez un nouveau mot de passe pour cet utilisateur</p>
          </div>

          {/* Infos utilisateur */}
          <div className="p-3 bg-blue-50 border-round-lg mb-4 border-1 border-blue-200">
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-user text-blue-600"></i>
              <span className="font-semibold text-900 text-lg">{resetDialog.userName}</span>
            </div>
            <div className="flex align-items-center gap-2">
              <i className="pi pi-id-card text-blue-600"></i>
              <span className="text-600">{resetDialog.sam}</span>
            </div>
          </div>

          {/* Choix du mode */}
          <div className="mb-4">
            <label className="block text-900 font-semibold mb-3 text-lg">Mode de génération</label>
            <div className="grid">
              <div className="col-6">
                <div
                  onClick={() => handlePasswordModeChange("auto")}
                  className={`p-3 border-2 border-round-lg cursor-pointer text-center transition-all ${
                    passwordMode === "auto"
                      ? "border-green-500 bg-green-50 shadow-4"
                      : "border-300 hover:border-400 hover:bg-gray-50 hover:shadow-2"
                  }`}
                  style={{ height: "100%" }}
                >
                  <i className="pi pi-sparkles text-green-600 text-2xl mb-2"></i>
                  <div className="font-semibold text-900">Automatique</div>
                  <small className="text-600">Généré par le système</small>
                </div>
              </div>
              <div className="col-6">
                <div
                  onClick={() => handlePasswordModeChange("manual")}
                  className={`p-3 border-2 border-round-lg cursor-pointer text-center transition-all ${
                    passwordMode === "manual"
                      ? "border-orange-500 bg-orange-50 shadow-4"
                      : "border-300 hover:border-400 hover:bg-gray-50 hover:shadow-2"
                  }`}
                  style={{ height: "100%" }}
                >
                  <i className="pi pi-pencil text-orange-600 text-2xl mb-2"></i>
                  <div className="font-semibold text-900">Manuel</div>
                  <small className="text-600">Saisi manuellement</small>
                </div>
              </div>
            </div>
          </div>

          {/* Input mot de passe */}
          <div className="mb-4">
            <label className="block text-900 font-semibold mb-2 text-lg">
              {passwordMode === "auto" ? "Mot de passe généré" : "Nouveau mot de passe"}
            </label>

            {passwordMode === "auto" ? (
              <div className="p-inputgroup">
                <InputText
                  type="text"
                  value={newPassword}
                  disabled
                  style={{
                    height: "50px",
                    backgroundColor: "#f0fdf4",
                    fontSize: "1.1rem",
                  }}
                  className="font-bold text-green-700"
                />
                <Button
                  icon="pi pi-refresh"
                  className="p-button-success"
                  onClick={() => setNewPassword(generatePassword())}
                  tooltip="Régénérer"
                  style={{ height: "50px" }}
                />
              </div>
            ) : (
              <div>
              <div className="p-inputgroup">
  <InputText
    type={showManualPassword ? "text" : "password"}
    placeholder="Saisissez le mot de passe..."
    value={newPassword}
    onChange={(e) => {
      const rawValue = e.target.value;

      // ✅ Supprime les caractères non autorisés
      const filteredValue = rawValue.replace(/[^A-Za-z0-9@$!%*?&]/g, "");

      setNewPassword(filteredValue);

      // ✅ Vérification : min 8 + maj + min + chiffre + spécial
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!passwordRegex.test(filteredValue)) {
        setError(
          "⚠️ 8 caractères min + Maj + Min + Chiffre + Spécial parmi @$!%*?&"
        );
      } else {
        setError("");
      }
    }}
    style={{ height: "50px", fontSize: "1.05rem" }}
  />

  <Button
    icon={showManualPassword ? "pi pi-eye-slash" : "pi pi-eye"}
    className="p-button-secondary"
    onClick={() => setShowManualPassword((s) => !s)}
    tooltip={showManualPassword ? "Masquer" : "Afficher"}
    style={{ height: "50px" }}
  />
</div>

{/* 🔔 Message d'erreur */}
{error && <small className="p-error">{error}</small>}
</div>
            )}

            <small className="text-600 block mt-2">
              <i className="pi pi-info-circle mr-1"></i>
              Minimum 8 caractères avec majuscule, minuscule, chiffre et caractère spécial
            </small>
          </div>

          {resetError && (
            <Message
              severity="error"
              text={resetError}
              style={{ width: "100%" }}
              className="mb-3"
            />
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 mt-4">
            <Button
              label="Annuler"
              outlined
              severity="secondary"
              onClick={() => {
                setResetDialog({ visible: false, sam: null, userName: null });
                setResetError(null);
              }}
              className="flex-1"
              style={{ height: "50px" }}
            />
            <Button
              label={isResetting ? "Réinitialisation..." : "Confirmer"}
              onClick={confirmResetPassword}
              disabled={isResetting}
              className="flex-1"
              style={{ 
                height: "50px",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                border: "none"
              }}
            />
          </div>
        </div>
      </Dialog>

      {/* Dialog de succès */}
      <Dialog
        visible={showSuccessDialog}
        onHide={() => setShowSuccessDialog(false)}
        modal
        dismissableMask
        style={{ width: "550px" }}
        className="custom-dialog"
      >
        {resetSuccessDetails && (
          <div className="p-5">
            {/* Icône de succès */}
            <div className="text-center mb-4">
              <div
                className="inline-flex align-items-center justify-content-center border-circle mb-3"
                style={{
                  width: "90px",
                  height: "90px",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  boxShadow: "0 8px 25px rgba(16, 185, 129, 0.35)",
                }}
              >
                <i className="pi pi-check text-white" style={{ fontSize: "3rem" }}></i>
              </div>
              <h2 className="text-900 font-bold text-2xl mb-2">Réinitialisation réussie !</h2>
              <p className="text-600 text-lg">Le mot de passe a été mis à jour dans Active Directory</p>
            </div>

            <Divider />

            {/* Détails */}
            <div className="surface-100 border-round-lg p-4 mb-4">
              <div className="flex align-items-start gap-3 mb-3 pb-3 border-bottom-1 surface-border">
                                <div className="flex-1">
                  <div className="text-500 text-sm mb-1 font-medium">Nom complet</div>
                  <div className="text-900 font-semibold text-lg">{resetSuccessDetails.name}</div>
                </div>
              </div>

              <div className="flex align-items-start gap-3 mb-3">
                <div className="flex-1">
                  <div className="text-500 text-sm mb-1 font-medium">Nom d'utilisateur</div>
                  <div className="text-900 font-semibold text-lg">{resetSuccessDetails.sam}</div>
                </div>
              </div>

              {resetSuccessDetails.password && (
                <div className="p-3 bg-yellow-50 border-round-lg border-2 border-yellow-300">
                  <div className="flex align-items-start gap-3">
                    <i className="pi pi-lock text-yellow-700 text-xl mt-1"></i>
                    <div className="flex-1">
                      <div className="text-yellow-700 text-sm font-semibold mb-2">Mot de passe temporaire</div>
                      <div className="flex align-items-center gap-2 mb-3">
                        <div className="text-900 font-bold text-xl bg-white px-3 py-2 border-round flex-1">
                          {resetSuccessDetails.password}
                        </div>
                        <Button
                          icon="pi pi-copy"
                          outlined
                          severity="warning"
                          onClick={copyPasswordToClipboard}
                          tooltip="Copier"
                          style={{ height: "45px" }}
                        />
                      </div>
                      <div className="flex align-items-start gap-2 text-yellow-700">
                        <i className="pi pi-exclamation-triangle mt-1"></i>
                        <small className="font-medium">
                          Veuillez noter ce mot de passe et le communiquer à l'utilisateur de manière sécurisée
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bouton OK */}
            <Button
              label="OK, j'ai compris"
              onClick={() => setShowSuccessDialog(false)}
              severity="success"
              className="w-full"
              style={{ 
                height: "55px", 
                fontSize: "1.1rem",
                fontWeight: "600"
              }}
            />
          </div>
        )}
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

        :global(.custom-reset-btn:hover) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3) !important;
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