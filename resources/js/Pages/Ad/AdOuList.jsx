import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
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

export default function AdOuList() {
    const { props } = usePage();
    const ous = props.ous || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOus, setFilteredOus] = useState(ous);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredOus(ous);
        } else {
            const filtered = ous.filter((ou) =>
                ou.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ou.DistinguishedName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredOus(filtered);
        }
    }, [searchTerm, ous]);

    const handleClick = (ouDn) => {
        router.get(`/ad/ou-users/${encodeURIComponent(ouDn)}`);
    };

    const getOuLevel = (dn) => {
        if (!dn) return 0;
        return (dn.match(/OU=/g) || []).length;
    };

    const nameTemplate = (rowData) => {
        const level = getOuLevel(rowData.DistinguishedName);
        return (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-folder text-indigo-600 text-lg"></i>
                <div>
                    <div className="font-semibold text-900">{rowData.Name}</div>
                    {level > 0 && (
                        <Tag value={`Niveau ${level}`} severity="info" className="mt-1" style={{ fontSize: '0.7rem' }} />
                    )}
                </div>
            </div>
        );
    };

    const dnTemplate = (rowData) => {
        return (
            <span className="text-sm text-700 font-mono">{rowData.DistinguishedName}</span>
        );
    };

    const actionTemplate = (rowData) => {
        return (
            <Button
                label="Voir"
                icon="pi pi-users"
                className="p-button-sm p-button-outlined"
                onClick={() => handleClick(rowData.DistinguishedName)}
            />
        );
    };

    return (
        <Layout>
            <Head title="Unités Organisationnelles - Active Directory" />

            <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
                <div className="mb-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-900 m-0 mb-2">
                        Unités Organisationnelles
                    </h1>
                    <p className="text-base text-600 m-0">
                        <i className="pi pi-sitemap mr-2"></i>
                        {ous.length} unité{ous.length > 1 ? 's' : ''} disponible{ous.length > 1 ? 's' : ''}
                    </p>
                </div>

                <Card className="shadow-3 border-round-xl border-1 surface-border">
                    <div className="mb-3">
                        <span className="p-input-icon-left w-full md:w-20rem">
                            <i className="pi pi-search" />
                            <InputText
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher..."
                                className="w-full"
                            />
                        </span>
                    </div>

                    {filteredOus.length === 0 && searchTerm ? (
                        <Message
                            severity="info"
                            text={`Aucun résultat pour "${searchTerm}"`}
                            className="w-full"
                        />
                    ) : filteredOus.length > 0 ? (
                        <DataTable
                            value={filteredOus}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[10, 25, 50]}
                            dataKey="DistinguishedName"
                            stripedRows
                            responsiveLayout="scroll"
                            className="p-datatable-sm"
                            emptyMessage="Aucune unité organisationnelle trouvée"
                        >
                            <Column
                                field="Name"
                                header="Nom"
                                body={nameTemplate}
                                sortable
                                style={{ minWidth: '250px' }}
                            />
                            <Column
                                field="DistinguishedName"
                                header="Distinguished Name"
                                body={dnTemplate}
                                sortable
                                style={{ minWidth: '400px' }}
                            />
                            <Column
                                header="Actions"
                                body={actionTemplate}
                                style={{ width: '150px', textAlign: 'center' }}
                            />
                        </DataTable>
                    ) : (
                        <div className="text-center p-5">
                            <i className="pi pi-folder-open text-5xl text-400 mb-3"></i>
                            <p className="text-600 text-lg">Aucune unité organisationnelle disponible</p>
                        </div>
                    )}
                </Card>
            </div>

            <style jsx>{`
                .p-card {
                    background: #ffffff;
                }
                
                .p-card .p-card-body {
                    padding: 1.5rem;
                }
                
                .p-card .p-card-content {
                    padding: 0;
                }
                
                .p-datatable .p-datatable-thead > tr > th {
                    background: #f9fafb;
                    border-color: #e5e7eb;
                    color: #374151;
                    font-weight: 600;
                    font-size: 0.875rem;
                    padding: 1rem;
                }
                
                .p-datatable .p-datatable-tbody > tr {
                    border-color: #e5e7eb;
                }
                
                .p-datatable .p-datatable-tbody > tr > td {
                    padding: 0.875rem 1rem;
                    border-color: #e5e7eb;
                }
                
                .p-datatable .p-datatable-tbody > tr:hover {
                    background: #f9fafb;
                }
                
                .p-inputtext {
                    border-radius: 0.5rem;
                    border-color: #d1d5db;
                }
                
                .p-inputtext:enabled:focus {
                    box-shadow: 0 0 0 0.2rem rgba(79, 70, 229, 0.2);
                    border-color: #4f46e5;
                }
                
                .surface-border {
                    border-color: #e5e7eb;
                }
                
                .font-mono {
                    font-family: 'Courier New', Courier, monospace;
                }
                
                @media (max-width: 768px) {
                    .p-card .p-card-body {
                        padding: 1rem;
                    }
                    
                    .p-datatable .p-datatable-thead > tr > th,
                    .p-datatable .p-datatable-tbody > tr > td {
                        padding: 0.625rem 0.75rem;
                    }
                }
            `}</style>
        </Layout>
    );
}