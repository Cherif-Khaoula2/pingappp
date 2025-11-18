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

export default function ResetUserPassword() {
 const [search, setSearch] = useState("");
const [users, setUsers] = useState([]);
const [error, setError] = useState(null);
const [loading, setLoading] = useState(false);
const [first, setFirst] = useState(0);
const [rows, setRows] = useState(25);

const [editDialog, setEditDialog] = useState({ visible: false, sam: null, name: "", samAccountName: "", emailAddress: "" });
const [editError, setEditError] = useState(null);
const [isUpdating, setIsUpdating] = useState(false);

const nameTemplate = (rowData) => <span>{rowData.name}</span>;
const emailTemplate = (rowData) => <span>{rowData.email || "N/A"}</span>;

  const onPageChange = (event) => {
  setFirst(event.first);
  setRows(event.rows);
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
const handleEditClick = (user) => {
    console.log("🟦 handleEditClick() → utilisateur sélectionné :", user);

    setEditDialog({
      visible: true,
      sam: user.sam,
      name: user.name || "",
      samAccountName: user.sam || "",
      emailAddress: user.email || "",
    });

    setEditError(null);
};

const confirmUpdateUser = () => {
    console.log("🟨 confirmUpdateUser() → données avant validation :", editDialog);

    // Vérifier les champs
    if (!editDialog.name.trim() || !editDialog.samAccountName.trim() || !editDialog.emailAddress.trim()) {
      setEditError("Tous les champs sont obligatoires.");
      return;
    }

    const originalUser = users.find(u => u.sam === editDialog.sam);
    console.log("🟦 Données utilisateur original :", originalUser);

    if (
      originalUser &&
      originalUser.name === editDialog.name &&
      originalUser.samAccountName === editDialog.samAccountName &&
      originalUser.email === editDialog.emailAddress
    ) {
      setEditError("Aucune modification détectée.");
      return;
    }

    console.log("🟩 Envoi des données au backend :", {
        sam: editDialog.sam,
        name: editDialog.name,
        samAccountName: editDialog.samAccountName,
        emailAddress: editDialog.emailAddress,
    });

    setIsUpdating(true);
    setEditError(null);

        router.post(
      "/ad/users/update-user",
      {
        sam: editDialog.sam,
        name: editDialog.name,
        samAccountName: editDialog.samAccountName,
        emailAddress: editDialog.emailAddress,
      },
      {
        onSuccess: () => {
          console.log("🟩 SUCCESS backend → L’utilisateur a été modifié !");

          setUsers((prev) =>
            prev.map((u) =>
              u.sam === editDialog.sam
                ? { ...u, name: editDialog.name, samAccountName: editDialog.samAccountName, email: editDialog.emailAddress }
                : u
            )
          );
          setEditDialog({ visible: false, sam: null, name: "", samAccountName: "", emailAddress: "" });
          setIsUpdating(false);
        },
        onError: (errors) => {
          console.error("🟥 ERREUR backend :", errors);
          setEditError(errors?.message || "Erreur lors de la modification.");
          setIsUpdating(false);
        },

      }
    );
};


  const actionTemplate = (rowData) => (
    <Button
      icon="pi pi-pencil"
      label="Modifier"
      severity="info"
      size="small"
      outlined
      onClick={() => handleEditClick(rowData)}
    />
  );

  return (
    <Layout>
    <Head title="Modification des utilisateurs AD" />

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
                        Modification des utilisateurs AD
                      </h1>
                      <p className="text-600 m-0 text-lg">
                        Recherchez un utilisateur Active Directory et Modifier ces informations
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

     {/* Dialog de modification */}
      <Dialog
        visible={editDialog.visible}
        onHide={() => setEditDialog({ visible: false, sam: null, name: "", samAccountName: "", emailAddress: "" })}
        modal
        dismissableMask
        style={{ width: "500px" }}
        header="Modifier l'utilisateur"
      >
        <div className="p-4 flex flex-col gap-3">
          <InputText
            value={editDialog.name}
            placeholder="Nom complet"
            onChange={(e) => setEditDialog({ ...editDialog, name: e.target.value })}
          />
          <InputText
            value={editDialog.samAccountName}
            placeholder="SamAccountName"
            onChange={(e) => setEditDialog({ ...editDialog, samAccountName: e.target.value })}
          />
          <InputText
            value={editDialog.emailAddress}
            placeholder="Email"
            onChange={(e) => setEditDialog({ ...editDialog, emailAddress: e.target.value })}
          />
          {editError && <Message severity="error" text={editError} />}
          <div className="flex gap-3 mt-4">
            <Button
              label="Annuler"
              outlined
              severity="secondary"
              className="flex-1"
              onClick={() => setEditDialog({ visible: false, sam: null, name: "", samAccountName: "", emailAddress: "" })}
            />
            <Button
              label={isUpdating ? "Modification..." : "Confirmer"}
              className="flex-1"
              onClick={confirmUpdateUser}
              disabled={isUpdating}
            />
          </div>
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