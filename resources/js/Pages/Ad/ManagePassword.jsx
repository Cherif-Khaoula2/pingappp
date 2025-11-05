import React, { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import Layout from "@/Layouts/layout/layout.jsx";
import { router } from "@inertiajs/react";

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

  // Contrôle d'affichage du mot de passe (uniquement pour le mode manuel)
  const [showManualPassword, setShowManualPassword] = useState(false);

  // 🔹 Changement du mode de mot de passe
  const handlePasswordModeChange = (mode) => {
    setPasswordMode(mode);
    if (mode === "auto") {
      const pwd = generatePassword();
      setNewPassword(pwd);
      // En mode auto, pas besoin du toggle manuel
    } else {
      setNewPassword("");
      setShowManualPassword(false); // Reset le toggle pour le mode manuel
    }
  };

  // 🔹 Recherche d'un utilisateur
  const handleSearch = async () => {
    if (!search.trim()) {
      alert("Veuillez saisir un SamAccountName");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/ad/users/find", { search });
      if (response.data.success && Array.isArray(response.data.users)) {
        const mappedUsers = response.data.users.map((user) => ({
          name: user.name || user.sam,
          sam: user.sam,
          email: user.email,
          enabled: user.enabled,
          lastLogon: user.last_logon,
        }));
        setUsers(mappedUsers);
        setError(null);
      } else {
        setUsers([]);
        setError("Aucun utilisateur trouvé.");
      }
    } catch (err) {
      console.error("Erreur lors de la recherche :", err);
      setError("Erreur lors de la recherche de l'utilisateur.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Ouvrir le dialog de réinitialisation
  const handleResetClick = (user) => {
    setResetDialog({ visible: true, sam: user.sam, userName: user.name });
    // Préparer mot de passe si mode auto
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
      alert("Veuillez saisir un mot de passe.");
      return;
    }

    router.post(
      "/ad/users/reset-password",
      { sam: resetDialog.sam, new_password: newPassword, user_name: resetDialog.userName },
      {
        onSuccess: () => {
          // Préparer détails du dialog de succès
          setResetSuccessDetails({
            name: resetDialog.userName,
            sam: resetDialog.sam,
            password: passwordMode === "auto" ? newPassword : null,
          });
          setShowSuccessDialog(true);
          setResetDialog({ visible: false, sam: null, userName: null });
          setNewPassword("");
        },
        onError: (errors) => {
  const errorMsg =
    errors?.message ||
    "Erreur lors de la réinitialisation du mot de passe. Vérifiez le mot de passe et réessayez.";
  setResetError(errorMsg);
},

      }
    );
  };

  // 🔹 Templates pour la table
  const nameTemplate = (rowData) => {
    const initial = rowData.name ? rowData.name.charAt(0).toUpperCase() : "U";
    return (
      <div className="flex align-items-center gap-3">
        <div
          className="inline-flex align-items-center justify-content-center border-circle text-white font-bold"
          style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
          }}
        >
          {initial}
        </div>
        <div>
          <div className="font-medium text-900">{rowData.name}</div>
          <div className="text-sm text-600">{rowData.sam}</div>
        </div>
      </div>
    );
  };

  const emailTemplate = (rowData) => (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-envelope text-600"></i>
      <span className="text-900">{rowData.email || "—"}</span>
    </div>
  );

  const actionTemplate = (rowData) => (
    <Button
      icon="pi pi-refresh"
      label="Réinitialiser"
      text
      size="small"
      severity="info"
      onClick={() => handleResetClick(rowData)}
    />
  );

  return (
    <Layout>
      <div className="grid">
        <div className="col-12">
          <Card className="shadow-2">
            <DataTable
              value={users}
              stripedRows
              responsiveLayout="scroll"
              header={
                <div className="flex flex-column gap-3">
                  <div className="flex align-items-center gap-3">
                    <div
                      className="inline-flex align-items-center justify-content-center bg-blue-100 border-circle"
                      style={{ width: "48px", height: "48px" }}
                    >
                      <i className="pi pi-key text-3xl text-blue-600"></i>
                    </div>
                    <div>
                      <h1 className="text-900 text-3xl font-bold m-0">
                        Réinitialisation des mots de passe
                      </h1>
                      <p className="text-600 mt-1 m-0">
                        Recherchez un utilisateur et réinitialisez son mot de passe
                      </p>
                    </div>
                  </div>

                  <div className="p-inputgroup">
                    <span className="p-inputgroup-addon">
                      <i className="pi pi-search"></i>
                    </span>
                    <InputText
                      placeholder="Rechercher un utilisateur dans AD..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      style={{ height: "48px" }}
                    />
                    <Button
                      label={loading ? "Chargement..." : "Rechercher"}
                      icon={loading ? "pi pi-spin pi-spinner" : "pi pi-search"}
                      onClick={handleSearch}
                      disabled={loading}
                      style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", border: "none" }}
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border-round flex align-items-center gap-2">
                      <i className="pi pi-exclamation-triangle text-red-600"></i>
                      <span className="text-red-700">{error}</span>
                    </div>
                  )}
                </div>
              }
              emptyMessage={
                <div className="text-center py-6">
                  <i className="pi pi-users text-400 mb-3" style={{ fontSize: "3rem" }}></i>
                  <h3 className="text-900 text-xl font-medium mb-2">Aucun utilisateur affiché</h3>
                  <p className="text-600">Recherchez un utilisateur Active Directory</p>
                </div>
              }
            >
              <Column field="name" header="Utilisateur" body={nameTemplate} style={{ minWidth: "250px" }} />
              <Column field="email" header="Email" body={emailTemplate} style={{ minWidth: "220px" }} />
              <Column header="Action" body={actionTemplate} style={{ minWidth: "180px" }} />
            </DataTable>
          </Card>
        </div>
      </div>

      {/* Popup réinitialisation */}
      <Dialog
        visible={resetDialog.visible}
        onHide={() => setResetDialog({ visible: false, sam: null, userName: null })}
        header={<span className="text-xl font-bold">Réinitialiser le mot de passe</span>}
        style={{ width: "450px" }}
        modal
        draggable={false}
      >
        <div className="py-3">
          <p className="text-700 text-lg mb-3">Entrez un nouveau mot de passe pour :</p>
          <div className="p-3 bg-gray-50 border-round mb-4">
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-user text-600"></i>
              <span className="font-semibold text-900">{resetDialog.userName}</span>
            </div>
            <div className="flex align-items-center gap-2">
              <i className="pi pi-id-card text-600"></i>
              <span className="text-600 text-sm">{resetDialog.sam}</span>
            </div>
          </div>

          {/* Choix du mode de mot de passe */}
          <div className="mb-4">
            <label className="block text-900 font-medium mb-2">Mode de mot de passe</label>
            <div className="flex gap-3">
              <div
                onClick={() => handlePasswordModeChange("auto")}
                className={`p-3 border-2 border-round cursor-pointer flex-1 text-center ${
                  passwordMode === "auto" ? "border-green-500 bg-green-50 shadow-3" : "border-300 hover:border-400 hover:bg-gray-50"
                }`}
              >
                <i className="pi pi-sparkles text-green-600 mr-2"></i>
                <span className="font-semibold">Automatique</span>
              </div>
              <div
                onClick={() => handlePasswordModeChange("manual")}
                className={`p-3 border-2 border-round cursor-pointer flex-1 text-center ${
                  passwordMode === "manual" ? "border-orange-500 bg-orange-50 shadow-3" : "border-300 hover:border-400 hover:bg-gray-50"
                }`}
              >
                <i className="pi pi-pencil text-orange-600 mr-2"></i>
                <span className="font-semibold">Manuel</span>
              </div>
            </div>
          </div>

          {/* Input mot de passe avec logique conditionnelle */}
          <div className="mb-3">
            <label className="block text-900 font-medium mb-2">
              {passwordMode === "auto" ? "Mot de passe généré" : "Nouveau mot de passe"}
            </label>
            
            {passwordMode === "auto" ? (
              // Mode automatique : champ en lecture seule avec bouton régénérer
              <div className="p-inputgroup">
                <InputText
                  type="text"
                  placeholder="Généré automatiquement"
                  value={newPassword}
                  disabled
                  style={{ 
                    height: "45px",
                    backgroundColor: "#f8f9fa"
                  }}
                  className="font-bold text-green-700"
                />
                <Button
                  icon="pi pi-refresh"
                  className="p-button-outlined p-button-success"
                  onClick={() => setNewPassword(generatePassword())}
                  tooltip="Régénérer le mot de passe"
                />
              </div>
            ) : (
              // Mode manuel : champ modifiable avec bouton afficher/masquer
              <div className="p-inputgroup">
                <InputText
                  type={showManualPassword ? "text" : "password"}
                  placeholder="Saisissez le mot de passe..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ height: "45px" }}
                />
                <Button
                  icon={showManualPassword ? "pi pi-eye-slash" : "pi pi-eye"}
                  className="p-button-outlined"
                  onClick={() => setShowManualPassword((s) => !s)}
                  tooltip={showManualPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                />
              </div>
            )}
            
          
          </div>
        </div>
{resetError && (
  <div className="p-3 bg-red-50 border-round flex align-items-center gap-2 mb-3">
    <i className="pi pi-exclamation-triangle text-red-600"></i>
    <span className="text-red-700 font-medium">{resetError}</span>
  </div>
)}

        <div className="flex justify-content-end gap-2 mt-4">
          
          <Button
            label="Annuler"
            icon="pi pi-times"
            outlined
            onClick={() => setResetDialog({ visible: false, sam: null, userName: null })}
          />
          
           <Button label="Confirmer" icon="pi pi-check" onClick={confirmResetPassword} />
        </div>
      </Dialog>

      {/* Dialog de succès */}
      <Dialog
        visible={showSuccessDialog}
        onHide={() => setShowSuccessDialog(false)}
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-check-circle text-green-600 text-2xl"></i>
            <span>Mot de passe réinitialisé avec succès !</span>
          </div>
        }
        style={{ width: "500px" }}
        modal
      >
        {resetSuccessDetails && (
          <div className="py-3">
            <div className="text-center mb-4">
              <div
                className="inline-flex align-items-center justify-content-center bg-green-100 border-circle mb-3"
                style={{ width: "80px", height: "80px" }}
              >
                <i className="pi pi-check text-4xl text-green-600"></i>
              </div>
              <h3 className="text-900 text-xl font-bold mb-2">Réinitialisation réussie !</h3>
              <p className="text-600">Le mot de passe a été mis à jour dans Active Directory.</p>
            </div>

            <Divider />

            <div className="surface-50 border-round p-4">
              <div className="flex align-items-start gap-3 mb-3">
                <i className="pi pi-user text-primary text-xl mt-1"></i>
                <div>
                  <div className="text-500 text-sm mb-1">Nom complet</div>
                  <div className="text-900 font-semibold">{resetSuccessDetails.name}</div>
                </div>
              </div>

              <div className="flex align-items-start gap-3 mb-3">
                <i className="pi pi-id-card text-primary text-xl mt-1"></i>
                <div>
                  <div className="text-500 text-sm mb-1">Nom d'utilisateur</div>
                  <div className="text-900 font-semibold">{resetSuccessDetails.sam}</div>
                </div>
              </div>

              {resetSuccessDetails.password && (
                <div className="flex align-items-start gap-3 p-3 bg-yellow-50 border-round border-1 border-yellow-200">
                  <i className="pi pi-lock text-yellow-700 text-xl mt-1"></i>
                  <div className="flex-1">
                    <div className="text-yellow-700 text-sm font-semibold mb-1">Mot de passe temporaire</div>
                    <div className="text-900 font-bold text-lg mb-2">{resetSuccessDetails.password}</div>
                    <small className="text-yellow-700 block">
                      <i className="pi pi-exclamation-triangle mr-1"></i>
                      Veuillez noter ce mot de passe et le communiquer à l'utilisateur
                    </small>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </Layout>
  );
}