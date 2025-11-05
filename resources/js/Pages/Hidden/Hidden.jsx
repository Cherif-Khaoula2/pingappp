import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Chip } from "primereact/chip";
import { router ,Head} from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

export default function Hidden({ hiddenAccounts }) {
    const [globalFilter, setGlobalFilter] = useState("");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const toast = useRef(null);

    const handleDeleteClick = (account) => {
        setSelectedAccount(account);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        setShowDeleteDialog(false);
        
        router.delete(route("hidden.destroy", selectedAccount.id), {
            onSuccess: () => {
                setTimeout(() => {
                    setShowSuccessDialog(true);
                }, 300);
            },
            onError: (errors) => {
                toast.current.show({
                    severity: "error",
                    summary: "Erreur",
                    detail: "La suppression a échoué. Veuillez réessayer.",
                    life: 5000
                });
            }
        });
    };

    const cancelDelete = () => {
        setShowDeleteDialog(false);
        setSelectedAccount(null);
    };

    const closeSuccessDialog = () => {
        setShowSuccessDialog(false);
        setSelectedAccount(null);
    };

    const goToLdapUsers = () => {
        router.get(route("hidden.index"));
    };

    // Template pour la colonne actions
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2 justify-content-center">
                <Button
                    icon="pi pi-trash"
                    severity="danger"
                    rounded
                    tooltip="Supprimer"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleDeleteClick(rowData)}
                />
            </div>
        );
    };

    // Template pour la date
    const dateBodyTemplate = (rowData) => {
        return (
            <span className="text-sm">
                {new Date(rowData.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </span>
        );
    };

    // Template pour le username avec badge
    const usernameBodyTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-user" style={{ color: 'var(--primary-color)' }} />
                <span className="font-medium">{rowData.samaccountname}</span>
            </div>
        );
    };

    // Header du tableau avec recherche
    const header = (
        <div className="flex flex-column md:flex-row gap-3 align-items-center justify-content-between">
            <div className="flex align-items-center gap-2">
                <i className="pi pi-filter text-xl" />
                <span className="text-xl font-bold">Comptes masqués</span>
                <Chip 
                    label={hiddenAccounts.length} 
                    className="ml-2"
                    style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}
                />
            </div>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher un compte..."
                    className="w-full md:w-20rem"
                />
            </span>
        </div>
    );

    return (
        <Layout>
            <Head title="Masquer utilisateur" />
            <Toast ref={toast} />
            
            <div className="card shadow-3">
                {/* En-tête de la page */}
                <div className="flex flex-column md:flex-row justify-content-between align-items-center mb-4 gap-3">
                    <div className="flex align-items-center gap-3">
                        <div className="flex align-items-center justify-content-center bg-primary border-circle" 
                             style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-eye-slash text-white text-2xl" />
                        </div>
                        <div>
                            <h2 className="m-0 text-900">Gestion des comptes masqués</h2>
                            <p className="mt-1 mb-0 text-600">
                                Administrez les comptes LDAP exclus de la synchronisation
                            </p>
                        </div>
                    </div>

                    <Button
                        label="Utilisateurs LDAP"
                        icon="pi pi-users"
                        severity="secondary"
                        onClick={goToLdapUsers}
                        className="px-4"
                    />
                </div>

                {/* Ligne de séparation */}
                <div className="border-top-1 surface-border mb-4" />

                {/* Tableau */}
                <DataTable
                    value={hiddenAccounts}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    stripedRows
                    globalFilter={globalFilter}
                    header={header}
                    emptyMessage="Aucun compte masqué trouvé."
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} comptes"
                    className="custom-datatable"
                    responsiveLayout="scroll"
                >
                    <Column 
                        field="id" 
                        header="ID" 
                        sortable 
                        style={{ width: '80px' }}
                        className="text-center"
                    />
                    <Column 
                        field="samaccountname" 
                        header="Nom du compte" 
                        sortable 
                        body={usernameBodyTemplate}
                        style={{ minWidth: '250px' }}
                    />
                    <Column
                        field="created_at"
                        header="Date d'ajout"
                        sortable
                        body={dateBodyTemplate}
                        style={{ minWidth: '200px' }}
                    />
                    <Column
                        header="Actions"
                        body={actionBodyTemplate}
                        exportable={false}
                        style={{ width: '120px' }}
                        className="text-center"
                    />
                </DataTable>
            </div>

            {/* Dialog de confirmation de suppression */}
            <Dialog
                visible={showDeleteDialog}
                onHide={cancelDelete}
                modal
                dismissableMask
                style={{ width: '450px' }}
                className="custom-dialog"
            >
                <div className="flex flex-column align-items-center text-center p-4">
                    {/* Icône animée */}
                    <div className="delete-icon-wrapper mb-4">
                        <div className="pulse-ring"></div>
                        <div className="delete-icon-circle">
                            <i className="pi pi-exclamation-triangle text-white" style={{ fontSize: '2.5rem' }} />
                        </div>
                    </div>

                    {/* Titre */}
                    <h2 className="text-900 font-bold mb-3" style={{ fontSize: '1.5rem' }}>
                        Confirmer la suppression
                    </h2>

                    {/* Message */}
                    <p className="text-700 mb-2" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                        Êtes-vous sûr de vouloir supprimer le compte masqué
                    </p>
                    <div className="bg-primary-50 border-round p-3 mb-4 w-full">
                        <span className="text-primary font-bold text-xl">
                            {selectedAccount?.samaccountname}
                        </span>
                    </div>
                    <p className="text-600 text-sm mb-4">
                        Cette action est irréversible.
                    </p>

                    {/* Boutons */}
                    <div className="flex gap-3 w-full">
                        <Button
                            label="Annuler"
                            onClick={cancelDelete}
                            className="flex-1 p-button-outlined p-button-secondary"
                            style={{ height: '3rem' }}
                        />
                        <Button
                            label="Supprimer"
                            icon="pi pi-trash"
                            onClick={confirmDelete}
                            severity="danger"
                            className="flex-1"
                            style={{ height: '3rem' }}
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
                style={{ width: '450px' }}
                className="custom-dialog"
            >
                <div className="flex flex-column align-items-center text-center p-5">
                    {/* Icône de succès */}
                    <div className="success-icon-wrapper mb-5">
                        <div className="success-icon-circle">
                            <i className="pi pi-check text-white" style={{ fontSize: "1.6rem" }} />
                        </div>
                    </div>

                    {/* Titre */}
                    <h2 className="text-900 font-bold mb-3" style={{ fontSize: '1.6rem' }}>
                        Suppression réussie !
                    </h2>

                    {/* Message */}
                    <p className="text-600 mb-3" style={{ fontSize: '1rem' }}>
                        Le compte a été supprimé avec succès
                    </p>
                    <div className="bg-green-50 border-round p-3 mb-5 w-full">
                        <span className="text-green-700 font-bold text-lg">
                            {selectedAccount?.samaccountname}
                        </span>
                    </div>

                    {/* Bouton OK */}
                    <Button
                        label="OK"
                        onClick={closeSuccessDialog}
                        severity="success"
                        className="w-full"
                        style={{ height: '3rem', fontSize: '1.1rem' }}
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

                /* Icône de suppression */
                .delete-icon-wrapper {
                    position: relative;
                    width: 120px;
                    height: 120px;
                }

                .pulse-ring {
                    display: none;
                }

                .delete-icon-circle {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90px;
                    height: 90px;
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
                }

                /* Icône de succès */
                .success-icon-wrapper {
                    width: 130px;
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
            `}</style>
        </Layout>
    );
}