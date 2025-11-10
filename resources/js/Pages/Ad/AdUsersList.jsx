import React, { useState, useEffect } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import Layout from '@/Layouts/layout/layout.jsx';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function AdUsersList() {
    const { props } = usePage();
    const users = props.users || [];
    const ouDn = props.ou_dn;
    const error = props.error;
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(users);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(25);
    const [selectedUserDn, setSelectedUserDn] = useState('');
const [targetOuDn, setTargetOuDn] = useState('');
const ous = props.ous || []; // liste des OU que tu passes depuis Laravel
const handleMoveUser = async () => {
    if (!selectedUserDn || !targetOuDn) return;
console.log(selectedUserDn)
console.log(targetOuDn)
    if (!confirm("Voulez-vous vraiment déplacer cet utilisateur ?")) return;

    try {
        await axios.post('/ad/move-user', {
            user_dn: selectedUserDn,
            target_ou_dn: targetOuDn,
        });

        alert('Utilisateur déplacé avec succès !');

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

    const nameTemplate = (rowData) => {
        return (
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
    };

    const emailTemplate = (rowData) => {
        return rowData.EmailAddress ? (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-envelope text-primary"></i>
                <span className="text-900">{rowData.EmailAddress}</span>
            </div>
        ) : (
            <span className="text-500 italic">Pas d'email</span>
        );
    };


    return (
        <Layout>
            <Head title={`Utilisateurs - ${ouDn || 'OU'}`} />

            <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
                <div className="grid">
                    <div className="col-12">
                        <Card className="shadow-3 border-round-xl">
                            {error ? (
                                <Message
                                    severity="error"
                                    text={error}
                                    style={{ width: '100%' }}
                                    className="mb-4"
                                />
                            ) : null}
<div className="flex flex-wrap gap-3 mb-4">
    <div>
        <label className="block mb-1 font-semibold">Utilisateur à déplacer</label>
        <select 
            className="border p-2 rounded"
            value={selectedUserDn}
            onChange={e => setSelectedUserDn(e.target.value)}
        >
            <option value="">-- Sélectionner utilisateur --</option>
            {filteredUsers.map(u => (
                <option key={u.DistinguishedName} value={u.DistinguishedName}>
                    u.Name
                </option>
                
            ))}
        </select>
    </div>

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
            label="Déplacer"
            severity="success"
            onClick={handleMoveUser}
            disabled={!selectedUserDn || !targetOuDn}
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
                                header={
                                    <div className="flex flex-column gap-4">
                                        <div className="flex align-items-center justify-content-between gap-3">
                                            <div className="flex align-items-center gap-3">
                                                <div
                                                    className="flex align-items-center justify-content-center border-circle"
                                                
                                                >
                                                </div>
                                                <div className="flex-1">
                                                    <h1 className="text-900 text-3xl font-bold m-0 mb-1">
                                                        Utilisateurs de l'Unité Organisationnelle
                                                    </h1>
                                                    <p className="text-600 m-0 text-lg">
                                                        {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} dans cette OU
                                                    </p>
                                                </div>
                                            </div>
                                            <Link href="/ad/ou-page">
                                                <Button
                                        
                                                    label="Retour aux OUs"
                                                    outlined
                                                    severity="secondary"
                                                    className="custom-back-btn"
                                                    style={{ 
                                                        height: '48px',
                                                        fontWeight: '600',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                />
                                            </Link>
                                        </div>

                                        {/* Distinguished Name de l'OU */}
                                        {ouDn && (
                                            <div className="p-3 bg-blue-50 border-round-lg border-1 border-blue-200">
                                                <div className="flex align-items-start gap-2">
                                                    <i className="pi pi-sitemap text-blue-600 mt-1"></i>
                                                    <div className="flex-1">
                                                        <div className="text-blue-700 font-semibold mb-1 text-sm">Distinguished Name</div>
                                                        <div className="text-900 font-mono text-sm break-all">{ouDn}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Barre de recherche */}
                                        <div className="p-inputgroup" style={{ height: '52px' }}>
                                            <span
                                                className="p-inputgroup-addon"
                                                style={{
                                                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                                    border: 'none',
                                                }}
                                            >
                                                <i className="pi pi-search text-white"></i>
                                            </span>
                                            <InputText
                                                placeholder="Rechercher un utilisateur (nom, samaccountname, email)..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                style={{ height: '52px', fontSize: '1.05rem' }}
                                            />
                                            {searchTerm && (
                                                <Button
                                                    icon="pi pi-times"
                                                    className="p-button-text"
                                                    onClick={() => setSearchTerm('')}
                                                    tooltip="Effacer"
                                                    style={{ height: '52px' }}
                                                />
                                            )}
                                        </div>

                                        {filteredUsers.length === 0 && searchTerm && (
                                            <Message
                                                severity="info"
                                                text={`Aucun résultat pour "${searchTerm}"`}
                                                style={{ width: '100%' }}
                                                className="custom-info-message"
                                            />
                                        )}
                                    </div>
                                }
                                emptyMessage={
                                    <div className="text-center py-8">
                                        <div className="mb-4">
                                            <i className="pi pi-users text-400" style={{ fontSize: '4rem' }}></i>
                                        </div>
                                        <h3 className="text-900 text-2xl font-semibold mb-2">
                                            Aucun utilisateur trouvé
                                        </h3>
                                        <p className="text-600 text-lg">
                                            Cette unité organisationnelle ne contient aucun utilisateur
                                        </p>
                                    </div>
                                }
                            >
                                <Column
                                    field="Name"
                                    header="Utilisateur"
                                    body={nameTemplate}
                                    sortable
                                    style={{ minWidth: '280px' }}
                                />
                                <Column
                                    field="EmailAddress"
                                    header="Email"
                                    body={emailTemplate}
                                    sortable
                                    style={{ minWidth: '250px' }}
                                />
                                
                            </DataTable>
                        </Card>
                    </div>
                </div>
            </div>

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
                    padding: 1rem;
                }

                .custom-datatable :global(.p-datatable-tbody > tr) {
                    transition: all 0.2s ease;
                }

                .custom-datatable :global(.p-datatable-tbody > tr:hover) {
                    background: var(--surface-100);
                    transform: scale(1.005);
                }

                .custom-datatable :global(.p-datatable-tbody > tr > td) {
                    padding: 1rem;
                }

                :global(.custom-info-message) {
                    animation: slideIn 0.3s ease;
                }

                :global(.custom-back-btn) {
                    transition: all 0.2s ease;
                }

                :global(.custom-back-btn:hover) {
                    transform: translateX(-3px);
                    box-shadow: 0 4px 12px rgba(107, 114, 128, 0.2) !important;
                }

                .p-inputgroup :global(.p-inputtext) {
                    border-radius: 0;
                }

                .p-inputgroup :global(.p-inputgroup-addon:first-child) {
                    border-radius: 0.5rem 0 0 0.5rem;
                }

                .p-inputgroup :global(.p-button:last-child) {
                    border-radius: 0 0.5rem 0.5rem 0;
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

                @media (max-width: 768px) {
                    .custom-datatable :global(.p-datatable-header) {
                        padding: 1rem;
                    }

                    .custom-datatable :global(.p-datatable-thead > tr > th),
                    .custom-datatable :global(.p-datatable-tbody > tr > td) {
                        padding: 0.75rem;
                    }

                    .p-inputgroup {
                        height: 45px !important;
                    }

                    .p-inputgroup :global(.p-inputtext) {
                        height: 45px !important;
                        font-size: 0.95rem !important;
                    }
                }
            `}</style>
        </Layout>
    );
}