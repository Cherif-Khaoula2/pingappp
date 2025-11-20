import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import Layout from "@/Layouts/layout/layout.jsx";
import { router } from "@inertiajs/react";
import { Head } from '@inertiajs/react';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function ResetUserPassword() {
  const toast = useRef(null);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(25);

  const [editDialog, setEditDialog] = useState({ 
    visible: false, 
    sam: null, 
    name: "", 
    lastName:"",
    firstName:"",
    samAccountName: "", 
    emailAddress: "" 
  });
  
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    changes: []
  });
  
  const [editError, setEditError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  const nameTemplate = (rowData) => <span>{rowData.name}</span>;
  const emailTemplate = (rowData) => <span>{rowData.email || "N/A"}</span>;

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  // Recherche d'un utilisateur
  const handleSearch = async () => {
    if (!search.trim() && search.trim() !== ".") {
      setError("Veuillez saisir un nom d'utilisateur ou SamAccountName");
      toast.current.show({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez saisir un nom d\'utilisateur',
        life: 3000
      });
      return;
    }

    setLoading(true);
    setError(null);
    setFirst(0);

    try {
      const response = await axios.post("/ad/users/find", { search });

      if (Array.isArray(response.data.users) && response.data.users.length > 0) {
        const mappedUsers = response.data.users.map((user) => ({
          name: user.name || user.sam,
          firstName: user.firstName,
          lastName: user.lastName,
          sam: user.sam,
          samAccountName: user.sam,
          email: user.email,
          enabled: user.enabled,
          dn: user.dn,
          lastLogon: user.last_logon,
        }));
        setUsers(mappedUsers);
        setError(null);
      
      } else {
        setUsers([]);
        toast.current.show({
          severity: 'info',
          summary: 'Aucun résultat',
          detail: 'Aucun utilisateur trouvé pour cette recherche',
          life: 3000
        });
      }
    } catch (err) {
      console.error("Erreur lors de la recherche :", err);
      setError("Erreur lors de la recherche de l'utilisateur. Veuillez réessayer.");
      setUsers([]);
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de la recherche de l\'utilisateur',
        life: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  // Ouverture du dialogue de modification
  const handleEditClick = (user) => {
    const userData = {
      sam: user.sam,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      name: user.name || "",
      samAccountName: user.samAccountName || "",
      emailAddress: user.email || "",
    };

    setOriginalData(userData);
    setEditDialog({
      visible: true,
      ...userData
    });
    setEditError(null);
  };

  // Validation et préparation de la confirmation
  const handleValidateChanges = () => {
    // Vérifier les champs obligatoires
    if (!editDialog.firstName.trim() ||!editDialog.lastName.trim() || !editDialog.name.trim() || !editDialog.samAccountName.trim() || !editDialog.emailAddress.trim()) {
      setEditError("Tous les champs sont obligatoires.");
      toast.current.show({
        severity: 'warn',
        summary: 'Champs manquants',
        detail: 'Tous les champs sont obligatoires',
        life: 3000
      });
      return;
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editDialog.emailAddress)) {
      setEditError("Format d'email invalide.");
      toast.current.show({
        severity: 'warn',
        summary: 'Email invalide',
        detail: 'Le format de l\'email est invalide',
        life: 3000
      });
      return;
    }

    // Détecter les modifications
    const changes = [];
    if (originalData.firstName !== editDialog.firstName) {
      changes.push({
        field: "Prénom",
        oldValue: originalData.firstName,
        newValue: editDialog.firstName
      });
    }
     if (originalData.lastName !== editDialog.lastName) {
      changes.push({
        field: "Nom",
        oldValue: originalData.lastName,
        newValue: editDialog.lastName
      });
    }
     if (originalData.name !== editDialog.name) {
      changes.push({
        field: "Nom complet",
        oldValue: originalData.name,
        newValue: editDialog.name
      });
    }
    if (originalData.samAccountName !== editDialog.samAccountName) {
      changes.push({
        field: "SamAccountName",
        oldValue: originalData.samAccountName,
        newValue: editDialog.samAccountName
      });
    }
    if (originalData.emailAddress !== editDialog.emailAddress) {
      changes.push({
        field: "Email",
        oldValue: originalData.emailAddress,
        newValue: editDialog.emailAddress
      });
    }

    if (changes.length === 0) {
      toast.current.show({
        severity: 'info',
        summary: 'Aucune modification',
        detail: 'Aucun changement n\'a été détecté',
        life: 3000
      });
      return;
    }

    // Afficher le dialogue de confirmation
    setConfirmDialog({
      visible: true,
      changes: changes
    });
    setEditError(null);
  };

  // Confirmation finale de la modification
  const confirmUpdateUser = () => {
    setIsUpdating(true);
    setConfirmDialog({ visible: false, changes: [] });

    router.post(
      "/ad/users/update-user",
      {
        sam: editDialog.sam,
        firstName: editDialog.firstName,
        lastName: editDialog.lastName,
        name: editDialog.name,
        samAccountName: editDialog.samAccountName,
        emailAddress: editDialog.emailAddress,
      },
      {
        onSuccess: () => {
          setUsers((prev) =>
            prev.map((u) =>
              u.sam === editDialog.sam
                ? { ...u,firstName: editDialog.firstName ,lastName: editDialog.lastName,  name: editDialog.name, samAccountName: editDialog.samAccountName, email: editDialog.emailAddress }
                : u
            )
          );
          setEditDialog({ visible: false, sam: null,firstName :"" ,lastName:"", name: "",  samAccountName: "", emailAddress: "" });
          setOriginalData(null);
          setIsUpdating(false);
          
          // Toast de succès
          toast.current.show({
            severity: 'success',
            summary: 'Modification réussie',
            detail: 'Les informations de l\'utilisateur ont été mises à jour avec succès',
            life: 4000
          });
        },
        onError: (errors) => {
          console.error("Erreur backend :", errors);
          setEditError(errors?.message || "Erreur lors de la modification.");
          setIsUpdating(false);
          setEditDialog({ ...editDialog, visible: true });
          
          // Toast d'erreur
          toast.current.show({
            severity: 'error',
            summary: 'Erreur de modification',
            detail: errors?.message || 'Une erreur est survenue lors de la modification',
            life: 5000
          });
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
      <Toast ref={toast} position="top-right" />

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
              rowsPerPageOptions={[25, 50, 100, 200]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} utilisateurs"
              responsiveLayout="scroll"
              className="custom-datatable"
              header={
                <div className="flex flex-column gap-4">
                  <div className="flex align-items-center gap-3">
                    <div>
                      <h1 className="text-900 text-3xl font-bold m-0 mb-1">
                        Modification des utilisateurs AD
                      </h1>
                      <p className="text-600 m-0 text-lg">
                        Recherchez un utilisateur Active Directory et modifiez ses informations
                      </p>
                    </div>
                  </div>

                  <div className="p-inputgroup" style={{ height: "52px" }}>
                    <InputText
                      placeholder="Rechercher un utilisateur dans AD (nom, samaccountname, email)..."
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

      {/* Dialog de modification amélioré */}
      <Dialog
        visible={editDialog.visible}
        onHide={() => {
          setEditDialog({ visible: false, sam: null,  firstName :"" ,lastName:"", name: "", samAccountName: "", emailAddress: "" });
          setEditError(null);
          setOriginalData(null);
        }}
        modal
        dismissableMask
        style={{ width: "550px" }}
        className="edit-dialog"
      >
        <div className="p-5">
          {/* En-tête personnalisé */}
          <div className="flex align-items-center gap-3 mb-4 pb-3 border-bottom-1 border-200">
            <div className="flex align-items-center justify-content-center bg-primary-100 border-circle" style={{ width: "48px", height: "48px" }}>
              <i className="pi pi-user-edit text-primary text-2xl"></i>
            </div>
            <div>
              <h3 className="text-900 font-bold text-2xl m-0">Modifier l'utilisateur</h3>
              <p className="text-600 m-0 mt-1">Mettez à jour les informations de l'utilisateur</p>
            </div>
          </div>

          {/* Formulaire */}
          
          <div className="flex flex-column gap-4 mt-4">
             <div className="flex flex-column gap-2">
              <label className="text-900 font-semibold">
                <i className="pi pi-user mr-2 text-primary"></i>
                Prénom
              </label>
              <InputText
                value={editDialog.firstName}
                placeholder="Ex: Jean Dupont"
                onChange={(e) => setEditDialog({ ...editDialog, firstName: e.target.value })}
                className="p-3"
              />
            </div>
             <div className="flex flex-column gap-2">
              <label className="text-900 font-semibold">
                <i className="pi pi-user mr-2 text-primary"></i>
                Nom
              </label>
              <InputText
                value={editDialog.lastName}
                placeholder="Ex: Jean Dupont"
                onChange={(e) => setEditDialog({ ...editDialog, lastName: e.target.value })}
                className="p-3"
              />
            </div>
            <div className="flex flex-column gap-2">
              <label className="text-900 font-semibold">
                <i className="pi pi-user mr-2 text-primary"></i>
                Nom complet
              </label>
              <InputText
                value={editDialog.name}
                placeholder="Ex: Jean Dupont"
                onChange={(e) => setEditDialog({ ...editDialog, name: e.target.value })}
                className="p-3"
              />
            </div>

            <div className="flex flex-column gap-2">
              <label className="text-900 font-semibold">
                <i className="pi pi-id-card mr-2 text-primary"></i>
                SamAccountName
              </label>
              <InputText
                value={editDialog.samAccountName}
                placeholder="Ex: jdupont"
               onChange={(e) =>
  setEditDialog({
    ...editDialog,
    samAccountName: e.target.value,
  })
}

                className="p-3"
              />
            </div>

             <div className="flex flex-column gap-2">
                         <label className="text-900 font-semibold">
                           <i className="pi pi-envelope mr-2 text-primary"></i>
                           Adresse email
                         </label>
                         <InputText
                           value={editDialog.emailAddress}
                           placeholder="Ex: jean.dupont@entreprise.com"
                           onChange={(e) => setEditDialog({ ...editDialog, emailAddress: e.target.value })}
                           className="p-3"
                           type="email"
                         />
                       </div>


            {editError && (
              <Message 
                severity="error" 
                text={editError} 
                className="w-full"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-5 pt-4 border-top-1 border-200">
            <Button
              label="Annuler"
              outlined
              severity="secondary"
              className="flex-1 p-3"
              onClick={() => {
                setEditDialog({ visible: false, sam: null, name: "", samAccountName: "", emailAddress: "" });
                setEditError(null);
                setOriginalData(null);
              }}
            />
            <Button
              label="Valider les modifications"
              icon={isUpdating ? "pi pi-spin pi-spinner" : ""}
              className="flex-1 p-3"
              onClick={handleValidateChanges}
              style={{
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                border: "none"
              }}
            />
          </div>
        </div>
      </Dialog>

      {/* Dialog de confirmation des modifications */}
      <Dialog
        visible={confirmDialog.visible}
        onHide={() => setConfirmDialog({ visible: false, changes: [] })}
        modal
        dismissableMask
        style={{ width: "600px" }}
        className="confirm-dialog"
      >
        <div className="p-5">
          {/* En-tête de confirmation */}
          <div className="flex align-items-center gap-3 mb-4 pb-3 border-bottom-1 border-200">
            <div className="flex align-items-center justify-content-center bg-orange-100 border-circle" style={{ width: "48px", height: "48px" }}>
              <i className="pi pi-exclamation-triangle text-orange-500 text-2xl"></i>
            </div>
            <div>
              <h3 className="text-900 font-bold text-2xl m-0">Confirmer les modifications</h3>
              <p className="text-600 m-0 mt-1">Veuillez vérifier les changements avant de confirmer</p>
            </div>
          </div>

          {/* Résumé des modifications */}
          <div className="bg-primary-50 border-round-lg p-4 mb-4">
            <div className="flex align-items-center gap-2 mb-3">
              <i className="pi pi-info-circle text-primary"></i>
              <span className="font-semibold text-900">Modifications détectées ({confirmDialog.changes.length})</span>
            </div>
            
            <div className="flex flex-column gap-3">
              {confirmDialog.changes.map((change, index) => (
                <div key={index} className="bg-white border-round p-3">
                  <div className="font-semibold text-900 mb-2">
                    <i className="pi pi-angle-right text-primary mr-2"></i>
                    {change.field}
                  </div>
                  <div className="flex flex-column gap-2 ml-4">
                    <div className="flex align-items-center gap-2">
                      <span className="text-600 font-medium">Ancienne valeur:</span>
                      <span className="text-500 line-through">{change.oldValue}</span>
                    </div>
                    <div className="flex align-items-center gap-2">
                      <span className="text-600 font-medium">Nouvelle valeur:</span>
                      <span className="text-primary font-semibold">{change.newValue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message d'avertissement */}
          <Message
            severity="warn"
            text="Cette action modifiera les informations de l'utilisateur dans Active Directory. Assurez-vous que les données sont correctes."
            className="w-full mb-4"
          />

          {/* Actions de confirmation */}
          <div className="flex gap-3">
            <Button
              label="Retour"
              outlined
              severity="secondary"
              className="flex-1 p-3"
              onClick={() => setConfirmDialog({ visible: false, changes: [] })}
              disabled={isUpdating}
            />
           <Button
              label={isUpdating ? "Modification en cours..." : "Confirmer la modification"}
              icon={isUpdating ? "pi pi-spin pi-spinner" : ""}
              severity="warning"
              className="flex-1 p-3"
              onClick={confirmUpdateUser}
              disabled={isUpdating}
              style={{
                background: isUpdating ? "#94a3b8" : "linear-gradient(135deg, #f59e0b, #d97706)",
                border: "none"
              }}
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

        :global(.edit-dialog .p-dialog-header) {
          display: none;
        }

        :global(.confirm-dialog .p-dialog-header) {
          display: none;
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