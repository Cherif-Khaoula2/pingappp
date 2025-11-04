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
import { Message } from 'primereact/message';
import { ProgressBar } from 'primereact/progressbar';
import Layout from '@/Layouts/layout/layout.jsx';

export default function Dashboard({ 
    stats = {}, 
    activityData = [], 
    recentLogs = [], 
    period = 30, 
    error = null,
    actionBreakdown = [],
    topPerformers = []
}) {
    const [dateRange, setDateRange] = useState(null);
    const [selectedActions, setSelectedActions] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredLogs, setFilteredLogs] = useState(recentLogs);
    const [periodFilter, setPeriodFilter] = useState(period);

    const safeStats = stats || {};
    const safeActivityData = Array.isArray(activityData) ? activityData : [];
    const safeRecentLogs = Array.isArray(recentLogs) ? recentLogs : [];
    const safeActionBreakdown = Array.isArray(actionBreakdown) ? actionBreakdown : [];
    const safeTopPerformers = Array.isArray(topPerformers) ? topPerformers : [];

    // Options pour les filtres - Actions complètes
    const actionOptions = [
        { label: 'Connexion', value: 'login' },
        { label: 'Déconnexion', value: 'logout' },
        { label: 'Blocage', value: 'block_user' },
        { label: 'Déblocage', value: 'unblock_user' },
        { label: 'Création', value: 'create_user' },
        { label: 'Réinitialisation MDP', value: 'reset_password' },
        { label: 'Changement MDP', value: 'change_password' }
    ];

   const periodOptions = [
        { label: '1 jour', value: 1 },
        { label: '7 jours', value: 7 },
        { label: '30 jours', value: 30 },
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

    // Graphique d'activité temporelle - Responsive
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
                pointRadius: 3,
                pointHoverRadius: 6,
                borderWidth: 2
            }
        ]
    };

    const activityChartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: { 
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 12,
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
                cornerRadius: 8
            }
        },
        scales: {
            x: { 
                grid: { display: false },
                ticks: { 
                    font: { size: 10 },
                    maxRotation: 45,
                    minRotation: 0
                }
            },
            y: { 
                beginAtZero: true, 
                ticks: { 
                    precision: 0, 
                    font: { size: 10 }
                },
                grid: { color: 'rgba(0,0,0,0.05)' }
            }
        }
    };

    // Graphique répartition des actions - Responsive
    const actionChartData = {
        labels: safeActionBreakdown.map(a => a.action),
        datasets: [{
            data: safeActionBreakdown.map(a => a.count),
            backgroundColor: [
                '#10b981', // Vert - Connexion
                '#f59e0b', // Orange - Déconnexion
                '#ef4444', // Rouge - Blocage
                '#3b82f6', // Bleu - Déblocage
                '#8b5cf6', // Violet - Création
                '#ec4899', // Rose - Modification
                '#06b6d4', // Cyan - Suppression
                '#f97316', // Orange foncé - Reset MDP
                '#14b8a6'  // Teal - Change MDP
            ],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };

    const pieChartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { 
                    padding: 12, 
                    font: { size: 11 },
                    boxWidth: 12,
                    usePointStyle: true
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 10,
                cornerRadius: 8
            }
        }
    };

    // Cartes statistiques améliorées avec toutes les actions
    const statCards = [
        
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
            color: "bg-amber-500",
            percentage: safeStats.total_logs > 0 ? ((safeStats.logout_count / safeStats.total_logs) * 100).toFixed(1) : 0
        },
        { 
            label: "Créations", 
            value: safeStats.create_count ?? 0, 
            icon: "pi pi-user-plus", 
            color: "bg-cyan-500"
        },
        
        { 
            label: "Blocages", 
            value: safeStats.block_count ?? 0, 
            icon: "pi pi-lock", 
            color: "bg-red-500",
            alert: safeStats.block_count > 10
        },
        { 
            label: "Déblocages", 
            value: safeStats.unblock_count ?? 0, 
            icon: "pi pi-unlock", 
            color: "bg-teal-500"
        },
        { 
            label: "Reset MDP", 
            value: safeStats.reset_password_count ?? 0, 
            icon: "pi pi-refresh", 
            color: "bg-orange-500"
        },
      
       
    ];

    // Templates pour DataTable
    const actionTemplate = (row) => {
        const severityMap = {
            'login': 'success',
            'logout': 'warning',
            'block_user': 'danger',
            'unblock_user': 'info',
            'create_user': 'info', 
            'reset_password': 'warning',
            'change_password': 'info'
        };
        
        const labelMap = {
            'login': 'Connexion',
            'logout': 'Déconnexion',
            'block_user': 'Blocage',
            'unblock_user': 'Déblocage',
            'create_user': 'Création',
            'reset_password': 'Reset MDP',
            'change_password': 'Change MDP'
        };
        
        return <Tag value={labelMap[row.action] || row.action} severity={severityMap[row.action] || 'secondary'} />;
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

            <div className="p-3 md:p-6">
                {/* En-tête - Responsive */}
                <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-bold text-900 m-0">Dashboard Active Directory</h1>
                        <p className="text-sm md:text-base text-600 mt-1 md:mt-2">Vue d'ensemble des activités et statistiques</p>
                    </div>
                    <Dropdown 
                        value={periodFilter} 
                        options={periodOptions} 
                        onChange={handlePeriodChange}
                        placeholder="Période"
                        className="w-full md:w-10rem"
                    />
                </div>

                {error && (
                    <Message severity="error" text={error} className="mb-4 w-full" />
                )}

                {/* Cartes statistiques - Grid responsive */}
                <div className="grid mb-3 md:mb-4">
                    {statCards.map((stat, i) => (
                        <div key={i} className="col-6 md:col-4 lg:col-3 xl:col-2">
                            <Card className="shadow-2 md:shadow-3 border-round-lg overflow-hidden hover:shadow-4 transition-all transition-duration-300 h-full">
                                <div className="flex flex-column md:flex-row align-items-start justify-content-between gap-2">
                                    <div className="flex-1 w-full">
                                        <p className="text-xs md:text-sm text-600 mb-1 md:mb-2 font-medium">{stat.label}</p>
                                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-900 mb-1 md:mb-2">{stat.value}</h2>
                                        {stat.percentage !== undefined && (
                                            <div className="mt-1 md:mt-2">
                                                <ProgressBar 
                                                    value={parseFloat(stat.percentage)} 
                                                    showValue={false}
                                                    style={{ height: '4px' }}
                                                    color={stat.alert ? '#ef4444' : '#6366f1'}
                                                />
                                                <span className="text-xs text-600 mt-1 block">{stat.percentage}%</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={`w-3rem h-3rem md:w-4rem md:h-4rem flex align-items-center justify-content-center text-white border-circle ${stat.color} ${stat.alert ? 'animation-pulse' : ''}`}>
                                        <i className={`${stat.icon} text-lg md:text-2xl`}></i>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>

                {/* Graphiques principaux - Responsive */}
                <div className="grid mb-3 md:mb-4">
                    {/* Graphique d'activité temporelle */}
                    <div className="col-12 lg:col-8">
                        <Card title={`Évolution de l'activité (${period} jours)`} className="shadow-2 md:shadow-3">
                            <div style={{ height: '250px', minHeight: '250px' }} className="md:h-auto" >
                                {safeActivityData.length > 0 ? (
                                    <Chart type="line" data={activityChartData} options={activityChartOptions} />
                                ) : (
                                    <div className="flex align-items-center justify-content-center h-full">
                                        <div className="text-center">
                                            <i className="pi pi-chart-line text-5xl text-300 mb-3"></i>
                                            <p className="text-600">Aucune donnée disponible</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Répartition des actions */}
                    <div className="col-12 lg:col-4">
                        <Card title="Répartition par type" className="shadow-2 md:shadow-3">
                            <div style={{ height: '250px', minHeight: '250px' }} className="md:h-auto">
                                {safeActionBreakdown.length > 0 ? (
                                    <Chart type="doughnut" data={actionChartData} options={pieChartOptions} />
                                ) : (
                                    <div className="flex align-items-center justify-content-center h-full">
                                        <div className="text-center">
                                            <i className="pi pi-chart-pie text-5xl text-300 mb-3"></i>
                                            <p className="text-600">Aucune donnée disponible</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Section inférieure - Responsive */}
                <div className="grid mb-3 md:mb-4">
                    {/* Journal d'activité détaillé */}
                    <div className="col-12 lg:col-8">
                        <Card title="Journal d'activité détaillé" className="shadow-2 md:shadow-3">
                        
                            {/* Résultats du filtrage */}
                            <div className="mb-3 flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center gap-2">
                                <span className="text-sm md:text-base text-600">
                                    <i className="pi pi-info-circle mr-2"></i>
                                    {filteredLogs.length} résultat(s) sur {safeRecentLogs.length}
                                </span>
                                <Link href="/ad/activity-logs">
                                    <Button 
                                        label="Historique complet" 
                                        icon="pi pi-external-link" 
                                        className="p-button-sm p-button-text"
                                    />
                                </Link>
                            </div>

                            {/* DataTable - Responsive */}
                            {filteredLogs.length > 0 ? (
                                <DataTable 
                                    value={filteredLogs} 
                                    rows={10}
                                    dataKey="id"
                                    className="p-datatable-sm"
                                    stripedRows
                                    responsiveLayout="stack"
                                    breakpoint="768px"
                                    scrollable
                                    scrollHeight="400px"
                                >
                                    <Column 
                                        field="performer_name" 
                                        header="Utilisateur" 
                                        sortable 
                                        style={{ minWidth: '150px' }}
                                        headerStyle={{ fontSize: '0.875rem' }}
                                        bodyStyle={{ fontSize: '0.875rem' }}
                                    />
                                    <Column 
                                        field="action" 
                                        header="Action" 
                                        body={actionTemplate} 
                                        sortable 
                                        style={{ minWidth: '120px' }}
                                        headerStyle={{ fontSize: '0.875rem' }}
                                    />
                                  
                                    <Column 
                                        field="created_at_formatted" 
                                        header="Date" 
                                        sortable 
                                        style={{ minWidth: '150px' }}
                                        headerStyle={{ fontSize: '0.875rem' }}
                                        bodyStyle={{ fontSize: '0.875rem' }}
                                    />
                                </DataTable>
                            ) : (
                                <div className="text-center p-4 md:p-5 bg-gray-50 border-round-md">
                                    <i className="pi pi-inbox text-4xl md:text-5xl text-400 mb-3"></i>
                                    <p className="text-600 text-base md:text-lg">Aucun résultat ne correspond à vos critères</p>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Top utilisateurs - Responsive */}
                    <div className="col-12 lg:col-4">
                        <Card title="Utilisateurs les plus actifs" className="shadow-2 md:shadow-3">
                            <div className="flex flex-column gap-2 md:gap-3">
                                {safeTopPerformers.length > 0 ? (
                                    safeTopPerformers.slice(0, 5).map((user, idx) => (
                                        <div key={idx} className="flex align-items-center justify-content-between p-2 md:p-3 border-round-md bg-gray-50 hover:bg-gray-100 transition-colors transition-duration-200 cursor-pointer">
                                            <div className="flex align-items-center gap-2 md:gap-3 flex-1 overflow-hidden">
                                                <div className={`w-2rem h-2rem md:w-3rem md:h-3rem flex align-items-center justify-content-center border-circle font-bold text-white text-sm md:text-base flex-shrink-0 ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-indigo-500'}`}>
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="font-semibold text-900 m-0 text-sm md:text-base truncate">{user.name}</p>
                                                    <p className="text-xs md:text-sm text-600 m-0">{user.count} activités</p>
                                                </div>
                                            </div>
                                            <i className="pi pi-chevron-right text-600 text-sm flex-shrink-0"></i>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center p-4">
                                        <i className="pi pi-users text-4xl text-300 mb-2"></i>
                                        <p className="text-600 text-sm">Aucun utilisateur actif</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                .animation-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                
                /* Amélioration responsive */
                @media (max-width: 768px) {
                    .p-datatable .p-datatable-tbody > tr > td {
                        padding: 0.5rem !important;
                    }
                    .p-card .p-card-body {
                        padding: 1rem !important;
                    }
                    .p-card .p-card-title {
                        font-size: 1rem !important;
                    }
                }
            `}</style>
        </Layout>
    );
}