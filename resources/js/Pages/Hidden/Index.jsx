import React, { useState, useRef } from "react";
import { router } from "@inertiajs/react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Chip } from "primereact/chip";
import Layout from "@/Layouts/layout/layout.jsx";

export default function HiddenIndex({ users, search }) {
    const [searchTerm, setSearchTerm] = useState(search || "");
    const [globalFilter, setGlobalFilter] = useState("");
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const toast = useRef(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("hidden.index"), { search: searchTerm });
    };

    const handleHideClick = (user) => {
        setSelectedUser(user);
        setShowConfirmDialog(true);
    };

    const confirmHide = () => {
        setShowConfirmDialog(false);

        router.post(
            route("hidden.store"),
            { samaccountname: selectedUser.username },
            {
                onSuccess: () => {
                    setTimeout(() => {
                        setShowSuccessDialog(true);
                    }, 300);
                },
                onError: (errors) => {
                    toast.current.show({
                        severity: "error",
                        summary: "Erreur",
                        detail: "Le masquage a échoué. Veuillez réessayer.",
                        life: 5000,
                    });
                },
            }
        );
    };

    const cancelHide = () => {
        setShowConfirmDialog(false);
        setSelectedUser(null);
    };

    const closeSuccessDialog = () => {
        setShowSuccessDialog(false);
        setSelectedUser(null);
    };

    const goToHiddenList = () => {
        router.get(route("hidden.list"));
    };

    // Template pour le nom avec icône
    const nameBodyTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-user text-primary" />
                <span className="font-medium">{rowData.name}</span>
            </div>
        );
    };

    // Template pour l'email
    const emailBodyTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-envelope text-600" style={{ fontSize: '0.9rem' }} />
                <span className="text-600">{rowData.email}</span>
            </div>
        );
    };

    // Template pour l'username
    const usernameBodyTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-id-card text-600" style={{ fontSize: '0.9rem' }} />
                <span className="font-mono text-sm">{rowData.username}</span>
            </div>
        );
    };

    // Template pour les actions
    const actionBodyTemplate = (rowData) => {
        if (rowData.is_hidden) {
            return (
                <div className="flex align-items-center justify-content-center">
                    <div className="px-3 py-2 border-round flex align-items-center gap-2" 
                         style={{ 
                             background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                             border: '1px solid #9ca3af'
                         }}>
                        <i className="pi pi-check-circle" style={{ color: '#6b7280', fontSize: '0.9rem' }} />
                        
                    </div>
                </div>
            );
        }
        return (
            <Button
                icon="pi pi-eye-slash"
                severity="warning"
                size="small"
                onClick={() => handleHideClick(rowData)}
                className="custom-hide-button"
                style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: 'none',
                    fontWeight: '600',
                    padding: '0.5rem 1.25rem',
                    transition: 'all 0.3s ease'
                }}
            />
        );
    };

    // Header du tableau
    const header = (
        <div className="flex flex-column md:flex-row gap-3 align-items-center justify-content-between">
            <div className="flex align-items-center gap-2">
                <i className="pi pi-users text-xl" />
                <span className="text-xl font-bold">Utilisateurs Active Directory</span>
                <Chip
                    label={users.length}
                    className="ml-2"
                    style={{ backgroundColor: "var(--primary-color)", color: "white" }}
                />
            </div>
          <form onSubmit={handleSearch} className="flex gap-2 mb-3">
          <InputText
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un utilisateur LDAP..."
          />
          <Button label="Rechercher" type="submit" />
        </form>
        </div>
    );

    return (
        <Layout>
            <Toast ref={toast} />

            <div className="card shadow-3">
                {/* En-tête de la page */}
                <div className="flex flex-column md:flex-row justify-content-between align-items-center mb-4 gap-3">
                    <div className="flex align-items-center gap-3">
                        <div
                            className="flex align-items-center justify-content-center bg-primary border-circle"
                            style={{ width: "3rem", height: "3rem" }}
                        >
                            <i className="pi pi-server text-white text-2xl" />
                        </div>
                        <div>
                            <h2 className="m-0 text-900">Gestion des Comptes Active Directory</h2>
                            <p className="mt-1 mb-0 text-600">
                                Recherchez et masquez les comptes LDAP de la synchronisation
                            </p>
                        </div>
                    </div>

                    <Button
                        label="Comptes masqués"
                        icon="pi pi-list"
                        severity="secondary"
                        onClick={goToHiddenList}
                        className="px-4"
                    />
                </div>

                {/* Ligne de séparation */}
                <div className="border-top-1 surface-border mb-4" />

                {/* Tableau */}
                <DataTable
                    value={users}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    stripedRows
                    globalFilter={globalFilter}
                    header={header}
                    emptyMessage="Aucun utilisateur trouvé. Utilisez la recherche ci-dessus."
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} utilisateurs"
                    className="custom-datatable"
                    responsiveLayout="scroll"
                >
                    <Column
                        field="name"
                        header="Nom complet"
                        sortable
                        body={nameBodyTemplate}
                        style={{ minWidth: "250px" }}
                    />
                    <Column
                        field="email"
                        header="Email"
                        sortable
                        body={emailBodyTemplate}
                        style={{ minWidth: "250px" }}
                    />
                    <Column
                        field="username"
                        header="Identifiant AD"
                        sortable
                        body={usernameBodyTemplate}
                        style={{ minWidth: "200px" }}
                    />
                    <Column
                        header="Action"
                        body={actionBodyTemplate}
                        exportable={false}
                        style={{ width: "150px" }}
                        className="text-center"
                    />
                </DataTable>
            </div>

            {/* Dialog de confirmation de masquage */}
            <Dialog
                visible={showConfirmDialog}
                onHide={cancelHide}
                modal
                dismissableMask
                style={{ width: "450px" }}
                className="custom-dialog"
            >
                <div className="flex flex-column align-items-center text-center p-4">
                    {/* Icône */}
                    <div className="warning-icon-wrapper mb-4">
                        <div className="warning-icon-circle">
                            <i className="pi pi-eye-slash text-white" style={{ fontSize: "2.5rem" }} />
                        </div>
                    </div>

                    {/* Titre */}
                    <h2 className="text-900 font-bold mb-3" style={{ fontSize: "1.5rem" }}>
                        Confirmer le masquage
                    </h2>

                    {/* Message */}
                    <p className="text-700 mb-2" style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
                        Voulez-vous masquer le compte suivant ?
                    </p>
                    <div className="bg-orange-50 border-round p-3 mb-2 w-full">
                        <div className="text-orange-700 font-bold text-lg mb-1">
                            {selectedUser?.name}
                        </div>
                        <div className="text-orange-600 text-sm">
                            {selectedUser?.username}
                        </div>
                    </div>
                    <p className="text-600 text-sm mb-4">
                        Ce compte ne sera plus synchronisé avec la base de données locale.
                    </p>

                    {/* Boutons */}
                    <div className="flex gap-3 w-full">
                        <Button
                            label="Annuler"
                            onClick={cancelHide}
                            className="flex-1 p-button-outlined p-button-secondary"
                            style={{ height: "3rem" }}
                        />
                        <Button
                            label="Masquer"
                            icon="pi pi-eye-slash"
                            onClick={confirmHide}
                            severity="warning"
                            className="flex-1"
                            style={{ height: "3rem" }}
                        />
                    </div>
                </div>
            </Dialog>

            {/* Dialog de succès */}
            <Dialog
                visible={showSuccessDialog}
                onHide={closeSuccessDialog}
                modal
                dismissableMask
                style={{ width: "450px" }}
                className="custom-dialog"
            >
                <div className="flex flex-column align-items-center text-center p-5">
                    {/* Icône de succès */}
                    <div className="success-icon-wrapper mb-5">
                        <div className="success-icon-circle">
                            <i
                                className="pi pi-check text-white"
                                style={{ fontSize: "2.5rem" }}
                            />
                        </div>
                    </div>

                    {/* Titre */}
                    <h2 className="text-900 font-bold mb-3" style={{ fontSize: "1.6rem" }}>
                        Masquage réussi !
                    </h2>

                    {/* Message */}
                    <p className="text-600 mb-3" style={{ fontSize: "1rem" }}>
                        Le compte a été masqué avec succès
                    </p>
                    <div className="bg-green-50 border-round p-3 mb-5 w-full">
                        <div className="text-green-700 font-bold text-lg mb-1">
                            {selectedUser?.name}
                        </div>
                        <div className="text-green-600 text-sm">
                            {selectedUser?.username}
                        </div>
                    </div>

                    {/* Bouton OK */}
                    <Button
                        label="OK"
                        onClick={closeSuccessDialog}
                        severity="success"
                        className="w-full"
                        style={{ height: "3rem", fontSize: "1.1rem" }}
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
                }

                .custom-datatable :global(.p-datatable-tbody > tr:hover) {
                    background: var(--surface-100);
                }

                /* Dialog personnalisé */
                :global(.custom-dialog .p-dialog-content) {
                    padding: 0 !important;
                    border-radius: 12px;
                }

                :global(.custom-dialog .p-dialog-header) {
                    display: none;
                }

                /* Icône de warning */
                .warning-icon-wrapper {
                    position: relative;
                    width: 120px;
                    height: 120px;
                }

                .warning-icon-circle {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90px;
                    height: 90px;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
                }

                /* Icône de succès */
                .success-icon-wrapper {
                    width: 1px;
                    height: 130px;
                    position: relative;
                }

                .success-icon-circle {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90px;
                    height: 90px;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.35);
                }

                /* Bouton Masquer amélioré */
                :global(.custom-hide-button:hover) {
                    background: linear-gradient(135deg, #d97706 0%, #b45309 100%) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4) !important;
                }

                :global(.custom-hide-button:active) {
                    transform: translateY(0);
                    box-shadow: 0 2px 10px rgba(245, 158, 11, 0.3) !important;
                }
            `}</style>
        </Layout>
    );
}