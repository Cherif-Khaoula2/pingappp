import React, { useState } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { Badge } from 'primereact/badge';
import Layout from "@/Layouts/layout/layout.jsx";

export default function UsersActivityLogs({ users, meta }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState("");

    const handleSearch = () => {
        router.get('/ad/users-activity', { search }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleClearSearch = () => {
        setSearch('');
        router.get('/ad/users-activity', {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleViewDetails = (username) => {
        router.visit(`/ad/users-activity/${username}`);
    };

    // Templates
    const userTemplate = (rowData) => {
        const initial = rowData.name ? rowData.name.charAt(0).toUpperCase() : 'U';
        
        return (
            <div className="flex align-items-center gap-3">
                <div 
                    className="inline-flex align-items-center justify-content-center border-circle text-white font-bold"
                    style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        fontSize: '1.1rem'
                    }}
                >
                    {initial}
                </div>
                <div>
                    <div className="font-semibold text-900 text-lg">{rowData.name}</div>
                    <div className="text-sm text-600 flex align-items-center gap-2 mt-1">
                        <i className="pi pi-user text-xs"></i>
                        {rowData.sam}
                    </div>
                </div>
            </div>
        );
    };

    const emailTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-envelope text-blue-600"></i>
                <span className="text-900">{rowData.email || '—'}</span>
            </div>
        );
    };

    const actionsPerformedTemplate = (rowData) => {
        const count = rowData.actions_performed || 0;
        return (
            <div className="flex align-items-center gap-3">
                <div 
                    className="inline-flex align-items-center justify-content-center border-circle bg-purple-50"
                    style={{ width: '40px', height: '40px' }}
                >
                    <i className="pi pi-arrow-up-right text-xl text-purple-600"></i>
                </div>
                <div>
                    <div className="font-bold text-900 text-xl">{count}</div>
                    <div className="text-xs text-600">actions effectuées</div>
                </div>
            </div>
        );
    };

    const actionsReceivedTemplate = (rowData) => {
        const count = rowData.actions_received || 0;
        return (
            <div className="flex align-items-center gap-3">
                <div 
                    className="inline-flex align-items-center justify-content-center border-circle bg-orange-50"
                    style={{ width: '40px', height: '40px' }}
                >
                    <i className="pi pi-arrow-down-left text-xl text-orange-600"></i>
                </div>
                <div>
                    <div className="font-bold text-900 text-xl">{count}</div>
                    <div className="text-xs text-600">actions reçues</div>
                </div>
            </div>
        );
    };

    const lastActivityTemplate = (rowData) => {
        if (!rowData.last_activity) return <span className="text-500">—</span>;
        
        const date = new Date(rowData.last_activity);
        return (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-clock text-600"></i>
                <div>
                    <div className="font-medium text-900">
                        {date.toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-sm text-600">
                        {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
        );
    };

    const actionsTemplate = (rowData) => {
        const totalActions = (rowData.actions_performed || 0) + (rowData.actions_received || 0);
        
        return (
            <Button
                icon="pi pi-eye"
                label="Voir détails"
                text
                severity="info"
                onClick={() => handleViewDetails(rowData.sam)}
                style={{ 
                    color: '#6366f1',
                    fontWeight: 600
                }}
            />
        );
    };

    const tableHeader = (
        <div className="flex flex-column gap-4">
            <div className="flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="flex align-items-center gap-4">
                    <div 
                        className="inline-flex align-items-center justify-content-center border-circle" 
                        style={{ 
                            width: '64px', 
                            height: '64px',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)'
                        }}
                    >
                        <i className="pi pi-users text-4xl text-white"></i>
                    </div>
                    <div>
                        <h1 className="text-900 text-3xl font-bold m-0">
                            Logs d'Activité par Utilisateur
                        </h1>
                        <p className="text-600 text-lg mt-1 m-0">
                            {meta?.total || 0} utilisateur{(meta?.total || 0) > 1 ? 's' : ''} avec activités
                        </p>
                    </div>
                </div>
            </div>

            {/* Barre de recherche */}
            <div className="p-inputgroup">
                <span className="p-inputgroup-addon bg-blue-50 border-blue-200">
                    <i className="pi pi-search text-blue-600"></i>
                </span>
                <InputText
                    placeholder="Rechercher par nom, SAM ou email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    style={{ height: '48px' }}
                />
                <Button
                    label="Rechercher"
                    icon="pi pi-search"
                    onClick={handleSearch}
                    style={{
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        border: 'none',
                        minWidth: '140px'
                    }}
                />
                {search && (
                    <Button
                        icon="pi pi-times"
                        outlined
                        onClick={handleClearSearch}
                        style={{
                            borderColor: '#6b7280',
                            color: '#374151'
                        }}
                    />
                )}
            </div>
        </div>
    );

    const currentPage = meta?.page || 1;
    const perPage = meta?.per_page || 10;
    const total = meta?.total || 0;

    return (
        <Layout>
            <Head title="Logs par Utilisateur" />

            <div className="grid">
                <div className="col-12">
                    <Card className="shadow-2">
                        <DataTable
                            value={users || []}
                            header={tableHeader}
                            lazy
                            paginator
                            first={(currentPage - 1) * perPage}
                            rows={perPage}
                            totalRecords={total}
                            onPage={(e) => {
                                const page = (e.first / e.rows) + 1;
                                router.get('/ad/users-activity', { 
                                    search,
                                    page 
                                }, {
                                    preserveState: true,
                                    preserveScroll: true
                                });
                            }}
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            emptyMessage={
                                <div className="text-center py-6">
                                    <i className="pi pi-inbox text-400 mb-3" style={{ fontSize: '3rem' }}></i>
                                    <h3 className="text-900 text-xl font-medium mb-2">
                                        Aucun utilisateur trouvé
                                    </h3>
                                    <p className="text-600">
                                        {search 
                                            ? 'Essayez de modifier votre recherche'
                                            : 'Aucune activité enregistrée'}
                                    </p>
                                </div>
                            }
                            stripedRows
                            responsiveLayout="scroll"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} utilisateurs"
                        >
                            <Column
                                field="name"
                                header="Utilisateur"
                                body={userTemplate}
                                sortable
                                style={{ minWidth: '250px' }}
                            />
                            <Column
                                field="email"
                                header="Email"
                                body={emailTemplate}
                                sortable
                                style={{ minWidth: '220px' }}
                            />
                            <Column
                                field="actions_performed"
                                header="Actions effectuées"
                                body={actionsPerformedTemplate}
                                sortable
                                style={{ minWidth: '180px' }}
                            />
                            <Column
                                field="actions_received"
                                header="Actions reçues"
                                body={actionsReceivedTemplate}
                                sortable
                                style={{ minWidth: '180px' }}
                            />
                            <Column
                                field="last_activity"
                                header="Dernière activité"
                                body={lastActivityTemplate}
                                sortable
                                style={{ minWidth: '180px' }}
                            />
                            <Column
                                header="Actions"
                                body={actionsTemplate}
                                style={{ minWidth: '150px' }}
                            />
                        </DataTable>
                    </Card>
                </div>
            </div>

            <style>{`
                :global(.p-card) {
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                }

                :global(.p-card .p-card-body) {
                    padding: 0;
                }

                :global(.p-card .p-card-content) {
                    padding: 0;
                }

                :global(.p-datatable .p-datatable-header) {
                    background: white;
                    border-bottom: 1px solid #e5e7eb;
                    padding: 1.5rem;
                }

                :global(.p-datatable .p-datatable-thead > tr > th) {
                    background: #f9fafb;
                    color: #374151;
                    font-weight: 600;
                    padding: 1rem;
                    border-bottom: 2px solid #e5e7eb;
                }

                :global(.p-datatable .p-datatable-tbody > tr) {
                    transition: all 0.2s ease;
                }

                :global(.p-datatable .p-datatable-tbody > tr:hover) {
                    background: #f9fafb;
                }

                :global(.p-datatable .p-datatable-tbody > tr > td) {
                    padding: 1rem;
                }

                :global(.p-inputtext) {
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                }

                :global(.p-inputtext:focus) {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                :global(.p-inputgroup-addon) {
                    border-radius: 8px 0 0 8px;
                    border: 1px solid #e5e7eb;
                    border-right: none;
                }

                :global(.p-button) {
                    border-radius: 8px;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }

                :global(.p-button:not(.p-button-outlined):not(.p-button-text):not(:disabled):hover) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                :global(.shadow-2) {
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
                }

                :global(.p-paginator) {
                    background: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                    padding: 1rem 1.5rem;
                }

                :global(.p-paginator .p-paginator-pages .p-paginator-page) {
                    border-radius: 6px;
                    min-width: 2.5rem;
                    height: 2.5rem;
                }

                :global(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-color: #667eea;
                }

                @media (max-width: 768px) {
                    :global(.p-datatable .p-datatable-header) {
                        padding: 1rem;
                    }
                }
            `}</style>
        </Layout>
    );
}