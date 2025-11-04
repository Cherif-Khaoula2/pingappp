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

export default function UserActivityHistory({ user, logs }) {
    const [dateFilter, setDateFilter] = useState(null);
    const [actionFilter, setActionFilter] = useState('');
    const [viewMode, setViewMode] = useState('all'); // 'all', 'target', 'performed'

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
        { label: 'Connexion', value: 'login' },
        { label: 'Déconnexion', value: 'logout' },
        { label: 'Blocage', value: 'block_user' },
        { label: 'Déblocage', value: 'unblock_user' },
        { label: 'Reset mot de passe', value: 'reset_password' },
        { label: 'Création AD', value: 'create_user' },
    ];

    const getActionConfig = (action) => {
        const configs = {
            login: { icon: 'pi-sign-in', severity: 'info', label: 'Connexion', color: '#3b82f6' },
            logout: { icon: 'pi-sign-out', severity: null, label: 'Déconnexion', color: '#6b7280' },
            block_user: { icon: 'pi-lock', severity: 'danger', label: 'Blocage utilisateur', color: '#ef4444' },
            unblock_user: { icon: 'pi-unlock', severity: 'success', label: 'Déblocage utilisateur', color: '#10b981' },
            reset_password: { icon: 'pi-refresh', severity: 'warning', label: 'Reset mot de passe', color: '#f59e0b' },
            create_user: { icon: 'pi-user-plus', severity: 'secondary', label: 'Création utilisateur', color: '#8b5cf6' },
        };
        return configs[action] || { icon: 'pi-question', severity: null, label: action, color: '#6b7280' };
    };

    // Statistiques de l'utilisateur
    const userStats = {
        total_actions: logs.length,
        successful_logins: logs.filter(l => l.action === 'login' && l.status === 'success').length,
        failed_logins: logs.filter(l => l.action === 'login' && l.status === 'failed').length,
        blocks: logs.filter(l => l.action === 'block_user').length,
        unblocks: logs.filter(l => l.action === 'unblock_user').length,
        password_resets: logs.filter(l => l.action === 'reset_password').length,
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
                <div className="text-sm text-600">{rowData.target_user}</div>
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

    // Template pour la Timeline
    const timelineContent = (item) => {
        const config = getActionConfig(item.action);
        return (
            <Card className="shadow-1 mb-3">
                <div className="flex align-items-start gap-3">
                    <div 
                        className="inline-flex align-items-center justify-content-center border-circle"
                        style={{ 
                            width: '40px', 
                            height: '40px',
                            background: config.color,
                            color: 'white'
                        }}
                    >
                        <i className={`pi ${config.icon}`}></i>
                    </div>
                    <div className="flex-1">
                        <div className="flex align-items-center justify-content-between mb-2">
                            <h4 className="m-0 text-900 font-semibold">{config.label}</h4>
                            <Tag 
                                icon={item.status === 'success' ? 'pi pi-check-circle' : 'pi pi-times-circle'}
                                value={item.status === 'success' ? 'Réussi' : 'Échoué'} 
                                severity={item.status === 'success' ? 'success' : 'danger'}
                            />
                        </div>
                        
                        {item.target_user_name && (
                            <div className="mb-2">
                                <span className="text-600">Cible: </span>
                                <span className="font-semibold text-900">{item.target_user_name}</span>
                                <span className="text-600 text-sm ml-2">({item.target_user})</span>
                            </div>
                        )}
                        
                        <div className="flex align-items-center gap-3 text-sm text-600">
                            <span>
                                <i className="pi pi-clock mr-1"></i>
                                {new Date(item.created_at).toLocaleString('fr-FR')}
                            </span>
                            {item.ip_address && (
                                <span>
                                    <i className="pi pi-globe mr-1"></i>
                                    {item.ip_address}
                                </span>
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

            <div className="grid">
                {/* Header avec info utilisateur */}
                <div className="col-12">
                    <Card className="shadow-2 mb-4">
                        <div className="flex align-items-center justify-content-between flex-wrap gap-3">
                            <div className="flex align-items-center gap-3">
                                <Link href="/ad/activity-logs">
                                    <Button 
                                        icon="pi pi-arrow-left" 
                                        rounded 
                                        text
                                        severity="secondary"
                                        className="mr-2"
                                    />
                                </Link>
                                <div 
                                    className="inline-flex align-items-center justify-content-center border-circle" 
                                    style={{ 
                                        width: '56px', 
                                        height: '56px',
                                        background: 'linear-gradient(135deg, #667eea, #764ba2)'
                                    }}
                                >
                                    <i className="pi pi-user text-3xl text-white"></i>
                                </div>
                                <div>
                                    <h1 className="text-900 text-3xl font-bold m-0">
                                        {formatUserName(user)}
                                    </h1>
                                    <p className="text-600 mt-1 m-0">
                                        <i className="pi pi-envelope mr-2"></i>
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Statistiques */}
                <div className="col-12 md:col-4">
                    <Card className="shadow-1" style={{ borderLeft: '4px solid #3b82f6' }}>
                        <div className="flex align-items-center gap-3">
                            <div 
                                className="inline-flex align-items-center justify-content-center border-circle"
                                style={{ width: '48px', height: '48px', background: '#eff6ff' }}
                            >
                                <i className="pi pi-list text-2xl text-blue-600"></i>
                            </div>
                            <div>
                                <div className="text-600 font-medium mb-1">Total Actions</div>
                                <div className="text-900 text-3xl font-bold">{userStats.total_actions}</div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-12 md:col-4">
                    <Card className="shadow-1" style={{ borderLeft: '4px solid #10b981' }}>
                        <div className="flex align-items-center gap-3">
                            <div 
                                className="inline-flex align-items-center justify-content-center border-circle"
                                style={{ width: '48px', height: '48px', background: '#ecfdf5' }}
                            >
                                <i className="pi pi-check-circle text-2xl text-green-600"></i>
                            </div>
                            <div>
                                <div className="text-600 font-medium mb-1">Connexions réussies</div>
                                <div className="text-900 text-3xl font-bold">{userStats.successful_logins}</div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-12 md:col-4">
                    <Card className="shadow-1" style={{ borderLeft: '4px solid #ef4444' }}>
                        <div className="flex align-items-center gap-3">
                            <div 
                                className="inline-flex align-items-center justify-content-center border-circle"
                                style={{ width: '48px', height: '48px', background: '#fef2f2' }}
                            >
                                <i className="pi pi-times-circle text-2xl text-red-600"></i>
                            </div>
                            <div>
                                <div className="text-600 font-medium mb-1">Connexions échouées</div>
                                <div className="text-900 text-3xl font-bold">{userStats.failed_logins}</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filtres */}
                <div className="col-12">
                    <Card className="shadow-1">
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <label className="block text-900 font-medium mb-2">
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

                            <div className="col-12 md:col-6">
                                <label className="block text-900 font-medium mb-2">
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
                            <div className="mt-3 flex align-items-center gap-2">
                                <span className="text-600 font-medium">{filteredLogs.length} résultat(s)</span>
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

                {/* Timeline View (pour petits écrans et tablettes) */}
                <div className="col-12 lg:hidden">
                    <Card className="shadow-2">
                        <h2 className="text-900 font-bold mb-4">
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
                            <div className="text-center py-6">
                                <i className="pi pi-inbox text-400 mb-3" style={{ fontSize: '3rem' }}></i>
                                <h3 className="text-900 text-xl font-medium mb-2">
                                    Aucune action trouvée
                                </h3>
                                <p className="text-600">
                                    Aucune activité ne correspond à vos critères de recherche
                                </p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Table View (pour grands écrans) */}
                <div className="col-12 hidden lg:block">
                    <Card className="shadow-2">
                        <DataTable
                            value={filteredLogs}
                            emptyMessage={
                                <div className="text-center py-6">
                                    <i className="pi pi-inbox text-400 mb-3" style={{ fontSize: '3rem' }}></i>
                                    <h3 className="text-900 text-xl font-medium mb-2">
                                        Aucune action trouvée
                                    </h3>
                                    <p className="text-600">
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
                                header="Utilisateur ciblé"
                                body={targetUserTemplate}
                                sortable
                                style={{ minWidth: '220px' }}
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
                /* Card styling */
                :global(.p-card) {
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                }

                /* Timeline styling */
                :global(.customized-timeline .p-timeline-event-opposite) {
                    flex: 0;
                }

                :global(.customized-timeline .p-timeline-event-content) {
                    flex: 1;
                }

                /* DataTable styling */
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

                /* Input styling */
                :global(.p-inputtext),
                :global(.p-dropdown) {
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
                }

                /* Shadows */
                :global(.shadow-1) {
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                :global(.shadow-2) {
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    :global(.customized-timeline) {
                        padding-left: 0;
                    }
                }
            `}</style>
        </Layout>
    );
}