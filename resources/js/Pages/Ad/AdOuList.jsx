import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
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

export default function AdOuList() {
    const { props } = usePage();
    const ous = props.ous || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOus, setFilteredOus] = useState(ous);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(25);

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

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    const nameTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-3">
            
                <div>
                    <div className="font-semibold text-900 text-lg">{rowData.Name}</div>
                </div>
            </div>
        );
    };

    const dnTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-sitemap text-primary"></i>
                <span className="text-sm text-600 font-mono">{rowData.DistinguishedName}</span>
            </div>
        );
    };

    const actionTemplate = (rowData) => {
        return (
            <Button
                label="Voir les utilisateurs"
                icon="pi pi-users"
                severity="info"
                size="small"
                outlined
                onClick={() => handleClick(rowData.DistinguishedName)}
                className="custom-view-btn"
            />
        );
    };

    return (
        <Layout>
            <Head title="Unités Organisationnelles - Active Directory" />

            <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
                <div className="grid">
                    <div className="col-12">
                        <Card className="shadow-3 border-round-xl">
                            <DataTable
                                value={filteredOus}
                                stripedRows
                                paginator
                                rows={rows}
                                first={first}
                                onPage={onPageChange}
                                rowsPerPageOptions={[25, 50, 100, 200]}
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} unités"
                                paginatorClassName="custom-paginator"
                                responsiveLayout="scroll"
                                className="custom-datatable"
                                header={
                                    <div className="flex flex-column gap-4">
                                        <div className="flex align-items-center gap-3">
                                            <div
                                                className="flex align-items-center justify-content-center border-circle"
                                    
                                            >
                                            </div>
                                            <div>
                                                <h1 className="text-900 text-3xl font-bold m-0 mb-1">
                                                    Unités Organisationnelles
                                                </h1>
                                                <p className="text-600 m-0 text-lg">
                                                    Parcourez et gérez les unités organisationnelles Active Directory
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-inputgroup" style={{ height: "52px" }}>
                                            <span className="p-inputgroup-addon" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}>
                                                <i className="pi pi-search text-white"></i>
                                            </span>
                                            <InputText
                                                placeholder="Rechercher une unité organisationnelle (nom, distinguished name)..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                style={{ height: "52px", fontSize: "1.05rem" }}
                                            />
                                            {searchTerm && (
                                                <Button
                                                    icon="pi pi-times"
                                                    className="p-button-text"
                                                    onClick={() => setSearchTerm('')}
                                                    tooltip="Effacer"
                                                    style={{ height: "52px" }}
                                                />
                                            )}
                                        </div>

                                        {filteredOus.length === 0 && searchTerm && (
                                            <Message
                                                severity="info"
                                                text={`Aucun résultat pour "${searchTerm}"`}
                                                style={{ width: "100%" }}
                                                className="custom-info-message"
                                            />
                                        )}
                                    </div>
                                }
                                emptyMessage={
                                    <div className="text-center py-8">
                                        <div className="mb-4">
                                            <i className="pi pi-folder-open text-400" style={{ fontSize: "4rem" }}></i>
                                        </div>
                                        <h3 className="text-900 text-2xl font-semibold mb-2">Aucune unité organisationnelle</h3>
                                        <p className="text-600 text-lg">Aucune unité organisationnelle n'est disponible pour le moment</p>
                                    </div>
                                }
                            >
                                <Column
                                    field="Name"
                                    header="Nom de l'unité"
                                    body={nameTemplate}
                                    sortable
                                    style={{ minWidth: '280px' }}
                                />
                                <Column
                                    field="DistinguishedName"
                                    header="Distinguished Name"
                                    body={dnTemplate}
                                    sortable
                                    style={{ minWidth: '400px' }}
                                />
                                <Column
                                    header="Action"
                                    body={actionTemplate}
                                    style={{ minWidth: '220px' }}
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

                :global(.custom-view-btn:hover) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
                }

                :global(.custom-info-message) {
                    animation: slideIn 0.3s ease;
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

                .font-mono {
                    font-family: 'Courier New', Courier, monospace;
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