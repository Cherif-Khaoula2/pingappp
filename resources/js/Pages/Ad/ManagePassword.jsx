import React, { useState } from "react";
import axios from "axios";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Password } from "primereact/password";
import Layout from "@/Layouts/layout/layout.jsx";

export default function ResetUserPassword() {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    sam: null,
    userName: null,
  });

  // 🔹 Recherche d’un utilisateur
  const handleSearch = async () => {
    if (!search.trim()) {
      alert("Veuillez saisir un SamAccountName");
      return;
    }

    try {
      const response = await axios.post("/ad/users/find", { search });

      if (response.data.success && response.data.users) {
        setUser({
          name: response.data.users.Name,
          sam: response.data.users.SamAccountName,
          email: response.data.users.EmailAddress,
        });
        setError(null);
      } else {
        setUser(null);
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

  // 🔹 Confirmation de la réinitialisation
  const confirmReset = async () => {
    try {
      const response = await axios.post("/ad/users/reset-password", {
        sam: confirmDialog.sam,
        new_password: newPassword,
      });

      if (response.data.success) {
        alert("Mot de passe réinitialisé avec succès !");
        setConfirmDialog({ visible: false, sam: null, userName: null });
        setNewPassword("");
      } else {
        alert("Erreur : " + response.data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la réinitialisation :", error);
      alert("Erreur de communication avec le serveur.");
    }
  };

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
                    Recherchez un utilisateur pour réinitialiser son mot de
                    passe.
                  </p>
                </div>
              </div>

              {/* Champ de recherche */}
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

              {user && (
                <div className="mt-4 border-round p-3 bg-gray-50">
                  <div className="flex flex-column gap-2 mb-3">
                    <div className="flex align-items-center gap-2">
                      <i className="pi pi-user text-600"></i>
                      <span className="font-semibold text-900">
                        {user.name}
                      </span>
                    </div>
                    <div className="flex align-items-center gap-2">
                      <i className="pi pi-id-card text-600"></i>
                      <span className="text-600 text-sm">{user.sam}</span>
                    </div>
                    <div className="flex align-items-center gap-2">
                      <i className="pi pi-envelope text-600"></i>
                      <span className="text-600 text-sm">{user.email}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label
                      htmlFor="new-password"
                      className="font-semibold text-900 mb-2 block"
                    >
                      Nouveau mot de passe :
                    </label>
                    <Password
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      toggleMask
                      feedback={false}
                      placeholder="Saisir un nouveau mot de passe..."
                      className="w-full"
                    />
                  </div>

                  <Button
                    label="Réinitialiser le mot de passe"
                    icon="pi pi-refresh"
                    className="mt-4"
                    onClick={() => handleResetClick(user)}
                    style={{
                      background:
                        "linear-gradient(135deg, #6366f1, #4f46e5)",
                      border: "none",
                    }}
                    disabled={!newPassword}
                  />
                </div>
              )}
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
              setConfirmDialog({
                visible: false,
                sam: null,
                userName: null,
              })
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
