import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { InputText } from 'primereact/inputtext';
import { Skeleton } from 'primereact/skeleton';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { ProgressBar } from 'primereact/progressbar';
import Layout from '@/Layouts/layout/layout.jsx';

export default function Dashboard({ 
    stats = {}, 
    activityData = [], 
    recentLogs = [], 
    period = 30, 
    error = null,
    actionBreakdown = [],
    statusBreakdown = [],
    topPerformers = [],
    hourlyActivity = []
}) {
    const [dateRange, setDateRange] = useState(null);
    const [selectedActions, setSelectedActions] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredLogs, setFilteredLogs] = useState(recentLogs);
    const [periodFilter, setPeriodFilter] = useState(30);

    const safeStats = stats || {};
    const safeActivityData = Array.isArray(activityData) ? activityData : [];
    const safeRecentLogs = Array.isArray(recentLogs) ? recentLogs : [];
    const safeActionBreakdown = Array.isArray(actionBreakdown) ? actionBreakdown : [];
    const safeStatusBreakdown = Array.isArray(statusBreakdown) ? statusBreakdown : [];
    const safeTopPerformers = Array.isArray(topPerformers) ? topPerformers : [];
    const safeHourlyActivity = Array.isArray(hourlyActivity) ? hourlyActivity : [];

    // Options pour les filtres
    const actionOptions = [
        { label: 'Connexion', value: 'login' },
        { label: 'Déconnexion', value: 'logout' },
        { label: 'Blocage', value: 'block_user' },
        { label: 'Déblocage', value: 'unblock_user' },
        { label: 'Création', value: 'create_user' },
        { label: 'Modification', value: 'update_user' }
    ];

    const statusOptions = [
        { label: 'Succès', value: 'succeeded' },
        { label: 'Échec', value: 'failed' }
    ];

    const periodOptions = [
        { label: '7 jours', value: 7 },
        { label: '30 jours', value: 30 },
        { label: '90 jours', value: 90 },
        { label: '6 mois', value: 180 },
        { label: '1 an', value: 365 }
    ];

    // Filtrage des logs
    useEffect(() => {
        let filtered = [...safeRecentLogs];

        if (searchTerm) {
            filtered = filtered.filter(log => 
                log.performer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.action?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedActions && selectedActions.length > 0) {
            filtered = filtered.filter(log => selectedActions.includes(log.action));
        }

        if (selectedStatus) {
            filtered = filtered.filter(log => log.status === selectedStatus);
        }

        setFilteredLogs(filtered);
    }, [searchTerm, selectedActions, selectedStatus, safeRecentLogs]);

    // Graphique d'activité temporelle
    const activityChartData = {
        labels: safeActivityData.map(d => d.date),
        datasets: [
            {
                label: 'Activités',
                data: safeActivityData.map(d => d.total),
                fill: true,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99,102,241,0.2)',
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ]
    };

    const activityChartOptions = {
        maintainAspectRatio: false,
        plugins: { 
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 12,
                titleFont: { size: 14 },
                bodyFont: { size: 13 }
            }
        },
        scales: {
            x: { 
                grid: { display: false },
                ticks: { font: { size: 11 } }
            },
            y: { 
                beginAtZero: true, 
                ticks: { precision: 0, font: { size: 11 } },
                grid: { color: 'rgba(0,0,0,0.05)' }
            }
        }
    };

    // Graphique répartition des actions
    const actionChartData = {
        labels: safeActionBreakdown.map(a => a.action),
        datasets: [{
            data: safeActionBreakdown.map(a => a.count),
            backgroundColor: [
                '#10b981',
                '#f59e0b',
                '#ef4444',
                '#3b82f6',
                '#8b5cf6',
                '#ec4899'
            ]
        }]
    };

    const pieChartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { padding: 15, font: { size: 12 } }
            }
        }
    };

    // Graphique activité horaire
    const hourlyChartData = {
        labels: safeHourlyActivity.map(h => `${h.hour}h`),
        datasets: [{
            label: 'Activités par heure',
            data: safeHourlyActivity.map(h => h.count),
            backgroundColor: 'rgba(99,102,241,0.6)',
            borderColor: '#6366f1',
            borderWidth: 1
        }]
    };

    const barChartOptions = {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { precision: 0 } }
        }
    };

    // Cartes statistiques améliorées
    const statCards = [
        { 
            label: "Total Activités", 
            value: safeStats.total_logs ?? 0, 
            icon: "pi pi-database", 
            color: "bg-indigo-500",
            trend: "+12%",
            trendIcon: "pi pi-arrow-up",
            trendColor: "text-green-500"
        },
        { 
            label: "Aujourd'hui", 
            value: safeStats.today_logs ?? 0, 
            icon: "pi pi-calendar", 
            color: "bg-blue-500",
            trend: "+5%",
            trendIcon: "pi pi-arrow-up",
            trendColor: "text-green-500"
        },
        { 
            label: "Connexions", 
            value: safeStats.login_count ?? 0, 
            icon: "pi pi-sign-in", 
            color: "bg-green-500",
            percentage: safeStats.total_logs > 0 ? ((safeStats.login_count / safeStats.total_logs) * 100).toFixed(1) : 0
        },
        { 
            label: "Déconnexions", 
            value: safeStats.logout_count ?? 0, 
            icon: "pi pi-sign-out", 
            color: "bg-teal-500",
            percentage: safeStats.total_logs > 0 ? ((safeStats.logout_count / safeStats.total_logs) * 100).toFixed(1) : 0
        },
        { 
            label: "Blocages", 
            value: safeStats.block_count ?? 0, 
            icon: "pi pi-lock", 
            color: "bg-red-500",
            alert: safeStats.block_count > 10
        },
        { 
            label: "Taux d'échec", 
            value: safeStats.failed ?? 0, 
            icon: "pi pi-times-circle", 
            color: "bg-orange-500",
            percentage: safeStats.total_logs > 0 ? ((safeStats.failed / safeStats.total_logs) * 100).toFixed(1) : 0,
            alert: ((safeStats.failed / safeStats.total_logs) * 100) > 5
        },
    ];

    // Templates pour DataTable
    const actionTemplate = (row) => {
        const severityMap = {
            'login': 'info',
            'logout': 'warning',
            'block_user': 'danger',
            'unblock_user': 'success',
            'create_user': 'info',
            'update_user': 'secondary'
        };
        return <Tag value={row.action} severity={severityMap[row.action] || 'secondary'} />;
    };

    const statusTemplate = (row) => {
        return <Tag value={row.status} severity={row.status === 'succeeded' ? 'success' : 'danger'} />;
    };

    const handlePeriodChange = (e) => {
        setPeriodFilter(e.value);
        router.get('/dashboard', { period: e.value }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedActions(null);
        setSelectedStatus(null);
        setDateRange(null);
    };

    return (
        <Layout>
            <Head title="Dashboard AD - Vue d'ensemble" />

            <div className="p-6">
                {/* En-tête avec filtres globaux */}
                <div className="flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="text-4xl font-bold text-900 m-0">Dashboard Active Directory</h1>
                        <p className="text-600 mt-2">Vue d'ensemble des activités et statistiques</p>
                    </div>
                    <Dropdown 
                        value={periodFilter} 
                        options={periodOptions} 
                        onChange={handlePeriodChange}
                        placeholder="Période"
                        className="w-10rem"
                    />
                </div>

                {error && (
                    <Message severity="error" text={error} className="mb-4 w-full" />
                )}

                {/* Cartes statistiques */}
                <div className="grid mb-4">
                    {statCards.map((stat, i) => (
                        <div key={i} className="col-12 md:col-6 lg:col-4 xl:col-2">
                            <Card className="shadow-3 border-round-lg overflow-hidden hover:shadow-4 transition-all transition-duration-300">
                                <div className="flex align-items-start justify-content-between">
                                    <div className="flex-1">
                                        <p className="text-sm text-600 mb-2 font-medium">{stat.label}</p>
                                        <h2 className="text-4xl font-bold text-900 mb-2">{stat.value}</h2>
                                        {stat.trend && (
                                            <div className={`flex align-items-center gap-1 ${stat.trendColor}`}>
                                                <i className={stat.trendIcon}></i>
                                                <span className="text-sm font-semibold">{stat.trend}</span>
                                            </div>
                                        )}
                                        {stat.percentage !== undefined && (
                                            <div className="mt-2">
                                                <ProgressBar 
                                                    value={parseFloat(stat.percentage)} 
                                                    showValue={false}
                                                    style={{ height: '6px' }}
                                                    color={stat.alert ? '#ef4444' : '#6366f1'}
                                                />
                                                <span className="text-xs text-600 mt-1 block">{stat.percentage}% du total</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={`w-4rem h-4rem flex align-items-center justify-content-center text-white border-circle ${stat.color} ${stat.alert ? 'animation-pulse' : ''}`}>
                                        <i className={`${stat.icon} text-2xl`}></i>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>

                {/* Graphiques principaux */}
                <div className="grid mb-4">
                    {/* Graphique d'activité temporelle */}
                    <div className="col-12 lg:col-8">
                        <Card title={`Évolution de l'activité (${period} jours)`} className="shadow-3">
                            <div style={{ height: '350px' }}>
                                {safeActivityData.length > 0 ? (
                                    <Chart type="line" data={activityChartData} options={activityChartOptions} />
                                ) : (
                                    <div className="flex align-items-center justify-content-center h-full">
                                        <p className="text-600">Aucune donnée disponible</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Répartition des actions */}
                    <div className="col-12 lg:col-4">
                        <Card title="Répartition par type" className="shadow-3">
                            <div style={{ height: '350px' }}>
                                {safeActionBreakdown.length > 0 ? (
                                    <Chart type="doughnut" data={actionChartData} options={pieChartOptions} />
                                ) : (
                                    <div className="flex align-items-center justify-content-center h-full">
                                        <p className="text-600">Aucune donnée disponible</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Graphiques secondaires */}
                <div className="grid mb-4">
                    {/* Activité horaire */}
                    <div className="col-12 lg:col-8">
                        <Card title="Activité par heure de la journée" className="shadow-3">
                            <div style={{ height: '300px' }}>
                                {safeHourlyActivity.length > 0 ? (
                                    <Chart type="bar" data={hourlyChartData} options={barChartOptions} />
                                ) : (
                                    <div className="flex align-items-center justify-content-center h-full">
                                        <p className="text-600">Aucune donnée disponible</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Top utilisateurs */}
                    <div className="col-12 lg:col-4">
                        <Card title="Utilisateurs les plus actifs" className="shadow-3">
                            <div className="flex flex-column gap-3">
                                {safeTopPerformers.length > 0 ? (
                                    safeTopPerformers.slice(0, 5).map((user, idx) => (
                                        <div key={idx} className="flex align-items-center justify-content-between p-3 border-round-md bg-gray-50 hover:bg-gray-100 transition-colors transition-duration-200">
                                            <div className="flex align-items-center gap-3">
                                                <div className={`w-3rem h-3rem flex align-items-center justify-content-center border-circle font-bold text-white ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-indigo-500'}`}>
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-900 m-0">{user.name}</p>
                                                    <p className="text-sm text-600 m-0">{user.count} activités</p>
                                                </div>
                                            </div>
                                            <i className="pi pi-chevron-right text-600"></i>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-600 p-3">Aucun utilisateur actif</p>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Table des logs avec filtres avancés */}
                <Card title="Journal d'activité détaillé" className="shadow-3">
                    {/* Barre de filtres */}
                    <div className="grid mb-3 p-3 bg-gray-50 border-round-md">
                        <div className="col-12 md:col-3">
                            <span className="p-input-icon-left w-full">
                                <i className="pi pi-search" />
                                <InputText 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Rechercher..."
                                    className="w-full"
                                />
                            </span>
                        </div>
                        <div className="col-12 md:col-3">
                            <MultiSelect 
                                value={selectedActions}
                                options={actionOptions}
                                onChange={(e) => setSelectedActions(e.value)}
                                placeholder="Types d'action"
                                className="w-full"
                                display="chip"
                            />
                        </div>
                        <div className="col-12 md:col-2">
                            <Dropdown 
                                value={selectedStatus}
                                options={statusOptions}
                                onChange={(e) => setSelectedStatus(e.value)}
                                placeholder="Statut"
                                className="w-full"
                                showClear
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <Calendar 
                                value={dateRange}
                                onChange={(e) => setDateRange(e.value)}
                                selectionMode="range"
                                placeholder="Plage de dates"
                                className="w-full"
                                showIcon
                            />
                        </div>
                        <div className="col-12 md:col-1 flex align-items-center">
                            <Button 
                                icon="pi pi-filter-slash"
                                onClick={clearFilters}
                                className="p-button-outlined w-full"
                                tooltip="Réinitialiser"
                            />
                        </div>
                    </div>

                    {/* Résultats du filtrage */}
                    <div className="mb-3 flex justify-content-between align-items-center">
                        <span className="text-600">
                            <i className="pi pi-info-circle mr-2"></i>
                            {filteredLogs.length} résultat(s) sur {safeRecentLogs.length}
                        </span>
                        <Link href="/ad/activity-logs">
                            <Button 
                                label="Voir l'historique complet" 
                                icon="pi pi-external-link" 
                                className="p-button-sm p-button-text"
                            />
                        </Link>
                    </div>

                    {/* DataTable */}
                    {filteredLogs.length > 0 ? (
                        <DataTable 
                            value={filteredLogs} 
                            paginator 
                            rows={10}
                            rowsPerPageOptions={[10, 25, 50]}
                            dataKey="id"
                            className="p-datatable-sm"
                            stripedRows
                            responsiveLayout="scroll"
                        >
                            <Column field="performer_name" header="Utilisateur" sortable style={{ minWidth: '200px' }} />
                            <Column field="action" header="Action" body={actionTemplate} sortable style={{ minWidth: '150px' }} />
                            <Column field="status" header="Statut" body={statusTemplate} sortable style={{ minWidth: '120px' }} />
                            <Column field="created_at_formatted" header="Date" sortable style={{ minWidth: '180px' }} />
                        </DataTable>
                    ) : (
                        <div className="text-center p-5 bg-gray-50 border-round-md">
                            <i className="pi pi-inbox text-5xl text-400 mb-3"></i>
                            <p className="text-600 text-lg">Aucun résultat ne correspond à vos critères</p>
                        </div>
                    )}
                </Card>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                .animation-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </Layout>
    );
}