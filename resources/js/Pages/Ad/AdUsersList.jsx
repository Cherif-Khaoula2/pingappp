import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import Layout from '@/Layouts/layout/layout.jsx';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import axios from 'axios';

export default function AdUsersList() {
    const { props } = usePage();
    const users = props.users || [];
    const ouDn = props.ou_dn;
    const error = props.error;
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(users);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(25);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [targetOuDn, setTargetOuDn] = useState('');
    const [loading, setLoading] = useState(false);
    const ous = props.ous || [];

    const handleMoveUsers = async () => {
        if (!selectedUsers.length || !targetOuDn) return;

        if (!confirm(`Voulez-vous déplacer ${selectedUsers.length} utilisateur(s) ?`)) return;

        setLoading(true);
        try {
            const usersDn = selectedUsers.map(user => user.DistinguishedName);
            
            await axios.post('/ad/move-user', {
                users_dn: usersDn,
                target_ou_dn: targetOuDn,
            });

            alert(`${selectedUsers.length} utilisateur(s) déplacé(s) avec succès !`);
            location.reload();
        } catch (err) {
            alert('Erreur lors du déplacement : ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter((user) =>
                user.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.SamAccountName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.EmailAddress?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchTerm, users]);

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    const nameTemplate = (rowData) => (
        <div className="flex align-items-center gap-3">
            <div className="flex align-items-center justify-content-center bg-primary-100 text-primary-700 border-circle" 
                 style={{ width: '42px', height: '42px', fontWeight: 'bold' }}>
                {(rowData.Name || rowData.SamAccountName).charAt(0).toUpperCase()}
            </div>
            <div>
                <div className="font-semibold text-900 text-lg mb-1">
                    {rowData.Name || rowData.SamAccountName}
                </div>
                <div className="text-sm text-600 flex align-items-center gap-1">
                    <i className="pi pi-user text-xs"></i>
                    {rowData.SamAccountName}
                </div>
            </div>
        </div>
    );

    const emailTemplate = (rowData) => rowData.EmailAddress ? (
        <div className="flex align-items-center gap-2">
            <i className="pi pi-envelope text-primary"></i>
            <span className="text-900">{rowData.EmailAddress}</span>
        </div>
    ) : (
        <span className="text-500 italic">Pas d'email</span>
    );

    const ouOptions = ous.map(o => ({
        label: o.Name,
        value: o.DistinguishedName
    }));

    const header = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
            <div className="flex align-items-center gap-2">
                <i className="pi pi-users text-3xl text-primary"></i>
                <div>
                    <h2 className="text-2xl font-bold text-900 m-0">Utilisateurs Active Directory</h2>
                    <p className="text-600 m-0 mt-1">{ouDn || 'Tous les utilisateurs'}</p>
                </div>
            </div>
            <div className="flex align-items-center gap-2">
                <Tag value={`${filteredUsers.length} utilisateur${filteredUsers.length > 1 ? 's' : ''}`} 
                     severity="info" 
                     icon="pi pi-users" />
            </div>
        </div>
    );

    return (
        <Layout>
            <Head title={`Utilisateurs - ${ouDn || 'OU'}`} />
            <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
                <div className="grid">
                    <div className="col-12">
                        <Card className="shadow-3 border-round-xl">
                            {header}
                            
                            {error && (
                                <Message 
                                    severity="error" 
                                    text={error} 
                                    style={{ width: '100%' }} 
                                    className="mb-4" 
                                />
                            )}

                            {/* Barre de recherche */}
                            <div className="mb-4">
                                <span className="p-input-icon-left w-full md:w-20rem">
                                    <i className="pi pi-search" />
                                    <InputText
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Rechercher un utilisateur..."
                                        className="w-full"
                                    />
                                </span>
                            </div>

                            {/* Actions de déplacement */}
                            <Card className="bg-blue-50 border-blue-200 mb-4">
                                <div className="flex flex-wrap align-items-end gap-3">
                                    <div className="flex-1" style={{ minWidth: '250px' }}>
                                        <label className="block mb-2 font-semibold text-900">
                                            <i className="pi pi-folder-open mr-2"></i>
                                            OU de destination
                                        </label>
                                        <Dropdown
                                            value={targetOuDn}
                                            onChange={(e) => setTargetOuDn(e.value)}
                                            options={ouOptions}
                                            placeholder="Sélectionner une OU cible"
                                            filter
                                            className="w-full"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="flex align-items-center gap-2">
                                        {selectedUsers.length > 0 && (
                                            <Tag 
                                                value={`${selectedUsers.length} sélectionné${selectedUsers.length > 1 ? 's' : ''}`}
                                                severity="warning"
                                                icon="pi pi-check-circle"
                                            />
                                        )}
                                        <Button
                                            label="Déplacer"
                                            icon="pi pi-arrow-right"
                                            severity="success"
                                            onClick={handleMoveUsers}
                                            disabled={!selectedUsers.length || !targetOuDn || loading}
                                            loading={loading}
                                            className="px-4"
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Table des utilisateurs */}
                            <DataTable
                                value={filteredUsers}
                                stripedRows
                                paginator
                                rows={rows}
                                first={first}
                                onPage={onPageChange}
                                rowsPerPageOptions={[25, 50, 100, 200]}
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} utilisateurs"
                                paginatorClassName="custom-paginator"
                                responsiveLayout="scroll"
                                className="custom-datatable"
                                selectionMode="checkbox"
                                selection={selectedUsers}
                                onSelectionChange={(e) => setSelectedUsers(e.value)}
                                dataKey="DistinguishedName"
                                emptyMessage="Aucun utilisateur trouvé"
                            >
                                <Column 
                                    selectionMode="multiple" 
                                    headerStyle={{ width: '3rem' }}
                                    frozen
                                />
                                <Column 
                                    field="Name" 
                                    header="Utilisateur" 
                                    body={nameTemplate} 
                                    sortable 
                                    style={{ minWidth: '300px' }}
                                    frozen
                                />
                                <Column 
                                    field="EmailAddress" 
                                    header="Email" 
                                    body={emailTemplate} 
                                    sortable 
                                    style={{ minWidth: '280px' }} 
                                />
                            </DataTable>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
}