import React, { useState, useEffect, useContext } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { Avatar } from 'primereact/avatar';
import Layout from "@/Layouts/layout/layout.jsx";
import { LayoutContext } from '@/Layouts/layout/context/layoutcontext';

export default function AdDashboard({ 
    stats = {}, 
    topConnectedUsers = [], 
    topBlockedUsers = [],
    topAdmins = [],
    dailyActivity = [],
    actionBreakdown = [],
    hourlyActivity = [],
    topIps = [],
    recentFailures = [],
    recentCreations = [],
    currentPeriodStats = {},
    trends = {},
    period = 7
}) {
    const { layoutConfig } = useContext(LayoutContext);
    const [selectedPeriod, setSelectedPeriod] = useState(period);
    const [chartOptions, setChartOptions] = useState({});

    const periodOptions = [
        { label: 'Dernières 24h', value: 1 },
        { label: '7 derniers jours', value: 7 },
        { label: '30 derniers jours', value: 30 },
        { label: '90 derniers jours', value: 90 },
    ];

    useEffect(() => {
        const isDark = layoutConfig.colorScheme === 'dark';
        const textColor = isDark ? '#ebedef' : '#495057';
        const gridColor = isDark ? 'rgba(160, 167, 181, .3)' : '#ebedef';

        setChartOptions({
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            },
            scales: {
                x: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                y: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                }
            }
        });
    }, [layoutConfig.colorScheme]);

    const handlePeriodChange = (e) => {
        setSelectedPeriod(e.value);
        router.get('/ad/dashboard', { period: e.value }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    // 📊 Données pour le graphique d'activité quotidienne
    const dailyActivityData = {
        labels: dailyActivity.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })),
        datasets: [
            {
                label: 'Succès',
                data: dailyActivity.map(d => d.success || 0),
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: '#10b981',
                borderWidth: 2,
                tension: 0.4
            },
            {
                label: 'Échecs',
                data: dailyActivity.map(d => d.failed || 0),
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: '#ef4444',
                borderWidth: 2,
                tension: 0.4
            }
        ]
    };

    // 📊 Données pour le graphique par type d'action
    const actionData = {
        labels: actionBreakdown.map(a => {
            const labels = {
                login: 'Connexions',
                logout: 'Déconnexions',
                block_user: 'Blocages',
                unblock_user: 'Déblocages',
                reset_password: 'Réinit. MDP',
                create_user: 'Créations'
            };
            return labels[a.action] || a.action;
        }),
        datasets: [{
            data: actionBreakdown.map(a => a.count || 0),
            backgroundColor: [
                '#6366f1',
                '#8b5cf6',
                '#ef4444',
                '#10b981',
                '#f59e0b',
                '#06b6d4'
            ]
        }]
    };

    // 📊 Données pour le graphique des heures de pointe
    const hourlyData = {
        labels: hourlyActivity.map(h => `${h.hour}h`),
        datasets: [{
            label: 'Activités',
            data: hourlyActivity.map(h => h.count || 0),
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderColor: '#6366f1',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    };

    // Templates
    const userTemplate = (rowData, field = 'target_user') => {
        const username = rowData[field];
        const displayName = rowData[field + '_name'];
        const initial = username ? username.charAt(0).toUpperCase() : 'U';
        
        return (
            <div className="flex align-items-center gap-2">
                <Avatar 
                    label={initial}
                    size="normal"
                    style={{ 
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white'
                    }}
                />
                <div>
                    <div className="font-medium text-900">{username || 'N/A'}</div>
                    {displayName && (
                        <div className="text-sm text-600">{displayName}</div>
                    )}
                </div>
            </div>
        );
    };

    const countTemplate = (rowData, field) => {
        return (
            <Tag 
                value={rowData[field] || 0}
                severity="info"
                className="font-bold"
                style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}
            />
        );
    };

    const actionTemplate = (rowData) => {
        const config = {
            login: { icon: 'pi-sign-in', severity: 'info' },
            block_user: { icon: 'pi-lock', severity: 'danger' },
            create_user: { icon: 'pi-user-plus', severity: 'success' },
        }[rowData.action] || { icon: 'pi-circle', severity: null };

        return <Tag icon={`pi ${config.icon}`} severity={config.severity} />;
    };

    const dateTemplate = (rowData) => {
        return (
            <div className="text-sm">
                <div className="text-900 font-medium">
                    {new Date(rowData.created_at).toLocaleDateString('fr-FR')}
                </div>
                <div className="text-600">
                    {new Date(rowData.created_at).toLocaleTimeString('fr-FR')}
                </div>
            </div>
        );
    };

    const getTrendIcon = (value) => {
        if (value > 0) return 'pi-arrow-up';
        if (value < 0) return 'pi-arrow-down';
        return 'pi-minus';
    };

    const getTrendColor = (value) => {
        if (value > 0) return 'text-green-500';
        if (value < 0) return 'text-red-500';
        return 'text-gray-500';
    };

    return (
        <Layout>
            <Head title="Dashboard AD" />

            {/* En-tête avec sélecteur de période */}
            <div className="grid mb-4">
                <div className="col-12">
                    <div className="flex align-items-center justify-content-between flex-wrap gap-3">
                        <div className="flex align-items-center gap-3">
                            <div 
                                className="inline-flex align-items-center justify-content-center border-circle" 
                                style={{ 
                                    width: '64px', 
                                    height: '64px',
                                    background: 'linear-gradient(135deg, #667eea, #764ba2)'
                                }}
                            >
                                <i className="pi pi-chart-bar text-4xl text-white"></i>
                            </div>
                            <div>
                                <h1 className="text-900 text-4xl font-bold m-0">
                                    Dashboard Active Directory
                                </h1>
                                <p className="text-600 mt-1 m-0 text-lg">
                                    Vue d'ensemble de l'activité et des statistiques
                                </p>
                            </div>
                        </div>
                        <div className="flex align-items-center gap-3">
                            <Dropdown
                                value={selectedPeriod}
                                options={periodOptions}
                                onChange={handlePeriodChange}
                                placeholder="Période"
                            />
                            <Link href="/ad/activity-logs">
                                <Button
                                    icon="pi pi-list"
                                    label="Voir tous les logs"
                                    severity="secondary"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistiques principales */}
            <div className="grid">
                {/* Activités du jour */}
                <div className="col-12 md:col-6 lg:col-3">
                    <Card className="dashboard-card shadow-2">
                        <div className="flex align-items-center justify-content-between">
                            <div>
                                <div className="text-600 font-medium mb-2">Activités aujourd'hui</div>
                                <div className="text-900 text-4xl font-bold">{stats.today_logs || 0}</div>
                                <div className="text-sm text-600 mt-2">Total des actions</div>
                            </div>
                            <div 
                                className="inline-flex align-items-center justify-content-center border-circle"
                                style={{ 
                                    width: '64px', 
                                    height: '64px',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                }}
                            >
                                <i className="pi pi-bolt text-3xl text-white"></i>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Connexions */}
                <div className="col-12 md:col-6 lg:col-3">
                    <Card className="dashboard-card shadow-2">
                        <div className="flex align-items-center justify-content-between">
                            <div>
                                <div className="text-600 font-medium mb-2">Connexions</div>
                                <div className="text-900 text-4xl font-bold">{stats.today_logins || 0}</div>
                                <div className="flex align-items-center gap-2 mt-2">
                                    <i className={`pi ${getTrendIcon(trends.logins || 0)} text-sm ${getTrendColor(trends.logins || 0)}`}></i>
                                    <span className={`text-sm font-medium ${getTrendColor(trends.logins || 0)}`}>
                                        {Math.abs(trends.logins || 0)}%
                                    </span>
                                    <span className="text-sm text-600">vs période précédente</span>
                                </div>
                            </div>
                            <div 
                                className="inline-flex align-items-center justify-content-center border-circle"
                                style={{ 
                                    width: '64px', 
                                    height: '64px',
                                    background: 'linear-gradient(135deg, #10b981, #059669)'
                                }}
                            >
                                <i className="pi pi-sign-in text-3xl text-white"></i>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Blocages */}
                <div className="col-12 md:col-6 lg:col-3">
                    <Card className="dashboard-card shadow-2">
                        <div className="flex align-items-center justify-content-between">
                            <div>
                                <div className="text-600 font-medium mb-2">Blocages</div>
                                <div className="text-900 text-4xl font-bold">{stats.today_blocks || 0}</div>
                                <div className="flex align-items-center gap-2 mt-2">
                                    <i className={`pi ${getTrendIcon(trends.blocks || 0)} text-sm ${getTrendColor(trends.blocks || 0)}`}></i>
                                    <span className={`text-sm font-medium ${getTrendColor(trends.blocks || 0)}`}>
                                        {Math.abs(trends.blocks || 0)}%
                                    </span>
                                    <span className="text-sm text-600">vs période précédente</span>
                                </div>
                            </div>
                            <div 
                                className="inline-flex align-items-center justify-content-center border-circle"
                                style={{ 
                                    width: '64px', 
                                    height: '64px',
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)'
                                }}
                            >
                                <i className="pi pi-lock text-3xl text-white"></i>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Créations */}
                <div className="col-12 md:col-6 lg:col-3">
                    <Card className="dashboard-card shadow-2">
                        <div className="flex align-items-center justify-content-between">
                            <div>
                                <div className="text-600 font-medium mb-2">Créations</div>
                                <div className="text-900 text-4xl font-bold">{stats.today_creations || 0}</div>
                                <div className="flex align-items-center gap-2 mt-2">
                                    <i className={`pi ${getTrendIcon(trends.creations || 0)} text-sm ${getTrendColor(trends.creations || 0)}`}></i>
                                    <span className={`text-sm font-medium ${getTrendColor(trends.creations || 0)}`}>
                                        {Math.abs(trends.creations || 0)}%
                                    </span>
                                    <span className="text-sm text-600">vs période précédente</span>
                                </div>
                            </div>
                            <div 
                                className="inline-flex align-items-center justify-content-center border-circle"
                                style={{ 
                                    width: '64px', 
                                    height: '64px',
                                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)'
                                }}
                            >
                                <i className="pi pi-user-plus text-3xl text-white"></i>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Graphiques */}
            <div className="grid">
                {/* Activité quotidienne */}
                <div className="col-12 xl:col-8">
                    <Card className="shadow-2" title="Activité quotidienne">
                        {dailyActivity.length > 0 ? (
                            <Chart type="line" data={dailyActivityData} options={chartOptions} />
                        ) : (
                            <div className="text-center text-600 py-4">Aucune donnée disponible</div>
                        )}
                    </Card>
                </div>

                {/* Répartition par type d'action */}
                <div className="col-12 xl:col-4">
                    <Card className="shadow-2" title="Répartition par action">
                        {actionBreakdown.length > 0 ? (
                            <Chart type="doughnut" data={actionData} />
                        ) : (
                            <div className="text-center text-600 py-4">Aucune donnée disponible</div>
                        )}
                    </Card>
                </div>

                {/* Heures de pointe */}
                <div className="col-12">
                    <Card className="shadow-2" title="Heures de pointe">
                        {hourlyActivity.length > 0 ? (
                            <Chart type="bar" data={hourlyData} options={chartOptions} />
                        ) : (
                            <div className="text-center text-600 py-4">Aucune donnée disponible</div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Tableaux de données */}
            <div className="grid">
                {/* Top utilisateurs connectés */}
                <div className="col-12 xl:col-4">
                    <Card className="shadow-2">
                        <div className="flex align-items-center justify-content-between mb-4">
                            <h3 className="text-900 text-xl font-bold m-0">
                                <i className="pi pi-users mr-2 text-blue-500"></i>
                                Top connexions
                            </h3>
                            <Tag value={topConnectedUsers.length} severity="info" />
                        </div>
                        <DataTable 
                            value={topConnectedUsers} 
                            stripedRows
                            emptyMessage="Aucune donnée"
                        >
                            <Column 
                                field="target_user" 
                                header="Utilisateur" 
                                body={(rowData) => userTemplate(rowData, 'target_user')}
                            />
                            <Column 
                                field="login_count" 
                                header="Connexions" 
                                body={(rowData) => countTemplate(rowData, 'login_count')}
                                align="right"
                            />
                        </DataTable>
                    </Card>
                </div>

                {/* Top utilisateurs bloqués */}
                <div className="col-12 xl:col-4">
                    <Card className="shadow-2">
                        <div className="flex align-items-center justify-content-between mb-4">
                            <h3 className="text-900 text-xl font-bold m-0">
                                <i className="pi pi-lock mr-2 text-red-500"></i>
                                Utilisateurs bloqués
                            </h3>
                            <Tag value={topBlockedUsers.length} severity="danger" />
                        </div>
                        <DataTable 
                            value={topBlockedUsers} 
                            stripedRows
                            emptyMessage="Aucune donnée"
                        >
                            <Column 
                                field="target_user" 
                                header="Utilisateur" 
                                body={(rowData) => userTemplate(rowData, 'target_user')}
                            />
                            <Column 
                                field="block_count" 
                                header="Blocages" 
                                body={(rowData) => countTemplate(rowData, 'block_count')}
                                align="right"
                            />
                        </DataTable>
                    </Card>
                </div>

                {/* Top admins actifs */}
                <div className="col-12 xl:col-4">
                    <Card className="shadow-2">
                        <div className="flex align-items-center justify-content-between mb-4">
                            <h3 className="text-900 text-xl font-bold m-0">
                                <i className="pi pi-shield mr-2 text-purple-500"></i>
                                Admins les plus actifs
                            </h3>
                            <Tag value={topAdmins.length} severity="help" />
                        </div>
                        <DataTable 
                            value={topAdmins} 
                            stripedRows
                            emptyMessage="Aucune donnée"
                        >
                            <Column 
                                field="performed_by_name" 
                                header="Administrateur"
                                body={(rowData) => (
                                    <div className="flex align-items-center gap-2">
                                        <i className="pi pi-user text-600"></i>
                                        <span className="font-medium">{rowData.performed_by_name || 'N/A'}</span>
                                    </div>
                                )}
                            />
                            <Column 
                                field="action_count" 
                                header="Actions" 
                                body={(rowData) => countTemplate(rowData, 'action_count')}
                                align="right"
                            />
                        </DataTable>
                    </Card>
                </div>

                {/* Derniers échecs */}
                <div className="col-12 xl:col-6">
                    <Card className="shadow-2">
                        <div className="flex align-items-center justify-content-between mb-4">
                            <h3 className="text-900 text-xl font-bold m-0">
                                <i className="pi pi-times-circle mr-2 text-red-500"></i>
                                Derniers échecs
                            </h3>
                            <Link href="/ad/activity-logs?status=failed">
                                <Button label="Voir tout" text size="small" />
                            </Link>
                        </div>
                        <DataTable 
                            value={recentFailures} 
                            stripedRows
                            emptyMessage="Aucun échec récent"
                        >
                            <Column field="action" header="Action" body={actionTemplate} />
                            <Column 
                                field="target_user" 
                                header="Utilisateur" 
                                body={(rowData) => userTemplate(rowData, 'target_user')}
                            />
                            <Column field="created_at" header="Date" body={dateTemplate} />
                        </DataTable>
                    </Card>
                </div>

                {/* Créations récentes */}
                <div className="col-12 xl:col-6">
                    <Card className="shadow-2">
                        <div className="flex align-items-center justify-content-between mb-4">
                            <h3 className="text-900 text-xl font-bold m-0">
                                <i className="pi pi-user-plus mr-2 text-green-500"></i>
                                Créations récentes
                            </h3>
                            <Link href="/ad/activity-logs?action=create_user">
                                <Button label="Voir tout" text size="small" />
                            </Link>
                        </div>
                        <DataTable 
                            value={recentCreations} 
                            stripedRows
                            emptyMessage="Aucune création récente"
                        >
                            <Column 
                                field="target_user" 
                                header="Utilisateur créé" 
                                body={(rowData) => userTemplate(rowData, 'target_user')}
                            />
                            <Column 
                                field="performed_by_name" 
                                header="Par"
                                body={(rowData) => (
                                    <span className="text-600">{rowData.performed_by_name || 'N/A'}</span>
                                )}
                            />
                            <Column field="created_at" header="Date" body={dateTemplate} />
                        </DataTable>
                    </Card>
                </div>
            </div>

            <style>{`
                .dashboard-card .p-card-body {
                    padding: 1.5rem;
                }

                .dashboard-card .p-card-content {
                    padding: 0;
                }

                :global(.p-card) {
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                    height: 100%;
                }

                :global(.p-datatable .p-datatable-tbody > tr:hover) {
                    background: #f9fafb;
                }

                :global(.shadow-2) {
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
                }
            `}</style>
        </Layout>
    );
}