import React, { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import Layout from "@/Layouts/layout/layout.jsx";

export default function DnIndex({ dns, users }) {
    const [nom, setNom] = useState('');
    const [path, setPath] = useState('');
    const [visible, setVisible] = useState(false);
    const [editVisible, setEditVisible] = useState(false);
    const [selectedDn, setSelectedDn] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedDns, setSelectedDns] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useRef(null);

    // États pour les dialogs de confirmation
    const [confirmDialog, setConfirmDialog] = useState({
        visible: false,
        type: null, // 'edit', 'delete', 'assign'
        data: null,
    });

    const [successDialog, setSuccessDialog] = useState({
        visible: false,
        type: null,
        data: null,
    });

    // ✅ Notifications
    const showSuccess = (msg) => toast.current.show({ severity: 'success', summary: 'Succès', detail: msg, life: 3000 });
    const showError = (msg) => toast.current.show({ severity: 'error', summary: 'Erreur', detail: msg, life: 3000 });

    // ✅ Création
    const createDn = () => {
        if (!nom || !path) return showError('Veuillez remplir tous les champs.');
        setIsSubmitting(true);
        
        router.post('/dns', { nom, path }, {
            onSuccess: () => {
                showSuccess('DN ajouté avec succès.');
                setNom('');
                setPath('');
                setVisible(false);
                setIsSubmitting(false);
            },
            onError: () => {
                showError('Erreur lors de la création du DN.');
                setIsSubmitting(false);
            }
        });
    };

    // ✅ Ouvrir dialog de confirmation pour modification
    const handleEditClick = (dn) => {
        setConfirmDialog({
            visible: true,
            type: 'edit',
            data: { ...dn }
        });
    };

    // ✅ Confirmer la mise à jour
    const confirmUpdate = () => {
        if (!confirmDialog.data) return;
        setIsSubmitting(true);

        router.put(`/dns/${confirmDialog.data.id}`, { 
            nom: confirmDialog.data.nom, 
            path: confirmDialog.data.path 
        }, {
            onSuccess: () => {
                setSuccessDialog({
                    visible: true,
                    type: 'edit',
                    data: confirmDialog.data
                });
                setConfirmDialog({ visible: false, type: null, data: null });
                setIsSubmitting(false);
            },
            onError: () => {
                showError('Erreur lors de la mise à jour du DN.');
                setIsSubmitting(false);
            }
        });
    };

    // ✅ Ouvrir dialog de confirmation pour suppression
    const handleDeleteClick = (dn) => {
        setConfirmDialog({
            visible: true,
            type: 'delete',
            data: dn
        });
    };

    // ✅ Confirmer la suppression
    const confirmDelete = () => {
        if (!confirmDialog.data) return;
        setIsSubmitting(true);

        router.delete(`/dns/${confirmDialog.data.id}`, {
            onSuccess: () => {
                setSuccessDialog({
                    visible: true,
                    type: 'delete',
                    data: confirmDialog.data
                });
                setConfirmDialog({ visible: false, type: null, data: null });
                setIsSubmitting(false);
            },
            onError: () => {
                showError('Erreur lors de la suppression du DN.');
                setIsSubmitting(false);
            }
        });
    };

    // ✅ Ouvrir dialog de confirmation pour affectation
    const handleAssignClick = () => {
        if (!selectedUser || selectedDns.length === 0) {
            return showError('Veuillez sélectionner un utilisateur et au moins un DN.');
        }

        const user = users.find(u => u.id === selectedUser);
        const dnsToAssign = dns.filter(d => selectedDns.includes(d.id));

        setConfirmDialog({
            visible: true,
            type: 'assign',
            data: { user, dns: dnsToAssign }
        });
    };

    // ✅ Confirmer l'affectation
    const confirmAssign = () => {
        setIsSubmitting(true);

        router.post('/dns/assign', { user_id: selectedUser, dn_ids: selectedDns }, {
            onSuccess: () => {
                setSuccessDialog({
                    visible: true,
                    type: 'assign',
                    data: confirmDialog.data
                });
                setConfirmDialog({ visible: false, type: null, data: null });
                setSelectedUser(null);
                setSelectedDns([]);
                setIsSubmitting(false);
            },
            onError: () => {
                showError('Erreur lors de l\'affectation des DNs.');
                setIsSubmitting(false);
            }
        });
    };

    // ✅ Templates pour la table
    const idTemplate = (rowData) => (
        <div className="flex align-items-center gap-2">
            <div
                className="inline-flex align-items-center justify-content-center border-circle text-white font-bold"
                style={{
                    width: "35px",
                    height: "35px",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    fontSize: "0.9rem"
                }}
            >
                {rowData.id}
            </div>
        </div>
    );

    const nomTemplate = (rowData) => (
        <div className="flex align-items-center gap-2">
            <i className="pi pi-folder text-primary text-xl"></i>
            <span className="font-semibold text-900 text-lg">{rowData.nom}</span>
        </div>
    );

    const pathTemplate = (rowData) => (
        <div className="flex align-items-center gap-2">
            <i className="pi pi-map-marker text-600"></i>
            <span className="text-600 font-mono text-sm">{rowData.path}</span>
        </div>
    );

    const usersTemplate = (rowData) => (
        <div className="flex flex-wrap gap-2">
            {rowData.users && rowData.users.length > 0 ? (
                rowData.users.map((user, idx) => (
                    <Tag 
                        key={idx} 
                        value={user.name} 
                        severity="info"
                        icon="pi pi-user"
                        style={{ fontSize: "0.85rem" }}
                    />
                ))
            ) : (
                <span className="text-500 italic">Aucun utilisateur</span>
            )}
        </div>
    );

    const actionsTemplate = (rowData) => (
        <div className="flex gap-2">
            <Button
                icon="pi pi-pencil"
                rounded
                outlined
                severity="info"
                tooltip="Modifier"
                tooltipOptions={{ position: 'top' }}
                className="custom-action-btn"
                onClick={() => handleEditClick(rowData)}
            />
            <Button
                icon="pi pi-trash"
                rounded
                outlined
                severity="danger"
                tooltip="Supprimer"
                tooltipOptions={{ position: 'top' }}
                className="custom-action-btn"
                onClick={() => handleDeleteClick(rowData)}
            />
        </div>
    );

    return (
        <Layout>
            <Toast ref={toast} />
            <div className="grid">
                <div className="col-12">
                    {/* Header Section */}
    
                     
        <Card className="shadow-3 border-round-2xl p-4">
            {/* 🟣 En-tête de la carte */}
          <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-4 mb-5">

    {/* 🟦 Logo + Titre */}
    <div className="flex align-items-center gap-3">
        <div
            className="flex align-items-center justify-content-center border-circle shadow-3"
            style={{
                width: "55px",
                height: "55px",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                boxShadow: "0 6px 16px rgba(79, 70, 229, 0.25)",
            }}
        >
            <i className="pi pi-sitemap text-white text-2xl"></i>
        </div>

        <div>
            <h2 className="text-900 text-2xl font-bold m-0">Gestion des DNs</h2>
            <p className="text-600 m-0 text-sm md:text-base">
                Créez, modifiez et assignez des DNs à vos utilisateurs
            </p>
        </div>
    </div>

    {/* 🟩 Bouton d’action */}
    <Button
        label="Ajouter un DN"
        icon="pi pi-plus"
        onClick={() => setVisible(true)}
        className="shadow-2 border-none text-white font-semibold px-4 py-3 md:px-5 md:py-3 transition-all duration-300"
        style={{
            background: "linear-gradient(135deg, #4f46e5, #6366f1)",
            borderRadius: "12px",
        }}
    />
</div>


            {/* 🧩 Formulaire de sélection */}
            <div className="grid formgrid mb-4">
                <div className="col-12 md:col-4">
                    <label className="block text-900 font-semibold mb-2">Utilisateur</label>
                    <Dropdown
                        value={selectedUser}
                        options={users.map(u => ({ label: u.name, value: u.id }))}
                        onChange={(e) => setSelectedUser(e.value)}
                        placeholder="Sélectionner un utilisateur"
                        className="w-full"
                        filter
                    />
                </div>

                <div className="col-12 md:col-6">
                    <label className="block text-900 font-semibold mb-2">DNs à affecter</label>
                    <MultiSelect
                        value={selectedDns}
                        options={dns.map(d => ({
                            label: `${d.nom} (${d.path})`,
                            value: d.id
                        }))}
                        onChange={(e) => setSelectedDns(e.value)}
                        placeholder="Sélectionner un ou plusieurs DNs"
                        display="chip"
                        className="w-full"
                        filter
                    />
                </div>

                <div className="col-12 md:col-2 flex gap-2 align-items-end justify-content-end">
                    <Button
                        label="Affecter"
                        onClick={handleAssignClick}
                        className="w-full"
                        style={{
                            background: "linear-gradient(135deg, #10b981, #059669)",
                            border: "none",
                            fontWeight: "600"
                        }}
                    />
                   
                </div>
            </div>

            {/* 📋 Tableau des DNs */}
            <DataTable
                value={dns}
                paginator
                rows={6}
                stripedRows
                responsiveLayout="scroll"
                className="custom-datatable"
                emptyMessage={
                    <div className="text-center py-8">
                        <i className="pi pi-inbox text-400 text-5xl mb-4"></i>
                        <h3 className="text-900 text-2xl font-semibold mb-2">Aucun DN disponible</h3>
                        <p className="text-600 text-lg">Commencez par créer votre premier DN</p>
                    </div>
                }
            >
                <Column field="id" header="ID" body={idTemplate} style={{ width: "80px" }} />
                <Column field="nom" header="Nom" body={nomTemplate} sortable style={{ minWidth: "200px" }} />
                <Column field="path" header="Chemin" body={pathTemplate} sortable style={{ minWidth: "250px" }} />
                <Column header="Utilisateurs" body={usersTemplate} style={{ minWidth: "250px" }} />
                <Column header="Actions" body={actionsTemplate} style={{ width: "150px" }} />
            </DataTable>
        </Card>

                 
                </div>
            </div>

            {/* Dialog d'ajout */}
            <Dialog
                visible={visible}
                onHide={() => setVisible(false)}
                modal
                dismissableMask
                style={{ width: "500px" }}
                className="custom-dialog"
            >
                <div className="p-4">
                    <div className="text-center mb-4">
                        <div
                            className="inline-flex align-items-center justify-content-center border-circle mb-3"
                            style={{
                                width: "70px",
                                height: "70px",
                                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                boxShadow: "0 8px 20px rgba(99, 102, 241, 0.3)",
                            }}
                        >
                            <i className="pi pi-plus text-white" style={{ fontSize: "2rem" }}></i>
                        </div>
                        <h2 className="text-900 font-bold text-2xl mb-2">Ajouter un nouveau DN</h2>
                        <p className="text-600 text-lg">Créez un nouveau Distinguished Name</p>
                    </div>

                    <div className="flex flex-column gap-4 mb-4">
                        <div>
                            <label className="block text-900 font-semibold mb-2 text-lg">
                                Nom du DN
                            </label>
                            <InputText
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                placeholder="Ex: Direction IT"
                                className="w-full"
                                style={{ height: "50px", fontSize: "1.05rem" }}
                            />
                        </div>
                        <div>
                            <label className="block text-900 font-semibold mb-2 text-lg">
                                <i className="pi pi-map-marker mr-2"></i>Chemin du DN
                            </label>
                            <InputText
                                value={path}
                                onChange={(e) => setPath(e.target.value)}
                                placeholder="Ex: OU=IT,DC=company,DC=com"
                                className="w-full"
                                style={{ height: "50px", fontSize: "1.05rem" }}
                            />
                            <small className="text-600 block mt-2">
                                <i className="pi pi-info-circle mr-1"></i>
                                Respectez le format LDAP standard
                            </small>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <Button
                            label="Annuler"
                            outlined
                            severity="secondary"
                            onClick={() => setVisible(false)}
                            className="flex-1"
                            style={{ height: "50px" }}
                            disabled={isSubmitting}
                        />
                        <Button
                            label={isSubmitting ? "Création..." : "Créer"}
                            onClick={createDn}
                            className="flex-1"
                            style={{
                                height: "50px",
                                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                                border: "none"
                            }}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            </Dialog>

            {/* Dialog de confirmation */}
            <Dialog
                visible={confirmDialog.visible}
                onHide={() => setConfirmDialog({ visible: false, type: null, data: null })}
                modal
                dismissableMask
                style={{ width: "500px" }}
                className="custom-dialog"
            >
                <div className="p-4">
                    <div className="text-center mb-4">
                        <div
                            className="inline-flex align-items-center justify-content-center border-circle mb-3"
                            style={{
                                width: "70px",
                                height: "70px",
                                background: confirmDialog.type === 'delete'
                                    ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                                    : confirmDialog.type === 'assign'
                                        ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                        : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                boxShadow: confirmDialog.type === 'delete'
                                    ? "0 8px 20px rgba(239, 68, 68, 0.3)"
                                    : confirmDialog.type === 'assign'
                                        ? "0 8px 20px rgba(16, 185, 129, 0.3)"
                                        : "0 8px 20px rgba(245, 158, 11, 0.3)",
                            }}
                        >
                            <i
                                className={`pi ${confirmDialog.type === 'delete' ? 'pi-trash' : confirmDialog.type === 'assign' ? 'pi-user-plus' : 'pi-pencil'} text-white`}
                                style={{ fontSize: "2rem" }}
                            />
                        </div>
                        <h2 className="text-900 font-bold text-2xl mb-2">
                            {confirmDialog.type === 'delete' ? 'Supprimer le DN' :
                                confirmDialog.type === 'assign' ? 'Affecter des DNs' :
                                    'Modifier le DN'}
                        </h2>
                        <p className="text-600 text-lg">
                            {confirmDialog.type === 'delete' ? 'Êtes-vous sûr de vouloir supprimer ce DN ?' :
                                confirmDialog.type === 'assign' ? 'Confirmer l\'affectation des DNs' :
                                    'Modifiez les informations du DN'}
                        </p>
                    </div>

                    {/* Contenu selon le type */}
                    {confirmDialog.type === 'delete' && confirmDialog.data && (
                        <div className="p-3 bg-red-50 border-round-lg mb-4 border-1 border-red-200">
                            <div className="flex align-items-center gap-2 mb-2">
                                <i className="pi pi-folder text-red-600"></i>
                                <span className="font-semibold text-900 text-lg">{confirmDialog.data.nom}</span>
                            </div>
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-map-marker text-red-600"></i>
                                <span className="text-600 font-mono text-sm">{confirmDialog.data.path}</span>
                            </div>
                        </div>
                    )}

                    {confirmDialog.type === 'edit' && confirmDialog.data && (
                        <div className="flex flex-column gap-4 mb-4">
                            <div>
                                <label className="block text-900 font-semibold mb-2">Nom du DN</label>
                                <InputText
                                    value={confirmDialog.data.nom}
                                    onChange={(e) => setConfirmDialog({
                                        ...confirmDialog,
                                        data: { ...confirmDialog.data, nom: e.target.value }
                                    })}
                                    className="w-full"
                                    style={{ height: "50px" }}
                                />
                            </div>
                            <div>
                                <label className="block text-900 font-semibold mb-2">Chemin du DN</label>
                                <InputText
                                    value={confirmDialog.data.path}
                                    onChange={(e) => setConfirmDialog({
                                        ...confirmDialog,
                                        data: { ...confirmDialog.data, path: e.target.value }
                                    })}
                                    className="w-full"
                                    style={{ height: "50px" }}
                                />
                            </div>
                        </div>
                    )}

                    {confirmDialog.type === 'assign' && confirmDialog.data && (
                        <div className="surface-100 border-round-lg p-4 mb-4">
                            <div className="flex align-items-start gap-3 mb-3 pb-3 border-bottom-1 surface-border">
                                <i className="pi pi-user text-primary text-xl mt-1"></i>
                                <div className="flex-1">
                                    <div className="text-500 text-sm mb-1 font-medium">Utilisateur</div>
                                    <div className="text-900 font-semibold text-lg">{confirmDialog.data.user?.name}</div>
                                </div>
                            </div>
                            <div className="flex align-items-start gap-3">
                                <i className="pi pi-sitemap text-primary text-xl mt-1"></i>
                                <div className="flex-1">
                                    <div className="text-500 text-sm mb-2 font-medium">
                                        DNs à affecter ({confirmDialog.data.dns?.length})
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {confirmDialog.data.dns?.map((dn, idx) => (
                                            <Tag
                                                key={idx}
                                                value={dn.nom}
                                                severity="info"
                                                style={{ fontSize: "0.9rem" }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Message d'avertissement pour suppression */}
                    {confirmDialog.type === 'delete' && (
                        <div className="p-3 bg-orange-50 border-round-lg mb-4">
                            <div className="flex align-items-start gap-2">
                                <i className="pi pi-exclamation-triangle text-orange-600 mt-1"></i>
                                <div>
                                    <div className="font-semibold text-orange-900 mb-1">Attention !</div>
                                    <small className="text-orange-700">
                                        Cette action est irréversible. Les associations avec les utilisateurs seront également supprimées.
                                    </small>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Boutons d'action */}
                    <div className="flex gap-3 mt-4">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            outlined
                            severity="secondary"
                            onClick={() => setConfirmDialog({ visible: false, type: null, data: null })}
                            className="flex-1"
                            style={{ height: "50px" }}
                            disabled={isSubmitting}
                        />
                        <Button
                            label={isSubmitting ? "Traitement..." : "Confirmer"}
                            icon={isSubmitting ? "pi pi-spin pi-spinner" : "pi pi-check"}
                            onClick={
                                confirmDialog.type === 'delete' ? confirmDelete :
                                    confirmDialog.type === 'assign' ? confirmAssign :
                                        confirmUpdate
                            }
                            severity={
                                confirmDialog.type === 'delete' ? 'danger' :
                                    confirmDialog.type === 'assign' ? 'success' :
                                        'warning'
                            }
                            className="flex-1"
                            style={{ height: "50px" }}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            </Dialog>

            {/* Dialog de succès */}
            <Dialog
                visible={successDialog.visible}
                onHide={() => setSuccessDialog({ visible: false, type: null, data: null })}
                modal
                dismissableMask
                style={{ width: "550px" }}
                className="custom-dialog"
            >
                <div className="p-5">
                    <div className="text-center mb-4">
                        <div
                            className="inline-flex align-items-center justify-content-center border-circle mb-3"
                            style={{
                                width: "90px",
                                height: "90px",
                                background: successDialog.type === 'delete'
                                    ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                                    : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                boxShadow: successDialog.type === 'delete'
                                    ? "0 8px 25px rgba(239, 68, 68, 0.35)"
                                    : "0 8px 25px rgba(16, 185, 129, 0.35)",
                            }}
                        >
                            <i className="pi pi-check text-white" style={{ fontSize: "3rem" }}></i>
                        </div>
                        <h2 className="text-900 font-bold text-2xl mb-2">
                            {successDialog.type === 'delete' ? 'DN supprimé !' :
                                successDialog.type === 'assign' ? 'DNs affectés !' :
                                    'DN mis à jour !'}
                        </h2>
                        <p className="text-600 text-lg">
                            L'opération a été effectuée avec succès
                        </p>
                    </div>

                    <Divider />

                    {/* Détails selon le type */}
                    {successDialog.type === 'delete' && successDialog.data && (
                        <div className="surface-100 border-round-lg p-4 mb-4">
                            <div className="flex align-items-start gap-3 mb-3">
                                <i className="pi pi-folder text-red-600 text-xl mt-1"></i>
                                <div className="flex-1">
                                    <div className="text-500 text-sm mb-1 font-medium">DN supprimé</div>
                                    <div className="text-900 font-semibold text-lg">{successDialog.data.nom}</div>
                                </div>
                            </div>
                            <div className="flex align-items-start gap-3">
                                <i className="pi pi-map-marker text-red-600 text-xl mt-1"></i>
                                <div className="flex-1">
                                    <div className="text-500 text-sm mb-1 font-medium">Chemin</div>
                                    <div className="text-600 font-mono text-sm">{successDialog.data.path}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {successDialog.type === 'assign' && successDialog.data && (
                        <div className="surface-100 border-round-lg p-4 mb-4">
                            <div className="flex align-items-start gap-3 mb-3 pb-3 border-bottom-1 surface-border">
                                <i className="pi pi-user text-primary text-xl mt-1"></i>
                                <div className="flex-1">
                                    <div className="text-500 text-sm mb-1 font-medium">Utilisateur</div>
                                    <div className="text-900 font-semibold text-lg">{successDialog.data.user?.name}</div>
                                </div>
                            </div>
                            <div className="flex align-items-start gap-3">
                                <i className="pi pi-sitemap text-primary text-xl mt-1"></i>
                                <div className="flex-1">
                                    <div className="text-500 text-sm mb-2 font-medium">
                                        DNs affectés ({successDialog.data.dns?.length})
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {successDialog.data.dns?.map((dn, idx) => (
                                            <Tag
                                                key={idx}
                                                value={dn.nom}
                                                severity="success"
                                                icon="pi pi-check"
                                                style={{ fontSize: "0.9rem" }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Message de confirmation */}
                    <div className={`p-3 border-round-lg mb-4 ${
                        successDialog.type === 'delete' ? 'bg-red-50' : 'bg-green-50'
                    }`}>
                        <div className="flex align-items-start gap-2">
                            <i className={`pi pi-info-circle mt-1`}
                               style={{ color: successDialog.type === 'delete' ? '#dc2626' : '#059669' }}></i>
                            <small className="font-medium" style={{ 
                                color: successDialog.type === 'delete' ? '#991b1b' : '#065f46' 
                            }}>
                                {successDialog.type === 'delete' 
                                    ? 'Le DN a été définitivement supprimé de la base de données.'
                                    : successDialog.type === 'assign'
                                        ? 'Les DNs ont été assignés avec succès à l\'utilisateur.'
                                        : 'Les modifications ont été enregistrées dans la base de données.'}
                            </small>
                        </div>
                    </div>

                    {/* Bouton OK */}
                    <Button
                        label="OK, j'ai compris"
                        icon="pi pi-check"
                        onClick={() => setSuccessDialog({ visible: false, type: null, data: null })}
                        severity={successDialog.type === 'delete' ? 'danger' : 'success'}
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
                .custom-datatable :global(.p-datatable-thead > tr > th) {
                    background: var(--primary-50);
                    color: var(--primary-700);
                    font-weight: 600;
                    font-size: 1rem;
                    padding: 1.2rem 1rem;
                }

                .custom-datatable :global(.p-datatable-tbody > tr) {
                    transition: all 0.2s ease;
                }

                .custom-datatable :global(.p-datatable-tbody > tr:hover) {
                    background: var(--surface-100);
                    transform: scale(1.01);
                }

                .custom-datatable :global(.p-datatable-tbody > tr > td) {
                    padding: 1rem;
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

                :global(.p-tag) {
                    padding: 0.4rem 0.8rem;
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