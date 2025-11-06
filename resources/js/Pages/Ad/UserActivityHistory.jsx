import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Timeline } from 'primereact/timeline';
import Layout from "@/Layouts/layout/layout.jsx";
import 'primereact/resources/themes/lara-light-indigo/theme.css';  // Thème
import 'primereact/resources/primereact.min.css';                   // Core CSS
import 'primeicons/primeicons.css';                                 // Icônes
import 'primeflex/primeflex.css';  
export default function UserActivityHistory({ user, logs }) {
    const [dateFilter, setDateFilter] = useState(null);
    const [actionFilter, setActionFilter] = useState('');

    // Filtrer les logs localement
    const filteredLogs = logs.filter(log => {
        let matchDate = true;
        let matchAction = true;

        if (dateFilter) {
            const logDate = new Date(log.created_at).toDateString();
            const filterDate = new Date(dateFilter).toDateString();
            matchDate = logDate === filterDate;
        }

        if (actionFilter) {
            matchAction = log.action === actionFilter;
        }

        return matchDate && matchAction;
    });

    const actionOptions = [
        { label: 'Toutes les actions', value: '' },
        { label: ' Connexion', value: 'login' },
        { label: ' Déconnexion', value: 'logout' },
        { label: ' Blocage utilisateur', value: 'block_user' },
        { label: ' Déblocage utilisateur', value: 'unblock_user' },
        { label: ' Reset mot de passe', value: 'reset_password' },
        { label: ' Création compte AD', value: 'create_user' },
        { label: ' Recherche', value: 'search_user' },
        { label: ' Résultats recherche', value: 'search_user_result' },
        { label: ' Création DN', value: 'create_dn' },
        { label: ' Modification DN', value: 'update_dn' },
        { label: ' Suppression DN', value: 'delete_dn' },
        { label: ' Affectation DNs', value: 'assign_dns_to_user' },
        { label: ' Ajout utilisateurs DN', value: 'assign_dn_to_users' },
        { label: ' Retrait utilisateurs DN', value: 'unassign_dn_from_users' },
        { label: ' Masquage des utilisateurs', value: 'hide_account' },
        { label: ' Démasquage des utilisateurs ', value: 'unhide_account' },        
        { label: ' Autorisation des utilisateurs ', value: 'authorize_ldap_user' },
        { label: ' Désautorisation des utilisateurs', value: 'unauthorize_ldap_user' },
        
    ];

    const getActionConfig = (action) => {
const configs = {
    login: { 
        icon: 'pi-sign-in', 
        severity: 'info', 
        label: 'Connexion', 
        color: '#2563eb' // Bleu royal vif
    },
    logout: { 
        icon: 'pi-sign-out', 
        severity: null, 
        label: 'Déconnexion', 
        color: '#64748b' // Gris bleuté neutre
    },
    block_user: { 
        icon: 'pi-lock', 
        severity: 'danger', 
        label: 'Blocage ', 
        color: '#dc2626' // Rouge foncé élégant
    },
    unblock_user: { 
        icon: 'pi-unlock', 
        severity: 'success', 
        label: 'Déblocage ', 
        color: '#16a34a' // Vert moyen naturel
    },
    reset_password: { 
        icon: 'pi-refresh', 
        severity: 'warning', 
        label: 'Réinitialisation mdp', 
        color: '#d97706' // Orange doré
    },
    create_user: { 
        icon: 'pi-user-plus', 
        severity: 'help', 
        label: 'Création ', 
        color: '#7c3aed' // Violet professionnel
    },
    search_user: { 
        icon: 'pi-search', 
        severity: 'info', 
        label: 'Recherche ', 
        color: '#0284c7' // Bleu ciel profond
    },
    search_user_result: { 
        icon: 'pi-list', 
        severity: 'info', 
        label: 'Résultats', 
        color: '#0ea5e9' // Bleu clair
    },
    create_dn: { 
        icon: 'pi-folder-plus', 
        severity: 'success', 
        label: 'Création DN', 
        color: '#059669' // Vert émeraude
    },
    update_dn: { 
        icon: 'pi-pencil', 
        severity: 'warning', 
        label: 'Modification DN', 
        color: '#f59e0b' // Jaune doré
    },
    delete_dn: { 
        icon: 'pi-trash', 
        severity: 'danger', 
        label: 'Suppression DN', 
        color: '#b91c1c' // Rouge profond
    },
    assign_dns_to_user: { 
        icon: 'pi-link', 
        severity: 'info', 
        label: 'Affectation', 
        color: '#2563eb' // Bleu royal
    },
    assign_dn_to_users: { 
        icon: 'pi-user-plus', 
        severity: 'success', 
        label: 'Ajout DN', 
        color: '#10b981' // Vert menthe
    },
    unassign_dn_from_users: { 
        icon: 'pi-user-minus', 
        severity: 'danger', 
        label: 'Retrait DN', 
        color: '#dc2626' // Rouge standard
    },
    hide_account: { 
        icon: 'pi-eye-slash', 
        severity: 'warning', 
        label: 'Masquage', 
        color: '#fbbf24' // Jaune chaud
    },
    unhide_account: { 
        icon: 'pi-eye', 
        severity: 'success', 
        label: 'Démasquage', 
        color: '#22c55e' // Vert vif
    },
    authorize_ldap_user: { 
        icon: 'pi-user-plus', 
        severity: 'success', 
        label: 'Autorisation', 
        color: '#0d9488' // Vert sarcelle
    },
    unauthorize_ldap_user: { 
        icon: 'pi-user-minus', 
        severity: 'danger', 
        label: 'Désautorisation', 
        color: '#2a1de1ff' // Rouge rosé
    },
        };
        return configs[action] || { icon: 'pi-question', severity: null, label: action, color: '#6b7280' };
    };

    // Templates pour le DataTable
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

        return (
            <div>
                {rowData.target_user_name && (
                    <div className="font-semibold text-900">{formatName(rowData.target_user_name)}</div>
                )}
                {rowData.target_user && (
                    <div className="text-sm text-600">{rowData.target_user}</div>
                )}
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

    // Template pour la Timeline (Mobile)
    const timelineContent = (item) => {
        const config = getActionConfig(item.action);
        const formatName = (name) => {
            if (!name) return '';
            return name.trim().replace(/\.$/, '');
        };

        return (
            <Card className="shadow-1 mb-3">
                <div className="flex flex-column gap-3">
                    <div className="flex align-items-start gap-3">
                        <div 
                            className="inline-flex align-items-center justify-content-center border-circle flex-shrink-0"
                            style={{ 
                                width: '40px', 
                                height: '40px',
                                background: config.color,
                                color: 'white'
                            }}
                        >
                            <i className={`pi ${config.icon}`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex align-items-start justify-content-between gap-2 mb-2">
                                <h4 className="m-0 text-900 font-semibold text-base">{config.label}</h4>
                                <Tag 
                                    icon={item.status === 'success' ? 'pi pi-check-circle' : 'pi pi-times-circle'}
                                    value={item.status === 'success' ? 'Réussi' : 'Échoué'} 
                                    severity={item.status === 'success' ? 'success' : 'danger'}
                                    className="flex-shrink-0"
                                />
                            </div>
                            
                            {item.target_user_name && (
                                <div className="mb-2">
                                    <span className="text-600 text-sm">Cible: </span>
                                    <span className="font-semibold text-900">{formatName(item.target_user_name)}</span>
                                </div>
                            )}
                            
                            <div className="flex flex-column gap-1 text-sm text-600">
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-clock"></i>
                                    <span>{new Date(item.created_at).toLocaleString('fr-FR')}</span>
                                </div>
                                {item.ip_address && (
                                    <div className="flex align-items-center gap-2">
                                        <i className="pi pi-globe"></i>
                                        <span className="font-mono">{item.ip_address}</span>
                                    </div>
                                )}
                            </div>

                            {item.error_message && (
                                <div className="mt-2 p-2 bg-red-50 border-round">
                                    <span className="text-red-600 text-sm">
                                        <i className="pi pi-exclamation-triangle mr-1"></i>
                                        {item.error_message}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        );
    };

    const timelineMarker = (item) => {
        const config = getActionConfig(item.action);
        return (
            <div 
                className="inline-flex align-items-center justify-content-center border-circle shadow-2"
                style={{ 
                    width: '32px', 
                    height: '32px',
                    background: config.color,
                    color: 'white'
                }}
            >
                <i className={`pi ${config.icon} text-sm`}></i>
            </div>
        );
    };

    const formatUserName = (user) => {
        if (user.first_name && user.last_name) {
            return `${user.first_name} ${user.last_name.toUpperCase()}`;
        }
        return user.email;
    };

    return (
        <Layout>
            <Head title={`Historique - ${formatUserName(user)}`} />

            <div className="activity-history-container">
                {/* Header avec info utilisateur */}
                <div className="header-card">
                    <Card className="shadow-2">
                        <div className="user-header">
                            <Link href="/ad/activity-logs">
                                <Button 
                                    icon="pi pi-arrow-left" 
                                    rounded 
                                    text
                                    severity="secondary"
                                    className="back-button"
                                />
                            </Link>
                            <div className="user-info">
                                <h1 className="user-name">
                                    {formatUserName(user)?.replace(/\./g, '')}
                                </h1>
                                <p className="user-email">
                                    <i className="pi pi-envelope mr-2"></i>
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filtres */}
                <div className="filters-card">
                    <Card className="shadow-1">
                        <div className="filters-grid">
                            <div className="filter-item">
                                <label className="filter-label">
                                    <i className="pi pi-filter mr-2"></i>
                                    Type d'action
                                </label>
                                <Dropdown
                                    value={actionFilter}
                                    options={actionOptions}
                                    onChange={(e) => setActionFilter(e.value)}
                                    placeholder="Toutes les actions"
                                    className="w-full"
                                />
                            </div>

                            <div className="filter-item">
                                <label className="filter-label">
                                    <i className="pi pi-calendar mr-2"></i>
                                    Filtrer par date
                                </label>
                                <Calendar
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.value)}
                                    dateFormat="dd/mm/yy"
                                    placeholder="Sélectionner une date"
                                    showIcon
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {(dateFilter || actionFilter) && (
                            <div className="filter-actions">
                                <span className="results-count">{filteredLogs.length} résultat(s)</span>
                                <Button
                                    icon="pi pi-times"
                                    label="Réinitialiser"
                                    text
                                    size="small"
                                    onClick={() => {
                                        setDateFilter(null);
                                        setActionFilter('');
                                    }}
                                />
                            </div>
                        )}
                    </Card>
                </div>

                {/* Timeline View (Mobile & Tablette) */}
                <div className="timeline-view">
                    <Card className="shadow-2">
                        <h2 className="timeline-title">
                            <i className="pi pi-history mr-2"></i>
                            Chronologie des actions
                        </h2>
                        {filteredLogs.length > 0 ? (
                            <Timeline 
                                value={filteredLogs} 
                                content={timelineContent}
                                marker={timelineMarker}
                                className="customized-timeline"
                            />
                        ) : (
                            <div className="empty-state">
                                <i className="pi pi-inbox empty-icon"></i>
                                <h3 className="empty-title">Aucune action trouvée</h3>
                                <p className="empty-text">
                                    Aucune activité ne correspond à vos critères de recherche
                                </p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Table View (Desktop) */}
                <div className="table-view">
                    <Card className="shadow-2">
                        <DataTable
                            value={filteredLogs}
                            emptyMessage={
                                <div className="empty-state">
                                    <i className="pi pi-inbox empty-icon"></i>
                                    <h3 className="empty-title">Aucune action trouvée</h3>
                                    <p className="empty-text">
                                        Aucune activité ne correspond à vos critères de recherche
                                    </p>
                                </div>
                            }
                            stripedRows
                            paginator
                            rows={20}
                            rowsPerPageOptions={[10, 20, 50]}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} actions"
                        >
                            <Column
                                field="created_at"
                                header="Date/Heure"
                                body={dateTemplate}
                                sortable
                                style={{ minWidth: '180px' }}
                            />
                            <Column
                                field="action"
                                header="Action"
                                body={actionTemplate}
                                sortable
                                style={{ minWidth: '200px' }}
                            />
                            <Column
                                field="target_user"
                                header="Cible"
                                body={targetUserTemplate}
                                sortable
                                 style={{ width: '260px', minWidth: '260px', maxWidth: '260px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            />
                            <Column
                                field="ip_address"
                                header="Adresse IP"
                                body={ipTemplate}
                                style={{ minWidth: '160px' }}
                            />
                            <Column
                                field="status"
                                header="Statut"
                                body={statusTemplate}
                                sortable
                                style={{ minWidth: '120px' }}
                            />
                        </DataTable>
                    </Card>
                </div>
            </div>

            <style>{`
                /* Container principal */
                .activity-history-container {
                    padding: 1rem;
                    max-width: 100%;
                }

                /* Header Card */
                .header-card {
                    margin-bottom: 1rem;
                }

                .user-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .back-button {
                    flex-shrink: 0;
                }

                .user-info {
                    flex: 1;
                    min-width: 0;
                }

                .user-name {
                    color: #1f2937;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0 0 0.25rem 0;
                    word-break: break-word;
                }

                .user-email {
                    color: #6b7280;
                    margin: 0;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                }

                /* Filtres */
                .filters-card {
                    margin-bottom: 1rem;
                }

                .filters-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }

                .filter-item {
                    width: 100%;
                }

                .filter-label {
                    display: block;
                    color: #1f2937;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                }

                .filter-actions {
                    margin-top: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .results-count {
                    color: #6b7280;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                /* Timeline (visible sur mobile et tablette) */
                .timeline-view {
                    display: block;
                }

                .timeline-title {
                    color: #1f2937;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    font-size: 1.25rem;
                    display: flex;
                    align-items: center;
                }

                /* Table (visible uniquement sur desktop) */
                .table-view {
                    display: none;
                }

                /* Empty state */
                .empty-state {
                    text-align: center;
                    padding: 3rem 1rem;
                }

                .empty-icon {
                    color: #9ca3af;
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    display: block;
                }

                .empty-title {
                    color: #1f2937;
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 0 0 0.5rem 0;
                }

                .empty-text {
                    color: #6b7280;
                    margin: 0;
                }

                /* Card styling */
                :global(.p-card) {
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                }

                :global(.p-card .p-card-body) {
                    padding: 1rem;
                }

                /* Timeline styling */
                :global(.customized-timeline .p-timeline-event-opposite) {
                    flex: 0;
                }

                :global(.customized-timeline .p-timeline-event-content) {
                    flex: 1;
                }

                :global(.customized-timeline .p-card) {
                    margin-bottom: 0.75rem;
                }

                /* Input styling */
                :global(.p-inputtext),
                :global(.p-dropdown),
                :global(.p-calendar) {
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                }

                :global(.p-inputtext:focus),
                :global(.p-dropdown:not(.p-disabled).p-focus) {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                /* Button styling */
                :global(.p-button) {
                    border-radius: 8px;
                    font-weight: 600;
                }

                /* Tag styling */
                :global(.p-tag) {
                    border-radius: 6px;
                    padding: 0.35rem 0.7rem;
                    font-size: 0.875rem;
                    white-space: nowrap;
                }

                /* Shadows */
                :global(.shadow-1) {
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                :global(.shadow-2) {
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
                }

                /* === RESPONSIVE === */

                /* Tablette */
                @media (min-width: 640px) {
                    .filters-grid {
                        grid-template-columns: 1fr 1fr;
                    }

                    .user-name {
                        font-size: 1.875rem;
                    }
                }

                /* Desktop */
                @media (min-width: 1024px) {
                    .activity-history-container {
                        padding: 1.5rem;
                    }

                    .header-card,
                    .filters-card {
                        margin-bottom: 1.5rem;
                    }

                    .timeline-view {
                        display: none;
                    }

                    .table-view {
                        display: block;
                    }

                    :global(.p-card .p-card-body) {
                        padding: 1.5rem;
                    }

                    :global(.p-datatable .p-datatable-thead > tr > th) {
                        background: #f9fafb;
                        color: #374151;
                        font-weight: 600;
                        padding: 1rem;
                        border-bottom: 2px solid #e5e7eb;
                    }

                    :global(.p-datatable .p-datatable-tbody > tr:hover) {
                        background: #f9fafb;
                    }

                    :global(.p-datatable .p-datatable-tbody > tr > td) {
                        padding: 1rem;
                    }
                }

                /* Mobile très petit */
                @media (max-width: 375px) {
                    .user-name {
                        font-size: 1.25rem;
                    }

                    .timeline-title {
                        font-size: 1.1rem;
                    }

                    :global(.customized-timeline) {
                        padding-left: 0;
                    }
                }
            `}</style>
        </Layout>
    );
}