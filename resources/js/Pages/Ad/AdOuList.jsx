import React, { useState, useEffect, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { Skeleton } from 'primereact/skeleton';
import { Tooltip } from 'primereact/tooltip';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
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
    const [loading, setLoading] = useState(false);

    // Calculer les statistiques
    const statistics = useMemo(() => {
        const levels = ous.map(ou => getOuLevel(ou.DistinguishedName));
        return {
            total: ous.length,
            maxLevel: Math.max(...levels, 0),
            minLevel: Math.min(...levels, 0),
            avgLevel: levels.length > 0 ? (levels.reduce((a, b) => a + b, 0) / levels.length).toFixed(1) : 0
        };
    }, [ous]);

    const getOuLevel = (dn) => {
        if (!dn) return 0;
        return (dn.match(/OU=/g) || []).length;
    };

    // Options de filtre par niveau
    const levelOptions = useMemo(() => {
        const levels = [...new Set(ous.map(ou => getOuLevel(ou.DistinguishedName)))].sort((a, b) => a - b);
        return [
            { label: 'Tous les niveaux', value: null },
            ...levels.map(level => ({ label: `Niveau ${level}`, value: level }))
        ];
    }, [ous]);

    useEffect(() => {
        let filtered = ous;

        // Filtre par recherche
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter((ou) =>
                ou.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ou.DistinguishedName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredOus(filtered);
    }, [searchTerm, ous]);

    // Fonctions utilitaires définies AVANT les useMemo
    const handleClick = (ouDn) => {
        setLoading(true);
        router.get(`/ad/ou-users/${encodeURIComponent(ouDn)}`, {}, {
            onFinish: () => setLoading(false)
        });
    };

    const nameTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-2">
                <div className="flex align-items-center justify-content-center border-circle bg-indigo-50" 
                     style={{ width: '40px', height: '40px' }}>
                    <i className="pi pi-folder text-indigo-600 text-xl"></i>
                </div>
                <div className="flex-1">
                    <div className="font-semibold text-900 mb-1">{rowData.Name}</div>
                    <span className="text-xs text-500">
                        <i className="pi pi-sitemap mr-1"></i>
                        {rowData.DistinguishedName?.split(',').length || 0} composants
                    </span>
                </div>
            </div>
        );
    };

    const dnTemplate = (rowData) => {
        const dnId = `dn-${rowData.DistinguishedName?.replace(/[^a-zA-Z0-9]/g, '')}`;
        return (
            <>
                <Tooltip target={`.${dnId}`} position="top" />
                <div className={`${dnId} dn-container`} data-pr-tooltip={rowData.DistinguishedName}>
                    <span className="text-sm text-700 font-mono">{rowData.DistinguishedName}</span>
                </div>
            </>
        );
    };

    const actionTemplate = (rowData) => {
        return (
            <div className="flex gap-2 justify-content-center">
                <Button
                    label="Voir utilisateurs"
                    icon="pi pi-users"
                    className="p-button-sm p-button-outlined p-button-info"
                    onClick={() => handleClick(rowData.DistinguishedName)}
                    tooltip="Afficher les utilisateurs de cette OU"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row gap-3 align-items-center justify-content-between">
            <div className="flex gap-2 flex-1 w-full md:w-auto">
                <span className="p-input-icon-left flex-1">
                    <i className="pi pi-search" />
                    <InputText
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher par nom ou DN..."
                        className="w-full"
                    />
                </span>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <Button
                    icon="pi pi-refresh"
                    className="p-button-outlined"
                    onClick={() => {
                        setSearchTerm('');
                    }}
                    tooltip="Réinitialiser les filtres"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        </div>
    );

    const paginatorTemplate = {
        layout: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown',
        CurrentPageReport: (options) => {
            return (
                <span className="text-sm text-600">
                    Affichage de {options.first} à {options.last} sur {options.totalRecords} unités
                </span>
            );
        }
    };

    return (
        <Layout>
            <Head title="Unités Organisationnelles - Active Directory" />

            <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
                {/* En-tête */}
                <div className="mb-4">
                    <div className="flex align-items-center justify-content-between mb-3">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-900 m-0 mb-2">
                                <i className="pi pi-sitemap mr-3 text-indigo-600"></i>
                                Unités Organisationnelles
                            </h1>
                            <p className="text-base text-600 m-0">
                                <i className="pi pi-folder mr-2"></i>
                                {ous.length} unité{ous.length > 1 ? 's' : ''} disponible{ous.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tableau principal */}
                <Card className="shadow-3 border-round-xl border-1 surface-border">
                    {loading && (
                        <div className="loading-overlay">
                            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                        </div>
                    )}

                    {filteredOus.length === 0 && searchTerm ? (
                        <div className="text-center p-6">
                            <i className="pi pi-search text-6xl text-400 mb-3"></i>
                            <h3 className="text-900 font-semibold mb-2">Aucun résultat trouvé</h3>
                            <p className="text-600 mb-4">
                                Aucune OU correspondant à "{searchTerm}"
                            </p>
                            <Button
                                label="Réinitialiser les filtres"
                                icon="pi pi-refresh"
                                className="p-button-outlined"
                                onClick={() => {
                                    setSearchTerm('');
                                }}
                            />
                        </div>
                    ) : filteredOus.length > 0 ? (
                        <DataTable
                            value={filteredOus}
                            paginator
                            rows={15}
                            rowsPerPageOptions={[10, 15, 25, 50, 100]}
                            dataKey="DistinguishedName"
                            stripedRows
                            responsiveLayout="scroll"
                            className="p-datatable-sm"
                            emptyMessage="Aucune unité organisationnelle trouvée"
                            header={header}
                            paginatorTemplate={paginatorTemplate.layout}
                            currentPageReportTemplate={paginatorTemplate.CurrentPageReport}
                            sortField="Name"
                            sortOrder={1}
                            showGridlines
                        >
                            <Column
                                field="Name"
                                header="Nom de l'unité"
                                body={nameTemplate}
                                sortable
                                style={{ minWidth: '300px' }}
                            />
                            <Column
                                field="DistinguishedName"
                                header="Distinguished Name (DN)"
                                body={dnTemplate}
                                sortable
                                style={{ minWidth: '450px' }}
                            />
                            <Column
                                header="Actions"
                                body={actionTemplate}
                                style={{ width: '200px', textAlign: 'center' }}
                                frozen
                                alignFrozen="right"
                            />
                        </DataTable>
                    ) : (
                        <div className="text-center p-6">
                            <i className="pi pi-folder-open text-6xl text-400 mb-3"></i>
                            <h3 className="text-900 font-semibold mb-2">Aucune unité organisationnelle</h3>
                            <p className="text-600">Aucune OU n'est actuellement disponible dans le système</p>
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
                
                .p-datatable .p-datatable-header {
                    background: #ffffff;
                    border: none;
                    padding: 1.5rem;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .p-datatable .p-datatable-thead > tr > th {
                    background: #f9fafb;
                    border-color: #e5e7eb;
                    color: #374151;
                    font-weight: 600;
                    font-size: 0.875rem;
                    padding: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .p-datatable .p-datatable-tbody > tr {
                    border-color: #e5e7eb;
                    transition: all 0.2s;
                }
                
                .p-datatable .p-datatable-tbody > tr > td {
                    padding: 1rem;
                    border-color: #e5e7eb;
                }
                
                .p-datatable .p-datatable-tbody > tr:hover {
                    background: #f9fafb;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                
                .p-inputtext {
                    border-radius: 0.5rem;
                    border-color: #d1d5db;
                    transition: all 0.2s;
                }
                
                .p-inputtext:enabled:hover {
                    border-color: #9ca3af;
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
                
                .dn-container {
                    max-width: 500px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    cursor: help;
                }
                
                .loading-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    border-radius: 0.75rem;
                }
                
                .p-dropdown {
                    border-radius: 0.5rem;
                }
                
                .p-button {
                    transition: all 0.2s;
                }
                
                .p-button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                
                @media (max-width: 768px) {
                    .p-card .p-card-body {
                        padding: 1rem;
                    }
                    
                    .p-datatable .p-datatable-thead > tr > th,
                    .p-datatable .p-datatable-tbody > tr > td {
                        padding: 0.75rem;
                    }
                    
                    .p-datatable .p-datatable-header {
                        padding: 1rem;
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .grid > div {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </Layout>
    );
}