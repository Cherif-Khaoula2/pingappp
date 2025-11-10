
import React, { useState, useEffect } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
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
    const [selectedUsersDn, setSelectedUsersDn] = useState([]); // tableau pour plusieurs DN
    const [targetOuDn, setTargetOuDn] = useState('');
    const ous = props.ous || [];

    const handleMoveUsers = async () => {
        if (!selectedUsersDn.length || !targetOuDn) return;

        if (!confirm(`Voulez-vous déplacer ${selectedUsersDn.length} utilisateur(s) ?`)) return;

        try {
            
                await axios.post('/ad/move-user', {
                users_dn: selectedUsersDn,
                target_ou_dn: targetOuDn,
            });

            alert(`${selectedUsersDn.length} utilisateur(s) déplacé(s) avec succès !`);

            // Optionnel : recharger la liste des utilisateurs
            location.reload();
        } catch (err) {
            alert('Erreur lors du déplacement : ' + (err.response?.data?.message || err.message));
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
            <div>
                <div className="font-semibold text-900 text-lg">{rowData.Name || rowData.SamAccountName}</div>
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

    return (
        <Layout>
            <Head title={`Utilisateurs - ${ouDn || 'OU'}`} />
            <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
                <div className="grid">
                    <div className="col-12">
                        <Card className="shadow-3 border-round-xl">
                            {error && <Message severity="error" text={error} style={{ width: '100%' }} className="mb-4" />}

                            <div className="flex flex-wrap gap-3 mb-4">
                                <div>
                                    <label className="block mb-1 font-semibold">OU cible</label>
                                    <select
                                        className="border p-2 rounded"
                                        value={targetOuDn}
                                        onChange={e => setTargetOuDn(e.target.value)}
                                    >
                                        <option value="">-- Sélectionner OU cible --</option>
                                        {ous.map(o => (
                                            <option key={o.DistinguishedName} value={o.DistinguishedName}>
                                                {o.Name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        label={`Déplacer (${selectedUsersDn.length})`}
                                        severity="success"
                                        onClick={handleMoveUsers}
                                        disabled={!selectedUsersDn.length || !targetOuDn}
                                    />
                                </div>
                            </div>

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
                                selectionMode="checkbox" // ✅ mode sélection multiple
                                selection={selectedUsersDn}
                                onSelectionChange={e => setSelectedUsersDn(e.value.map(u => u.DistinguishedName))}
                                dataKey="DistinguishedName"
                            >
                                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                                <Column field="Name" header="Utilisateur" body={nameTemplate} sortable style={{ minWidth: '280px' }} />
                                <Column field="EmailAddress" header="Email" body={emailTemplate} sortable style={{ minWidth: '250px' }} />
                            </DataTable>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
