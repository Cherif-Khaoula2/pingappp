import React, { useState, useRef } from 'react';
import { router, Head } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Chip } from 'primereact/chip';
import Layout from "@/Layouts/layout/layout.jsx";
import 'primereact/resources/themes/lara-light-indigo/theme.css';  // Thème
import 'primereact/resources/primereact.min.css';                   // Core CSS
import 'primeicons/primeicons.css';                                 // Icônes
import 'primeflex/primeflex.css';  
export default function DnIndex({ dns, users }) {
    const [nom, setNom] = useState('');
    const [path, setPath] = useState('');
    const [visible, setVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedDns, setSelectedDns] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useRef(null);

    const [confirmDialog, setConfirmDialog] = useState({
        visible: false,
        type: null,
        data: null,
    });

    const [successDialog, setSuccessDialog] = useState({
        visible: false,
        type: null,
        data: null,
    });

    // États pour le dialog d'édition avancée
    const [editDialog, setEditDialog] = useState({
        visible: false,
        dn: null,
        selectedUsers: [],
    });

    const showSuccess = (msg) => toast.current.show({ severity: 'success', summary: 'Succès', detail: msg, life: 3000 });
    const showError = (msg) => toast.current.show({ severity: 'error', summary: 'Erreur', detail: msg, life: 3000 });

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

    // ✅ Ouvrir le dialog d'édition avancée
    const handleEditClick = (dn) => {
        const currentUserIds = dn.users ? dn.users.map(u => u.id) : [];
        setEditDialog({
            visible: true,
            dn: { ...dn },
            selectedUsers: currentUserIds,
        });
    };

    // ✅ Confirmer la mise à jour avec affectations
    const confirmUpdate = () => {
        if (!editDialog.dn) return;
        setIsSubmitting(true);

        router.put(`/dns/${editDialog.dn.id}`, { 
            nom: editDialog.dn.nom, 
            path: editDialog.dn.path,
            user_ids: editDialog.selectedUsers
        }, {
            onSuccess: () => {
                setSuccessDialog({
                    visible: true,
                    type: 'edit',
                    data: {
                        ...editDialog.dn,
                        users: users.filter(u => editDialog.selectedUsers.includes(u.id))
                    }
                });
                setEditDialog({ visible: false, dn: null, selectedUsers: [] });
                setIsSubmitting(false);
            },
            onError: () => {
                showError('Erreur lors de la mise à jour du DN.');
                setIsSubmitting(false);
            }
        });
    };

    const handleDeleteClick = (dn) => {
        setConfirmDialog({
            visible: true,
            type: 'delete',
            data: dn
        });
    };

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


    const nomTemplate = (rowData) => (
        <div className="flex align-items-center gap-3">
        
            <div>
                <span className="font-bold text-900 text-lg block mb-1">{rowData.nom}</span>
            </div>
        </div>
    );

    const pathTemplate = (rowData) => (
        <div className="">
<code className="text-600 text-base font-bold">{rowData.path}</code>
        </div>
    );

    const usersTemplate = (rowData) => (
        <div className="flex flex-wrap gap-2">
            {rowData.users && rowData.users.length > 0 ? (
                <>
                   
                    {rowData.users.slice(0, 2).map((user, idx) => (
                        <Tag 
                            key={idx} 
                            value={user.name} 
                            severity="info"
                            icon="pi pi-user"
                            className="shadow-1"
                        />
                    ))}
                    {rowData.users.length > 2 && (
                        <Tag 
                            value={`+${rowData.users.length - 2}`}
                            severity="secondary"
                            className="shadow-1"
                        />
                    )}
                </>
            ) : (
                <Chip 
                    label="Non affecté" 
                    className="bg-orange-50 text-orange-600"
                />
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
                tooltip="Modifier et gérer les affectations"
                tooltipOptions={{ position: 'top' }}
                className="hover-lift"
                onClick={() => handleEditClick(rowData)}
            />
            <Button
                icon="pi pi-trash"
                rounded
                outlined
                severity="danger"
                tooltip="Supprimer"
                tooltipOptions={{ position: 'top' }}
                className="hover-lift"
                onClick={() => handleDeleteClick(rowData)}
            />
        </div>
    );

    return (
        <Layout>
            <Head title="Gestion des DNs" />
            <Toast ref={toast} />
            
            <div className="grid">
                <div className="col-12">
                    <Card className="shadow-4 border-round-3xl border-none">
                        {/* En-tête moderne */}
                        <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-4 mb-5 pb-4 border-bottom-2 surface-border">
                            <div className="flex align-items-center gap-4">
                                <div
                                    className="flex align-items-center justify-content-center border-circle shadow-4"
                                
                                >
                                   
                                </div>
                                <div>
                                    <h1 className="text-900 text-3xl font-bold m-0 mb-2">Gestion des DNs</h1>
                                    <p className="text-600 m-0 text-base">
                                        <i className="pi pi-info-circle mr-2"></i>
                                        Administrez vos Nom du DN et leurs affectations
                                    </p>
                                </div>
                            </div>
                            <Button
                                label="Nouveau DN"
                                onClick={() => setVisible(true)}
                                className="shadow-3 border-none text-white font-bold px-5 py-3 hover-lift"
                                style={{
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    borderRadius: "14px",
                                    fontSize: "1.05rem"
                                }}
                            />
                        </div>

                        {/* Section d'affectation rapide */}
                        <div className="surface-50 border-round-2xl p-4 mb-5 shadow-1">
                            <div className="flex align-items-center gap-2 mb-3">
                                <h3 className="text-900 font-bold text-xl m-0">Affectation </h3>
                            </div>
                            <div className="grid formgrid">
                                <div className="col-12 md:col-5">
                                    <label className="block text-900 font-semibold mb-2 text-sm">
                                        <i className="pi pi-user mr-2"></i>Utilisateur
                                    </label>
                                    <Dropdown
                                        value={selectedUser}
                                        options={users.map(u => ({ label: u.name, value: u.id }))}
                                        onChange={(e) => setSelectedUser(e.value)}
                                        placeholder="Choisir un utilisateur"
                                        className="w-full"
                                        filter
                                        showClear
                                    />
                                </div>
                                <div className="col-12 md:col-5">
                                    <label className="block text-900 font-semibold mb-2 text-sm">
                                        <i className="pi pi-sitemap mr-2"></i>DNs à affecter
                                    </label>
                                    <MultiSelect
                                        value={selectedDns}
                                        options={dns.map(d => ({
                                            label: `${d.nom} (${d.path})`,
                                            value: d.id
                                        }))}
                                        onChange={(e) => setSelectedDns(e.value)}
                                        placeholder="Sélectionner des DNs"
                                        display="chip"
                                        className="w-full"
                                        filter
                                    />
                                </div>
                                <div className="col-12 md:col-2 flex align-items-end">
                                    <Button
                                        label="Affecter"
                                        onClick={handleAssignClick}
                                        className="w-full font-bold"
                                        severity="success"
                                        style={{ height: "48px" }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tableau moderne */}
                        <DataTable
                            value={dns}
                            paginator
                            rows={8}
                            stripedRows
                            className="modern-datatable"
                            emptyMessage={
                                <div className="text-center py-8">
                                    <div 
                                        className="inline-flex align-items-center justify-content-center border-circle mb-4"
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)"
                                        }}
                                    >
                                        <i className="pi pi-inbox text-400 text-6xl"></i>
                                    </div>
                                    <h3 className="text-900 text-2xl font-bold mb-2">Aucun DN disponible</h3>
                                    <p className="text-600 text-lg mb-4">Commencez par créer votre premier DN</p>
                                    <Button 
                                        label="Créer un DN" 
                                        icon="pi pi-plus"
                                        onClick={() => setVisible(true)}
                                        className="shadow-2"
                                    />
                                </div>
                            }
                        >
                            <Column field="nom" header="Nom du DN" body={nomTemplate} sortable style={{ minWidth: "250px" }} />
                            <Column field="path" header="Chemin LDAP" body={pathTemplate} sortable style={{ minWidth: "300px" }} />
                            <Column header="Utilisateurs affectés" body={usersTemplate} style={{ minWidth: "280px" }} />
                            <Column header="Actions" body={actionsTemplate} style={{ width: "130px" }} />
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
                style={{ width: "600px" }}
                className="modern-dialog"
            >
                <div className="p-5">
                    <div className="text-center mb-5">
                        <div
                            className="inline-flex align-items-center justify-content-center border-circle mb-3 shadow-4"
                            style={{
                                width: "90px",
                                height: "90px",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            }}
                        >
                            <i className="pi pi-plus text-white" style={{ fontSize: "2.5rem" }}></i>
                        </div>
                        <h2 className="text-900 font-bold text-3xl mb-2">Nouveau DN</h2>
                        <p className="text-600 text-lg">Créez un nouveau Distinguished Name pour votre système</p>
                    </div>

                    <div className="flex flex-column gap-4 mb-5">
                        <div>
                            <label className="block text-900 font-bold mb-3 text-base">
                                <i className="pi pi-tag mr-2"></i>Nom du DN
                            </label>
                            <InputText
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                placeholder="Ex: Direction IT"
                                className="w-full"
                                style={{ height: "55px", fontSize: "1.1rem" }}
                            />
                        </div>
                        <div>
                            <label className="block text-900 font-bold mb-3 text-base">
                                <i className="pi pi-map-marker mr-2"></i>Chemin LDAP
                            </label>
                            <InputText
                                value={path}
                                onChange={(e) => setPath(e.target.value)}
                                placeholder="Ex: OU=IT,DC=company,DC=com"
                                className="w-full font-mono"
                                style={{ height: "55px", fontSize: "1rem" }}
                            />
                            <small className="text-600 block mt-2 ml-1">
                                <i className="pi pi-info-circle mr-1"></i>
                                Respectez le format LDAP standard
                            </small>
                        </div>
                    </div>

                    <Divider />

                    <div className="flex gap-3 mt-4">
                        <Button
                            label="Annuler"
                            outlined
                            severity="secondary"
                            onClick={() => setVisible(false)}
                            className="flex-1 font-semibold"
                            style={{ height: "55px" }}
                            disabled={isSubmitting}
                        />
                        <Button
                            label={isSubmitting ? "Création..." : "Créer le DN"}
                            onClick={createDn}
                            className="flex-1 font-bold"
                            style={{
                                height: "55px",
                                background: "linear-gradient(135deg, #667eea, #764ba2)",
                                border: "none"
                            }}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            </Dialog>

            {/* Dialog d'édition avancée avec gestion des utilisateurs */}
            <Dialog
                visible={editDialog.visible}
                onHide={() => setEditDialog({ visible: false, dn: null, selectedUsers: [] })}
                modal
                dismissableMask
                style={{ width: "700px" }}
                className="modern-dialog"
            >
                <div className="p-5">
                    <div className="text-center mb-5">
                        <div
                            className="inline-flex align-items-center justify-content-center border-circle mb-3 shadow-4"
                            style={{
                                width: "90px",
                                height: "90px",
                                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                            }}
                        >
                            <i className="pi pi-pencil text-white" style={{ fontSize: "2.5rem" }}></i>
                        </div>
                        <h2 className="text-900 font-bold text-2xl mb-2">Modifier le DN</h2>
                        <p className="text-600 text-lg">Modifiez les informations et gérez les affectations</p>
                    </div>

                    {editDialog.dn && (
                        <>
                            <div className="surface-50 border-round-xl p-4 mb-4">
                                <h3 className="text-900 font-bold mb-3 flex align-items-center gap-2">
                                    <i className="pi pi-cog text-primary"></i>
                                    Informations du DN
                                </h3>
                                <div className="flex flex-column gap-4">
                                    <div>
                                        <label className="block text-900 font-semibold mb-2">Nom du DN</label>
                                        <InputText
                                            value={editDialog.dn.nom}
                                            onChange={(e) => setEditDialog({
                                                ...editDialog,
                                                dn: { ...editDialog.dn, nom: e.target.value }
                                            })}
                                            className="w-full"
                                            style={{ height: "50px" }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-900 font-semibold mb-2">Chemin LDAP</label>
                                        <InputText
                                            value={editDialog.dn.path}
                                            onChange={(e) => setEditDialog({
                                                ...editDialog,
                                                dn: { ...editDialog.dn, path: e.target.value }
                                            })}
                                            className="w-full font-mono"
                                            style={{ height: "50px" }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="surface-100 border-round-xl p-4 mb-4">
                                <h3 className="text-900 font-bold mb-3 flex align-items-center gap-2">
                                    <i className="pi pi-users text-primary"></i>
                                    Gestion des utilisateurs
                                </h3>
                                <MultiSelect
                                    value={editDialog.selectedUsers}
                                    options={users.map(u => ({ label: u.name, value: u.id }))}
                                    onChange={(e) => setEditDialog({
                                        ...editDialog,
                                        selectedUsers: e.value
                                    })}
                                    placeholder="Sélectionner les utilisateurs"
                                    display="chip"
                                    className="w-full"
                                    filter
                                    showSelectAll
                                />
                                <div className="flex align-items-center gap-2 mt-3 p-3 bg-blue-50 border-round-lg">
                                    <i className="pi pi-info-circle text-blue-600"></i>
                                    <small className="text-blue-900">
                                        <strong>{editDialog.selectedUsers.length}</strong> utilisateur(s) sélectionné(s). 
                                        Les utilisateurs non sélectionnés seront désaffectés.
                                    </small>
                                </div>
                            </div>
                        </>
                    )}

                    <Divider />

                    <div className="flex gap-3 mt-4">
                        <Button
                            label="Annuler"
                            outlined
                            severity="secondary"
                            onClick={() => setEditDialog({ visible: false, dn: null, selectedUsers: [] })}
                            className="flex-1 font-semibold"
                            style={{ height: "55px" }}
                            disabled={isSubmitting}
                        />
                        <Button
                            label={isSubmitting ? "Enregistrement..." : "Enregistrer"}
                            onClick={confirmUpdate}
                            severity="warning"
                            className="flex-1 font-bold"
                            style={{ height: "55px" }}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            </Dialog>

            {/* Dialog de confirmation suppression */}
            <Dialog
                visible={confirmDialog.visible && confirmDialog.type === 'delete'}
                onHide={() => setConfirmDialog({ visible: false, type: null, data: null })}
                modal
                dismissableMask
                style={{ width: "550px" }}
                className="modern-dialog"
            >
                <div className="p-5">
                    <div className="text-center mb-4">
                        <div
                            className="inline-flex align-items-center justify-content-center border-circle mb-3 shadow-4"
                            style={{
                                width: "90px",
                                height: "90px",
                                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                            }}
                        >
                            <i className="pi pi-trash text-white" style={{ fontSize: "2.5rem" }}></i>
                        </div>
                        <h2 className="text-900 font-bold text-3xl mb-2">Confirmer la suppression</h2>
                        <p className="text-600 text-lg">Cette action est irréversible</p>
                    </div>

                    {confirmDialog.data && (
                        <>
                            <div className="p-4 bg-red-50 border-round-xl mb-4 border-2 border-red-200">
                                <div className="flex align-items-center gap-3 mb-3">
                                    <i className="pi pi-folder text-red-600 text-xl"></i>
                                    <span className="font-bold text-900 text-xl">{confirmDialog.data.nom}</span>
                                </div>
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-link text-red-600"></i>
                                    <code className="text-600">{confirmDialog.data.path}</code>
                                </div>
                            </div>

                            <div className="p-4 bg-orange-50 border-round-xl border-1 border-orange-200">
                                <div className="flex align-items-start gap-3">
                                    <i className="pi pi-exclamation-triangle text-orange-600 text-2xl mt-1"></i>
                                    <div>
                                        <div className="font-bold text-orange-900 mb-2 text-lg">Attention !</div>
                                        <ul className="text-orange-700 m-0 pl-4">
                                            <li>Le DN sera définitivement supprimé</li>
                                            <li>Toutes les affectations utilisateurs seront perdues</li>
                                            <li>Cette action ne peut pas être annulée</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <Divider />

                    <div className="flex gap-3 mt-4">
                        <Button
                            label="Annuler"
                            outlined
                            severity="secondary"
                            onClick={() => setConfirmDialog({ visible: false, type: null, data: null })}
                            className="flex-1 font-semibold"
                            style={{ height: "55px" }}
                            disabled={isSubmitting}
                        />
                        <Button
                            label={isSubmitting ? "Suppression..." : "Supprimer"}
                            onClick={confirmDelete}
                            severity="danger"
                            className="flex-1 font-bold"
                            style={{ height: "55px" }}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            </Dialog>

            {/* Dialog de confirmation affectation */}
            <Dialog
                visible={confirmDialog.visible && confirmDialog.type === 'assign'}
                onHide={() => setConfirmDialog({ visible: false, type: null, data: null })}
                modal
                dismissableMask
                style={{ width: "600px" }}
                className="modern-dialog"
            >
                <div className="p-5">
                    <div className="text-center mb-4">
                        <div
                            className="inline-flex align-items-center justify-content-center border-circle mb-3 shadow-4"
                            style={{
                                width: "90px",
                                height: "90px",
                                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            }}
                        >
                            <i className="pi pi-user-plus text-white" style={{ fontSize: "2.5rem" }}></i>
                        </div>
                        <h2 className="text-900 font-bold text-3xl mb-2">Confirmer l'affectation</h2>
                        <p className="text-600 text-lg">Vérifiez les informations avant de continuer</p>
                    </div>

                    {confirmDialog.data && (
                        <div className="surface-100 border-round-xl p-4">
                            <div className="flex align-items-center gap-3 mb-4 pb-4 border-bottom-1 surface-border">
                                <div 
                                    className="inline-flex align-items-center justify-content-center border-circle"
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        background: "linear-gradient(135deg, #dbeafe, #bfdbfe)"
                                    }}
                                >
                                    <i className="pi pi-user text-primary text-xl"></i>
                                </div>
                                <div>
                                    <div className="text-500 text-sm mb-1">Utilisateur</div>
                                    <div className="text-900 font-bold text-xl">{confirmDialog.data.user?.name}</div>
                                </div>
                            </div>
                            <div className="flex align-items-start gap-3">
                                <div 
                                    className="inline-flex align-items-center justify-content-center border-circle"
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        background: "linear-gradient(135deg, #dbeafe, #bfdbfe)"
                                    }}
                                >
                                    <i className="pi pi-sitemap text-primary text-xl"></i>
                                </div>
                                <div className="flex-1">
                                    <div className="text-500 text-sm mb-2">
                                        DNs à affecter ({confirmDialog.data.dns?.length})
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {confirmDialog.data.dns?.map((dn, idx) => (
                                            <Tag
                                                key={idx}
                                                value={dn.nom}
                                                severity="info"
                                                icon="pi pi-check-circle"
                                                className="shadow-1"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <Divider />

                    <div className="flex gap-3 mt-4">
                        <Button
                            label="Annuler"
                            outlined
                            severity="secondary"
                            onClick={() => setConfirmDialog({ visible: false, type: null, data: null })}
                            className="flex-1 font-semibold"
                            style={{ height: "55px" }}
                            disabled={isSubmitting}
                        />
                        <Button
                            label={isSubmitting ? "Affectation..." : "Confirmer"}
                            onClick={confirmAssign}
                            severity="success"
                            className="flex-1 font-bold"
                            style={{ height: "55px" }}
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
                style={{ width: "600px" }}
                className="modern-dialog"
            >
                <div className="p-5">
                    <div className="text-center mb-4">
                        <div
                            className="inline-flex align-items-center justify-content-center border-circle mb-3 animate-success shadow-5"
                            style={{
                                width: "100px",
                                height: "100px",
                                background: successDialog.type === 'delete'
                                    ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                                    : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            }}
                        >
                            <i className="pi pi-check text-white" style={{ fontSize: "3.5rem" }}></i>
                        </div>
                        <h2 className="text-900 font-bold text-3xl mb-2">
                            {successDialog.type === 'delete' ? 'DN supprimé !' :
                                successDialog.type === 'assign' ? 'DNs affectés !' :
                                    'DN mis à jour !'}
                        </h2>
                        <p className="text-600 text-xl">
                            {successDialog.type === 'delete' ? 'Le DN a été supprimé avec succès' :
                                successDialog.type === 'assign' ? 'Les DNs ont été affectés à l\'utilisateur' :
                                    'Les modifications ont été enregistrées'}
                        </p>
                    </div>

                    <Divider />

                    {successDialog.type === 'delete' && successDialog.data && (
                        <div className="surface-100 border-round-xl p-4 mb-4">
                            <div className="flex align-items-center gap-3 mb-3">
                                <i className="pi pi-folder text-red-600 text-2xl"></i>
                                <div>
                                    <div className="text-500 text-sm mb-1">DN supprimé</div>
                                    <div className="text-900 font-bold text-xl">{successDialog.data.nom}</div>
                                </div>
                            </div>
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-link text-red-600 text-xl"></i>
                                <code className="text-600">{successDialog.data.path}</code>
                            </div>
                        </div>
                    )}

                    {successDialog.type === 'edit' && successDialog.data && (
                        <div className="surface-100 border-round-xl p-4 mb-4">
                            <div className="flex align-items-center gap-3 mb-4 pb-3 border-bottom-1 surface-border">
                                <i className="pi pi-folder text-primary text-2xl"></i>
                                <div>
                                    <div className="text-500 text-sm mb-1">DN modifié</div>
                                    <div className="text-900 font-bold text-xl">{successDialog.data.nom}</div>
                                </div>
                            </div>
                            {successDialog.data.users && successDialog.data.users.length > 0 && (
                                <div className="flex align-items-start gap-3">
                                    <i className="pi pi-users text-primary text-2xl mt-1"></i>
                                    <div className="flex-1">
                                        <div className="text-500 text-sm mb-2">
                                            Utilisateurs affectés ({successDialog.data.users.length})
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {successDialog.data.users.map((user, idx) => (
                                                <Tag
                                                    key={idx}
                                                    value={user.name}
                                                    severity="success"
                                                    icon="pi pi-check"
                                                    className="shadow-1"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {successDialog.type === 'assign' && successDialog.data && (
                        <div className="surface-100 border-round-xl p-4 mb-4">
                            <div className="flex align-items-center gap-3 mb-4 pb-3 border-bottom-1 surface-border">
                                <div 
                                    className="inline-flex align-items-center justify-content-center border-circle"
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        background: "linear-gradient(135deg, #dbeafe, #bfdbfe)"
                                    }}
                                >
                                    <i className="pi pi-user text-primary text-xl"></i>
                                </div>
                                <div>
                                    <div className="text-500 text-sm mb-1">Utilisateur</div>
                                    <div className="text-900 font-bold text-xl">{successDialog.data.user?.name}</div>
                                </div>
                            </div>
                            <div className="flex align-items-start gap-3">
                                <div 
                                    className="inline-flex align-items-center justify-content-center border-circle"
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        background: "linear-gradient(135deg, #dbeafe, #bfdbfe)"
                                    }}
                                >
                                    <i className="pi pi-sitemap text-primary text-xl"></i>
                                </div>
                                <div className="flex-1">
                                    <div className="text-500 text-sm mb-2">
                                        DNs affectés ({successDialog.data.dns?.length})
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {successDialog.data.dns?.map((dn, idx) => (
                                            <Tag
                                                key={idx}
                                                value={dn.nom}
                                                severity="success"
                                                icon="pi pi-check"
                                                className="shadow-1"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={`p-4 border-round-xl mb-4 ${
                        successDialog.type === 'delete' ? 'bg-red-50 border-1 border-red-200' : 'bg-green-50 border-1 border-green-200'
                    }`}>
                        <div className="flex align-items-start gap-3">
                            <i className={`pi pi-check-circle text-2xl mt-1`}
                               style={{ color: successDialog.type === 'delete' ? '#dc2626' : '#059669' }}></i>
                            <div>
                                <div className="font-bold mb-1" style={{ 
                                    color: successDialog.type === 'delete' ? '#991b1b' : '#065f46' 
                                }}>
                                    Opération réussie
                                </div>
                                <small style={{ 
                                    color: successDialog.type === 'delete' ? '#991b1b' : '#065f46' 
                                }}>
                                    {successDialog.type === 'delete' 
                                        ? 'Le DN et toutes ses affectations ont été supprimés de la base de données.'
                                        : successDialog.type === 'assign'
                                            ? 'Les DNs ont été correctement assignés à l\'utilisateur sélectionné.'
                                            : 'Le DN a été mis à jour avec les nouvelles affectations utilisateurs.'}
                                </small>
                            </div>
                        </div>
                    </div>

                    <Button
                        label="Ok !"
                        onClick={() => setSuccessDialog({ visible: false, type: null, data: null })}
                        severity={successDialog.type === 'delete' ? 'danger' : 'success'}
                        className="w-full font-bold shadow-3"
                        style={{
                            height: "60px",
                            fontSize: "1.15rem",
                        }}
                    />
                </div>
            </Dialog>

            <style jsx>{`
                .modern-datatable :global(.p-datatable-thead > tr > th) {
                    background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
                    color: #111827;
                    font-weight: 700;
                    font-size: 0.95rem;
                    padding: 1.25rem 1rem;
                    border-bottom: 2px solid #d1d5db;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .modern-datatable :global(.p-datatable-tbody > tr) {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border-bottom: 1px solid #f3f4f6;
                }

                .modern-datatable :global(.p-datatable-tbody > tr:hover) {
                    background: linear-gradient(135deg, #faf5ff, #f3e8ff) !important;
                    transform: translateX(4px);
                    box-shadow: -4px 0 0 0 #8b5cf6, 0 2px 8px rgba(139, 92, 246, 0.1);
                }

                .modern-datatable :global(.p-datatable-tbody > tr > td) {
                    padding: 1.25rem 1rem;
                    vertical-align: middle;
                }

                :global(.modern-dialog .p-dialog-content) {
                    padding: 0 !important;
                    border-radius: 20px;
                    overflow: hidden;
                }

                :global(.modern-dialog .p-dialog-header) {
                    display: none;
                }

                :global(.hover-lift) {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                :global(.hover-lift:hover) {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.25) !important;
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes pulse-success {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                }

                .animate-success {
                    animation: pulse-success 0.6s ease-in-out;
                }

                :global(.p-chip) {
                    font-weight: 600;
                    padding: 0.5rem 0.85rem;
                    border-radius: 8px;
                }

                :global(.p-tag) {
                    font-weight: 600;
                    padding: 0.45rem 0.8rem;
                    border-radius: 8px;
                }

                :global(.p-button) {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                :global(.p-multiselect-panel .p-multiselect-items .p-multiselect-item) {
                    padding: 0.75rem 1rem;
                    font-size: 0.95rem;
                }

                :global(.p-dropdown-panel .p-dropdown-items .p-dropdown-item) {
                    padding: 0.75rem 1rem;
                    font-size: 0.95rem;
                }

                :global(.p-inputtext) {
                    border-radius: 10px;
                    border: 2px solid #e5e7eb;
                    transition: all 0.3s ease;
                }

                :global(.p-inputtext:focus) {
                    border-color: #8b5cf6;
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
                }

                :global(.p-multiselect),
                :global(.p-dropdown) {
                    border-radius: 10px;
                    border: 2px solid #e5e7eb;
                }

                :global(.p-multiselect:not(.p-disabled):hover),
                :global(.p-dropdown:not(.p-disabled):hover) {
                    border-color: #8b5cf6;
                }

                :global(.p-multiselect.p-focus),
                :global(.p-dropdown.p-focus) {
                    border-color: #8b5cf6;
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
                }
            `}</style>
        </Layout>
    );
}