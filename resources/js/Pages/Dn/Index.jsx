import React, { useState, useRef } from 'react';
import { router ,Head} from '@inertiajs/react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import Layout from "@/Layouts/layout/layout.jsx";

export default function DnIndex({ dns, users }) {
    const [nom, setNom] = useState('');
    const [path, setPath] = useState('');
    const [visible, setVisible] = useState(false);
    const [editVisible, setEditVisible] = useState(false);
    const [selectedDn, setSelectedDn] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedDns, setSelectedDns] = useState([]);
    const toast = useRef(null);

    // ✅ Notifications
    const showSuccess = (msg) => toast.current.show({ severity: 'success', summary: 'Succès', detail: msg, life: 3000 });
    const showError = (msg) => toast.current.show({ severity: 'error', summary: 'Erreur', detail: msg, life: 3000 });

    // ✅ Création
    const createDn = () => {
        if (!nom || !path) return showError('Veuillez remplir tous les champs.');
        router.post('/dns', { nom, path }, {
            onSuccess: () => {
                showSuccess('DN ajouté avec succès.');
                setNom('');
                setPath('');
                setVisible(false);
            },
        });
    };

    // ✅ Mise à jour
    const updateDn = () => {
        if (!selectedDn) return;
        router.put(`/dns/${selectedDn.id}`, { nom: selectedDn.nom, path: selectedDn.path }, {
            onSuccess: () => {
                showSuccess('DN mis à jour avec succès.');
                setEditVisible(false);
            },
        });
    };

    // ✅ Affectation
    const assignDns = () => {
        if (!selectedUser || selectedDns.length === 0) return showError('Veuillez sélectionner un utilisateur et au moins un DN.');
        router.post('/dns/assign', { user_id: selectedUser, dn_ids: selectedDns }, {
            onSuccess: () => showSuccess('DNs affectés avec succès.'),
        });
    };

    return (
        <Layout>
            <Head title="Périmètre Administrateur" />
            <Toast ref={toast} />
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-semibold text-blue-700 mb-2">Gestion des DNs</h1>
                <p className="text-gray-500 mb-4">Créez, modifiez et assignez des DNs à vos utilisateurs en toute simplicité.</p>

                {/* Bouton d'ajout */}
                <div className="flex justify-end">
                    <Button 
                        label="Ajouter un DN" 
                        icon="pi pi-plus" 
                        className="bg-blue-600 border-none hover:bg-blue-700 transition-all"
                        onClick={() => setVisible(true)} 
                    />
                </div>

                {/* Table des DNs */}
                <Card className="mt-4 shadow-lg border-0 rounded-2xl">
                    <h2 className="text-xl font-medium text-gray-700 mb-3">Liste des DNs</h2>
                    <DataTable 
                        value={dns} 
                        paginator rows={6} 
                        stripedRows 
                        responsiveLayout="scroll" 
                        className="rounded-xl overflow-hidden"
                    >
                        <Column field="id" header="ID" sortable></Column>
                        <Column field="nom" header="Nom" sortable></Column>
                        <Column field="path" header="Chemin" sortable></Column>
                        <Column
                            header="Utilisateurs"
                            body={(row) => (
                                <span className="text-gray-600">
                                    {row.users?.map(u => u.name).join(', ') || '—'}
                                </span>
                            )}
                        />
                        <Column
                            header="Actions"
                            body={(row) => (
                                <Button
                                    icon="pi pi-pencil"
                                    rounded
                                    outlined
                                    tooltip="Modifier"
                                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                    onClick={() => {
                                        setSelectedDn({ ...row });
                                        setEditVisible(true);
                                    }}
                                />
                            )}
                        />
                    </DataTable>
                </Card>

                {/* Affectation */}
                <Card className="shadow-lg border-0 rounded-2xl">
                    <h2 className="text-xl font-medium text-gray-700 mb-4">Affecter des DNs à un utilisateur</h2>
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <Dropdown
                            value={selectedUser}
                            options={users.map(u => ({ label: u.name, value: u.id }))}
                            onChange={(e) => setSelectedUser(e.value)}
                            placeholder="Choisir un utilisateur"
                            className="w-full md:w-3"
                        />
                        <MultiSelect
                            value={selectedDns}
                            options={dns.map(d => ({ label: `${d.nom} (${d.path})`, value: d.id }))}
                            onChange={(e) => setSelectedDns(e.value)}
                            placeholder="Choisir un ou plusieurs DNs"
                            display="chip"
                            className="w-full md:w-6"
                        />
                        <Button 
                            label="Affecter" 
                            icon="pi pi-user-plus" 
                            className="bg-green-600 border-none hover:bg-green-700 transition-all"
                            onClick={assignDns} 
                        />
                    </div>
                </Card>

                {/* Dialog d'ajout */}
                <Dialog 
                    header="Ajouter un DN" 
                    visible={visible} 
                    style={{ width: '30rem' }} 
                    modal 
                    className="rounded-xl"
                    onHide={() => setVisible(false)}
                    footer={
                        <div className="flex justify-end gap-2">
                            <Button label="Annuler" className="p-button-text" onClick={() => setVisible(false)} />
                            <Button label="Enregistrer" icon="pi pi-check" className="bg-blue-600 border-none hover:bg-blue-700" onClick={createDn} />
                        </div>
                    }
                >
                    <div className="flex flex-col gap-4 mt-2">
                        <span className="p-float-label">
                            <InputText id="nom" value={nom} onChange={(e) => setNom(e.target.value)} className="w-full" />
                            <label htmlFor="nom">Nom du DN</label>
                        </span>
                        <span className="p-float-label">
                            <InputText id="path" value={path} onChange={(e) => setPath(e.target.value)} className="w-full" />
                            <label htmlFor="path">Chemin du DN</label>
                        </span>
                    </div>
                </Dialog>

                {/* Dialog modification */}
                <Dialog 
                    header="Modifier le DN" 
                    visible={editVisible} 
                    style={{ width: '30rem' }} 
                    modal 
                    className="rounded-xl"
                    onHide={() => setEditVisible(false)}
                    footer={
                        <div className="flex justify-end gap-2">
                            <Button label="Annuler" className="p-button-text" onClick={() => setEditVisible(false)} />
                            <Button label="Mettre à jour" icon="pi pi-save" className="bg-blue-600 border-none hover:bg-blue-700" onClick={updateDn} />
                        </div>
                    }
                >
                    {selectedDn && (
                        <div className="flex flex-col gap-4 mt-2">
                            <span className="p-float-label">
                                <InputText
                                    id="editNom"
                                    value={selectedDn.nom}
                                    onChange={(e) => setSelectedDn({ ...selectedDn, nom: e.target.value })}
                                    className="w-full"
                                />
                                <label htmlFor="editNom">Nom du DN</label>
                            </span>
                            <span className="p-float-label">
                                <InputText
                                    id="editPath"
                                    value={selectedDn.path}
                                    onChange={(e) => setSelectedDn({ ...selectedDn, path: e.target.value })}
                                    className="w-full"
                                />
                                <label htmlFor="editPath">Chemin du DN</label>
                            </span>
                        </div>
                    )}
                </Dialog>
            </div>
        </Layout>
    );
}
