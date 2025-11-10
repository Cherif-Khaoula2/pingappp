import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Tag } from 'primereact/tag';
import Layout from '@/Layouts/layout/layout.jsx';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function AdOuUsersExplorer() {
    const { props } = usePage();
    const data = props.data || [];
    const baseOuDn = props.baseOuDn || 'OU=NewUsersOU,DC=sarpi-dz,DC=sg';
    const error = props.error;
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState(data);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredData(data);
        } else {
            const filtered = data.filter((item) => 
                item.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.SamAccountName && item.SamAccountName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.EmailAddress && item.EmailAddress.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredData(filtered);
        }
    }, [searchTerm, data]);

    // Construire le fil d'Ariane à partir du DN
    const buildBreadcrumb = () => {
        const parts = baseOuDn.split(',').filter(p => p.startsWith('OU='));
        const items = [];
        
        // Ajouter la racine
        items.push({
            label: 'NewUsersOU',
            command: () => router.get('/ad/ou-explorer')
        });

        // Construire le chemin progressivement
        let currentPath = '';
        parts.reverse().forEach((part, index) => {
            const ouName = part.replace('OU=', '');
            if (ouName !== 'NewUsersOU') {
                if (index === 0) {
                    currentPath = part + ',OU=NewUsersOU,DC=sarpi-dz,DC=sg';
                } else {
                    currentPath = part + ',' + currentPath;
                }
                
                items.push({
                    label: ouName,
                    command: () => router.get(`/ad/ou-explorer/${encodeURIComponent(currentPath)}`)
                });
            }
        });

        return items;
    };

    const home = { 
        icon: 'pi pi-home', 
        command: () => router.get('/ad/ou-explorer')
    };

    const handleOuClick = (ouDn) => {
        // Ne pas encoder deux fois, juste passer le DN tel quel
        router.get(`/ad/ou-explorer/${encodeURIComponent(ouDn)}`);
    };

    const nameTemplate = (rowData) => {
        if(rowData.type === 'ou'){
            return (
                <div className="flex align-items-center gap-2 cursor-pointer" onClick={() => handleOuClick(rowData.DistinguishedName)}>
                    <i className="pi pi-folder text-yellow-600 text-xl"></i>
                    <span className="text-blue-600 hover:text-blue-800 font-semibold">
                        {rowData.Name}
                    </span>
                </div>
            );
        } else {
            return (
                <div className="flex align-items-center gap-3">
                    <div className="flex align-items-center justify-content-center bg-primary-100 text-primary-700 border-circle" 
                         style={{ width: '36px', height: '36px', fontWeight: 'bold', fontSize: '14px' }}>
                        {(rowData.Name || rowData.SamAccountName).charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-semibold text-900">{rowData.Name}</div>
                        <div className="text-sm text-600 flex align-items-center gap-1">
                            <i className="pi pi-user text-xs"></i>
                            {rowData.SamAccountName}
                        </div>
                    </div>
                </div>
            );
        }
    };

    const emailTemplate = (rowData) => {
        if(rowData.type === 'user'){
            return rowData.EmailAddress ? (
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-envelope text-primary"></i>
                    <span className="text-900">{rowData.EmailAddress}</span>
                </div>
            ) : (
                <span className="text-500 italic">Pas d'email</span>
            );
        }
        return null;
    };

    const typeTemplate = (rowData) => {
        if (rowData.type === 'ou') {
            return <Tag value="Dossier" severity="warning" icon="pi pi-folder" />;
        } else {
            return <Tag value="Utilisateur" severity="info" icon="pi pi-user" />;
        }
    };

    const ous = filteredData.filter(item => item.type === 'ou');
    const users = filteredData.filter(item => item.type === 'user');

    const header = (
        <div className="mb-4">
            <div className="flex align-items-center gap-2 mb-3">
                <i className="pi pi-sitemap text-3xl text-primary"></i>
                <div>
                    <h2 className="text-2xl font-bold text-900 m-0">Explorateur Active Directory</h2>
                    <p className="text-600 m-0 mt-1">Navigation dans les unités organisationnelles</p>
                </div>
            </div>
            
            <BreadCrumb 
                model={buildBreadcrumb()} 
                home={home} 
                className="bg-blue-50 border-blue-200"
            />
            
            <div className="flex align-items-center gap-2 mt-3">
                <Tag value={`${ous.length} dossier${ous.length > 1 ? 's' : ''}`} 
                     severity="warning" 
                     icon="pi pi-folder" />
                <Tag value={`${users.length} utilisateur${users.length > 1 ? 's' : ''}`} 
                     severity="info" 
                     icon="pi pi-users" />
            </div>
        </div>
    );

    return (
        <Layout>
            <Head title={`Explorateur AD - ${baseOuDn}`} />
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

                            <div className="mb-4">
                                <span className="p-input-icon-left w-full md:w-20rem">
                                    <i className="pi pi-search" />
                                    <InputText
                                        placeholder="Rechercher..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full"
                                    />
                                </span>
                            </div>

                            {filteredData.length === 0 ? (
                                <Message
                                    severity="info"
                                    text="Aucun résultat trouvé dans cette OU"
                                    style={{ width: "100%" }}
                                />
                            ) : (
                                <DataTable
                                    value={filteredData}
                                    stripedRows
                                    responsiveLayout="scroll"
                                    className="custom-datatable"
                                    emptyMessage="Aucune donnée disponible"
                                    paginator
                                    rows={25}
                                    rowsPerPageOptions={[25, 50, 100]}
                                >
                                    <Column
                                        field="type"
                                        header="Type"
                                        body={typeTemplate}
                                        style={{ width: '120px' }}
                                        sortable
                                    />
                                    <Column
                                        field="Name"
                                        header="Nom"
                                        body={nameTemplate}
                                        style={{ minWidth: '300px' }}
                                        sortable
                                    />
                                    <Column
                                        field="EmailAddress"
                                        header="Email"
                                        body={emailTemplate}
                                        style={{ minWidth: '250px' }}
                                        sortable
                                    />
                                </DataTable>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
}