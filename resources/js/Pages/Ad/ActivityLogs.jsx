import React, { useState } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Chip } from 'primereact/chip';
import Layout from "@/Layouts/layout/layout.jsx";

export default function ActivityLogs({ logs, stats, filters }) {
    const { auth } = usePage().props;

    const [localFilters, setLocalFilters] = useState({
        action: filters.action ? (Array.isArray(filters.action) ? filters.action : (typeof filters.action === 'string' ? [filters.action] : [])) : [],
        target_user: filters.target_user || '',
        start_date: filters.start_date ? new Date(filters.start_date) : null,
        end_date: filters.end_date ? new Date(filters.end_date) : null,
    });

    const actionOptions = [
        { label: 'Connexion', value: 'login' },
        { label: 'Déconnexion', value: 'logout' },
        { label: 'Blocage utilisateur', value: 'block_user' },
        { label: 'Déblocage utilisateur', value: 'unblock_user' },
        { label: 'Reset mot de passe', value: 'reset_password' },
        { label: 'Création compte AD', value: 'create_user' },
        { label: 'Création compte Exchange', value: 'create_exchange_mailbox' },
        { label: 'Recherche', value: 'search_user' },
        { label: 'Résultats recherche', value: 'search_user_result' },
        { label: 'Création DN', value: 'create_dn' },
        { label: 'Modification DN', value: 'update_dn' },
        { label: 'Suppression DN', value: 'delete_dn' },
        { label: 'Affectation DNs', value: 'assign_dns_to_user' },
        { label: 'Ajout utilisateurs DN', value: 'assign_dn_to_users' },
        { label: 'Retrait utilisateurs DN', value: 'unassign_dn_from_users' },
        { label: 'Masquage des utilisateurs', value: 'hide_account' },
        { label: 'Démasquage des utilisateurs', value: 'unhide_account' },        
        { label: 'Autorisation des utilisateurs', value: 'authorize_ldap_user' },
        { label: 'Désautorisation des utilisateurs', value: 'unauthorize_ldap_user' },
        { label: 'Modification utilisateur', value: 'update_user' },
        { label: 'Recherchez et récupérez MDP', value: 'get_laps_password' },
        { label: 'Voir Liste des ordinateurs AD', value: 'get_all_laps_computers' },




    ];

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        
        const queryParams = {
            target_user: newFilters.target_user,
            start_date: newFilters.start_date ? formatDateForQuery(newFilters.start_date) : '',
            end_date: newFilters.end_date ? formatDateForQuery(newFilters.end_date) : '',
        };
        
        // ✅ Ajouter chaque action comme paramètre séparé pour Laravel
        if (Array.isArray(newFilters.action) && newFilters.action.length > 0) {
            queryParams['action'] = newFilters.action;
        }
        
        router.get('/ad/activity-logs', queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatDateForQuery = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    const resetFilters = () => {
        setLocalFilters({
            action: [],
            target_user: '',
            start_date: null,
            end_date: null,
        });
        router.get('/ad/activity-logs');
    };

    const exportLogs = () => {
        const params = new URLSearchParams();
        
        if (localFilters.target_user) {
            params.append('target_user', localFilters.target_user);
        }
        if (localFilters.start_date) {
            params.append('start_date', formatDateForQuery(localFilters.start_date));
        }
        if (localFilters.end_date) {
            params.append('end_date', formatDateForQuery(localFilters.end_date));
        }
        
        // Ajouter chaque action séparément
        if (Array.isArray(localFilters.action) && localFilters.action.length > 0) {
            localFilters.action.forEach(action => {
                params.append('action[]', action);
            });
        }
        
        window.location.href = `/ad/activity-logs-export?${params.toString()}`;
    };

    const getActionConfig = (action) => {
        const configs = {
            login: { 
                icon: 'pi-sign-in', 
                severity: 'success', 
                label: 'Connexion', 
            },
            logout: { 
                icon: 'pi-sign-out', 
                severity: 'warning', 
                label: 'Déconnexion', 
            },
            block_user: { 
                icon: 'pi-lock', 
                severity: 'danger', 
                label: 'Blocage', 
                color: '#dc2626'
            },
            unblock_user: { 
                icon: 'pi-unlock', 
                severity: 'success', 
                label: 'Déblocage', 
                color: '#16a34a'
            },
            reset_password: { 
                icon: 'pi-refresh', 
                severity: 'warning', 
                label: 'Réinitialisation mdp', 
                color: '#d97706'
            },
            create_user: { 
                icon: 'pi-user-plus', 
                severity: 'help', 
                label: 'Création AD', 
                color: '#7c3aed'
            },
            create_exchange_mailbox: { 
                icon: 'pi-user-plus', 
                severity: 'help', 
                label: 'Création Exchange', 
                color: '#7c3aed'
            },
            search_user: { 
                icon: 'pi-search', 
                severity: 'info', 
                label: 'Recherche', 
                color: '#0284c7'
            },
            create_dn: { 
                icon: 'pi-folder-plus', 
                severity: 'success', 
                label: 'Création DN', 
                color: '#059669'
            },
            update_dn: { 
                icon: 'pi-pencil', 
                severity: 'warning', 
                label: 'Modification DN', 
                color: '#f59e0b'
            },
            delete_dn: { 
                icon: 'pi-trash', 
                severity: 'danger', 
                label: 'Suppression DN', 
                color: '#b91c1c'
            },
            assign_dns_to_user: { 
                icon: 'pi-link', 
                severity: 'primary', 
                label: 'Affectation', 
                color: '#2563eb'
            },
            assign_dn_to_users: { 
                icon: 'pi-user-plus', 
                severity: 'success', 
                label: 'Ajout DN', 
                color: '#10b981'
            },
            unassign_dn_from_users: { 
                icon: 'pi-user-minus', 
                severity: 'danger', 
                label: 'Retrait DN', 
                color: '#dc2626'
            },
            hide_account: { 
                icon: 'pi-eye-slash', 
                severity: 'warning', 
                label: 'Masquage', 
                color: '#fbbf24'
            },
            unhide_account: { 
                icon: 'pi-eye', 
                severity: null, 
                label: 'Démasquage', 
                color: '#22c55e'
            },
            authorize_ldap_user: { 
                icon: 'pi-user-plus', 
                severity: 'success', 
                label: 'Autorisation', 
                color: '#0d9488'
            },
            unauthorize_ldap_user: { 
                icon: 'pi-user-minus', 
                severity: 'danger', 
                label: 'Désautorisation', 
                color: '#2a1de1ff'
            },
               update_user: { 
                icon: ' pi-pencil', 
                severity: null, 
                label: 'Modification utilisateur', 
                color: '#2a1de1ff'
            },
                  get_laps_password: { 
            icon: 'pi-key', 
            severity: 'warning', 
            label: 'Récupération LAPS', 
            color: '#f59e0b'
        },
        get_all_laps_computers: { 
            icon: 'pi-desktop', 
            severity: 'info', 
            label: 'Voir Liste ordinateurs AD', 
            color: '#3b82f6'
         },


        };

        return configs[action] || { icon: 'pi-question', severity: null, label: action, color: '#6b7280' };
    };

    const dateTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-clock text-600"></i>
                <div>
                    <div className="font-medium text-900">
                        {new Date(rowData.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-sm text-600">
                        {new Date(rowData.created_at).toLocaleTimeString('fr-FR')}
                    </div>
                </div>
            </div>
        );
    };

    const actionTemplate = (rowData) => {
        const config = getActionConfig(rowData.action);
        return (
            <Tag 
                icon={`pi ${config.icon}`}
                value={config.label} 
                severity={config.severity}
                className="font-medium"
            />
        );
    };

    const targetUserTemplate = (rowData) => {
        const formatName = (name) => {
            if (!name) return '';
            name = name.trim().replace(/\.$/, '');
            const parts = name.split(' ');
            if (parts.length >= 2) {
                const firstName = parts[0];
                const lastName = parts.slice(1).join(' ').toUpperCase();
                return `${firstName} ${lastName}`;
            }
            return name;
        };

        if (rowData.action === 'search_user') {
            return (
                <div>
                    <div className="font-medium text-700">
                        Recherche : <span className="text-900">"{rowData.target_user}"</span>
                    </div>
                </div>
            );
        }

        if (rowData.action === 'search_user_result' && rowData.target_user_name) {
            const names = rowData.target_user_name.split(', ');
            return (
                <div>
                    <div className="font-semibold text-900 mb-2">
                        {names.length} résultat{names.length > 1 ? 's' : ''} trouvé{names.length > 1 ? 's' : ''}
                    </div>
                    {names.slice(0, 3).map((name, idx) => (
                        <div key={idx} className="text-sm text-700">
                            • {formatName(name)}
                        </div>
                    ))}
                    {names.length > 3 && (
                        <div className="text-xs text-500 mt-1 font-medium">
                            +{names.length - 3} autre(s)
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div>
                {rowData.target_user_name && (
                    <div className="font-semibold text-900">{formatName(rowData.target_user_name)}</div>
                )}
                <div className="text-sm text-600">{rowData.target_user}</div>
            </div>
        );
    };

    const performedByTemplate = (rowData) => {
        const formatName = (name) => {
            if (!name) return '';
            return name.trim().replace(/\.$/, '');
        };

        return (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-user text-600"></i>
                <span className="text-900">{formatName(rowData.performed_by_name)}</span>
            </div>
        );
    };

    const ipTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-globe text-600"></i>
                <span className="text-700 font-mono text-sm">
                    {rowData.ip_address || '—'}
                </span>
            </div>
        );
    };

    const statusTemplate = (rowData) => {
        return (
            <Tag 
                icon={rowData.status === 'success' ? 'pi pi-check-circle' : 'pi pi-times-circle'}
                value={rowData.status === 'success' ? 'Réussi' : 'Échoué'} 
                severity={rowData.status === 'success' ? 'success' : 'danger'}
            />
        );
    };

    const actionsTemplate = (rowData) => {
        return (
            <Button
                icon="pi pi-eye"
                label="Détails"
                text
                size="small"
                onClick={() => router.visit(`/ad/activity-logs/${rowData.id}`)}
                style={{ color: '#6366f1' }}
            />
        );
    };

    const getActionLabels = (actions) => {
        if (!Array.isArray(actions) || actions.length === 0) return '';
        return actions
            .map(action => actionOptions.find(opt => opt.value === action)?.label.replace(/[🔐🚪🔒🔓🔄➕📧🔍📋📁✏️🗑️🔗👥👤👁️✅❌]/g, '').trim())
            .join(', ');
    };

    const tableHeader = (
        <div className="flex flex-column gap-4">
            <div className="flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="flex align-items-center gap-3">
                    <div className="inline-flex align-items-center justify-content-center border-circle"></div>
                    <div>
                        <h1 className="text-900 text-3xl font-bold m-0">
                            Logs d'activité Active Directory
                        </h1>
                        <p className="text-600 mt-1 m-0">
                            Traçabilité complète des actions sur les utilisateurs
                        </p>
                    </div>
                </div>
            </div>

            <Card className="shadow-1">
                <div className="grid">
                    <div className="col-12 md:col-3">
                        <label className="block text-900 font-medium mb-2">
                            <i className="pi pi-filter mr-2"></i>
                            Actions
                        </label>
                        <MultiSelect
                            value={localFilters.action}
                            options={actionOptions}
                            onChange={(e) => handleFilterChange('action', e.value)}
                            placeholder="Sélectionnez des actions"
                            className="w-full"
                            display="chip"
                            maxSelectedLabels={2}
                        />
                    </div>

                    <div className="col-12 md:col-3">
                        <label className="block text-900 font-medium mb-2">
                            <i className="pi pi-user mr-2"></i>
                            Utilisateur ciblé
                        </label>
                        <InputText
                            value={localFilters.target_user}
                            onChange={(e) => handleFilterChange('target_user', e.target.value)}
                            placeholder="Rechercher..."
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 md:col-2">
                        <label className="block text-900 font-medium mb-2">
                            <i className="pi pi-calendar mr-2"></i>
                            Date début
                        </label>
                        <Calendar
                            value={localFilters.start_date}
                            onChange={(e) => handleFilterChange('start_date', e.value)}
                            dateFormat="dd/mm/yy"
                            placeholder="Début"
                            showIcon
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 md:col-2">
                        <label className="block text-900 font-medium mb-2">
                            <i className="pi pi-calendar mr-2"></i>
                            Date fin
                        </label>
                        <Calendar
                            value={localFilters.end_date}
                            onChange={(e) => handleFilterChange('end_date', e.value)}
                            dateFormat="dd/mm/yy"
                            placeholder="Fin"
                            showIcon
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 md:col-2">
                        <label className="block text-900 font-medium mb-2 opacity-0">Actions</label>
                        <Button
                            icon="pi pi-times"
                            label="Réinitialiser"
                            outlined
                            onClick={resetFilters}
                            className="w-full"
                            style={{
                                borderColor: '#6b7280',
                                color: '#374151'
                            }}
                        />
                    </div>
                </div>

                {(localFilters.action.length > 0 || localFilters.target_user || localFilters.start_date || localFilters.end_date) && (
                    <div className="mt-3 flex align-items-center gap-2 flex-wrap">
                        <span className="text-600 font-medium">Filtres actifs:</span>
                        
                        {/* Afficher chaque action comme un chip séparé */}
                        {localFilters.action.length > 0 && localFilters.action.map(action => {
                            const actionLabel = actionOptions.find(opt => opt.value === action)?.label.replace(/[🔐🚪🔒🔓🔄➕📧🔍📋📁✏️🗑️🔗👥👤👁️✅❌]/g, '').trim();
                            return (
                                <Chip 
                                    key={action}
                                   label={`Action: ${actionLabel}`}
                                    removable
                                    onRemove={() => {
                                        const newActions = localFilters.action.filter(a => a !== action);
                                        handleFilterChange('action', newActions);
                                    }}
                                    style={{ 
                                        background: '#e0e7ff', 
                                        color: '#4338ca',
                                        fontWeight: 500
                                    }}
                                />
                            );
                        })}
                        
                        {localFilters.target_user && (
                            <Chip 
                                label={`Utilisateur: ${localFilters.target_user}`}
                                removable
                                onRemove={() => handleFilterChange('target_user', '')}
                            />
                        )}
                        {localFilters.start_date && (
                            <Chip 
                                label={`Début: ${localFilters.start_date.toLocaleDateString('fr-FR')}`}
                                removable
                                onRemove={() => handleFilterChange('start_date', null)}
                            />
                        )}
                        {localFilters.end_date && (
                            <Chip 
                                label={`Fin: ${localFilters.end_date.toLocaleDateString('fr-FR')}`}
                                removable
                                onRemove={() => handleFilterChange('end_date', null)}
                            />
                        )}
                    </div>
                )}
            </Card>
        </div>
    );

    const currentPage = logs?.current_page || 1;
    const perPage = logs?.per_page || 10;
    const total = logs?.total || 0;

    return (
        <Layout>
            <Head title="Logs d'activité AD" />

            <div className="grid">
                <div className="col-12">
                    <Card className="shadow-2">
                        <DataTable
                            value={logs?.data || []}
                            header={tableHeader}
                            lazy
                            paginator
                            first={(currentPage - 1) * perPage}
                            rows={perPage}
                            totalRecords={total}
                            onPage={(e) => {
                                const page = (e.first / e.rows) + 1;
                                const queryParams = {
                                    target_user: localFilters.target_user,
                                    start_date: localFilters.start_date ? formatDateForQuery(localFilters.start_date) : '',
                                    end_date: localFilters.end_date ? formatDateForQuery(localFilters.end_date) : '',
                                    page
                                };
                                
                                // Ajouter les actions comme tableau
                                if (Array.isArray(localFilters.action) && localFilters.action.length > 0) {
                                    queryParams['action'] = localFilters.action;
                                }
                                
                                router.get('/ad/activity-logs', queryParams, {
                                    preserveState: true,
                                    preserveScroll: true
                                });
                            }}
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            emptyMessage={
                                <div className="text-center py-6">
                                    <i className="pi pi-inbox text-400 mb-3" style={{ fontSize: '3rem' }}></i>
                                    <h3 className="text-900 text-xl font-medium mb-2">
                                        Aucun log trouvé
                                    </h3>
                                    <p className="text-600">
                                        Essayez de modifier vos filtres de recherche
                                    </p>
                                </div>
                            }
                            stripedRows
                            responsiveLayout="scroll"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} logs"
                        >
                            <Column
                                field="performed_by_name"
                                header="Administrateur (Effectuer par)"
                                body={performedByTemplate}
                                sortable
                                style={{ minWidth: '180px' }}
                            />
                            <Column
                                field="action"
                                header="Action"
                                body={actionTemplate}
                                sortable
                                style={{ minWidth: '180px' }}
                            />
                            <Column
                                field="target_user"
                                header="Cible"
                                body={targetUserTemplate}
                                sortable
                                style={{ width: '260px', minWidth: '260px', maxWidth: '260px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            />
                            <Column
                                field="created_at"
                                header="Date/Heure"
                                body={dateTemplate}
                                sortable
                                style={{ minWidth: '180px' }}
                            />
                            <Column
                                field="status"
                                header="Statut"
                                body={statusTemplate}
                                sortable
                                style={{ minWidth: '120px' }}
                            />
                            <Column
                                field="ip_address"
                                header="Adresse IP"
                                body={ipTemplate}
                                style={{ minWidth: '160px' }}
                            />
                            <Column
                                header="Détails"
                                body={actionsTemplate}
                                style={{ minWidth: '120px' }}
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

                :global(.p-inputtext),
                :global(.p-dropdown),
                :global(.p-multiselect) {
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                }

                :global(.p-inputtext:focus),
                :global(.p-dropdown:not(.p-disabled).p-focus),
                :global(.p-multiselect:not(.p-disabled).p-focus) {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                :global(.p-calendar .p-inputtext) {
                    border-radius: 8px;
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

                :global(.p-tag) {
                    border-radius: 6px;
                    padding: 0.35rem 0.7rem;
                    font-size: 0.875rem;
                }

                :global(.p-chip) {
                    background: #f3f4f6;
                    color: #374151;
                    border-radius: 6px;
                }

                :global(.shadow-1) {
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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