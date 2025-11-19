import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { ProgressBar } from 'primereact/progressbar';
import { Divider } from 'primereact/divider';
import Layout from '@/Layouts/layout/layout.jsx';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function Dashboard({ 
    stats = {}, 
    activityData = [], 
    recentLogs = [], 
    period = 30, 
    error = null,
    actionBreakdown = [],
    topPerformers = [],
    topSites = []
}) {
    const [dateRange, setDateRange] = useState(null);
    const [selectedActions, setSelectedActions] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredLogs, setFilteredLogs] = useState(recentLogs);
    const [periodFilter, setPeriodFilter] = useState(period);

    const pageProps = usePage().props;
    const { permissions = [] } = pageProps;
    
    const canViewLogs = permissions.includes("getlog");
    
    const safeStats = stats || {};
    const safeActivityData = Array.isArray(activityData) ? activityData : [];
    const safeRecentLogs = Array.isArray(recentLogs) ? recentLogs : [];
    const safeActionBreakdown = Array.isArray(actionBreakdown) ? actionBreakdown : [];
    const safeTopPerformers = Array.isArray(topPerformers) ? topPerformers : [];
    const safeTopSites = Array.isArray(topSites) ? topSites : [];

    const periodOptions = [
        { label: 'Dernières 24h', value: 1 },
        { label: '7 derniers jours', value: 7 },
        { label: '30 derniers jours', value: 30 },
        { label: '6 derniers mois', value: 180 },
        { label: 'Dernière année', value: 365 }
    ];

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

    const activityChartData = {
        labels: safeActivityData.map(d => d.date),
        datasets: [
            {
                label: 'Nombre d\'activités',
                data: safeActivityData.map(d => d.total),
                fill: true,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointBackgroundColor: '#4f46e5',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                borderWidth: 3
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
            legend: { 
                display: true,
                position: 'top',
                align: 'end',
                labels: {
                    boxWidth: 12,
                    padding: 15,
                    font: { size: 12, weight: '500' },
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                padding: 16,
                titleFont: { size: 14, weight: '600' },
                bodyFont: { size: 13 },
                cornerRadius: 8,
                displayColors: false,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1
            }
        },
        scales: {
            x: { 
                grid: { 
                    display: false 
                },
                ticks: { 
                    font: { size: 11, weight: '500' },
                    color: '#6b7280',
                    maxRotation: 0,
                    padding: 8
                },
                border: {
                    display: false
                }
            },
            y: { 
                beginAtZero: true, 
                ticks: { 
                    precision: 0, 
                    font: { size: 11, weight: '500' },
                    color: '#6b7280',
                    padding: 8
                },
                grid: { 
                    color: 'rgba(0, 0, 0, 0.04)',
                    drawBorder: false
                },
                border: {
                    display: false
                }
            }
        }
    };

    const includedActions = [ 'Création', 'Blocage', 'Déblocage', 'Reset MDP' ,'Modification'];
    const filteredActionBreakdown = safeActionBreakdown.filter(a => includedActions.includes(a.action));
    
const actionChartData = {
        labels: filteredActionBreakdown.map(a => a.action),
        datasets: [{
            data: filteredActionBreakdown.map(a => a.count),
            backgroundColor: filteredActionBreakdown.map(a => {
            switch(a.action) {
                case 'Création': 
                    return '#06b6d4';
                case 'Blocage': 
                    return '#ef4444';  
                case 'Déblocage': 
                    return '#14b8a6'; 
                case 'Reset MDP':
                    return '#f97316';
                case 'Modification':
                    return '#f59e0b';
                default: 
                    return '#6b7280'; 
            }

            }),
            borderWidth: 0,
            hoverOffset: 8
        }]
    };
    const pieChartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
                labels: { 
                    padding: 16,
                    font: { size: 12, weight: '500' },
                    boxWidth: 12,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    color: '#374151'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                padding: 14,
                cornerRadius: 8,
                titleFont: { size: 13, weight: '600' },
                bodyFont: { size: 12 },
                displayColors: true,
                boxWidth: 10,
                boxHeight: 10,
                usePointStyle: true,
                callbacks: {
                    label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                    }
                }
            }
        }
    };

    const statCards = [
        
         { 
            label: "Créations", 
            value: safeStats.create_count ?? 0, 
            icon: "pi pi-user-plus", 
            color: "bg-cyan-500",
            lightColor: "bg-cyan-50",
            percentage: safeStats.total_logs > 0 ? ((safeStats.create_count / safeStats.total_logs) * 100).toFixed(1): 0
        },
        {
            
            label: "Modifications", 
            value: safeStats.update_count ?? 0, // si c'est pour "Modification"
            icon: "pi pi-pencil", // icône plus appropriée pour Modification
            color: "bg-orange-500", // correspond à #f97316 dans Tailwind
            lightColor: "bg-orange-50",
            percentage: safeStats.total_logs > 0 
                ? ((safeStats.update_count / safeStats.total_logs) * 100).toFixed(1) 
                : 0
         },

        
        { 
            label: "Blocages", 
            value: safeStats.block_count ?? 0, 
            icon: "pi pi-lock", 
            color: "bg-red-500",
            lightColor: "bg-red-50",
            percentage: safeStats.total_logs > 0 ? ((safeStats.block_count / safeStats.total_logs) * 100).toFixed(1): 0,
        },
        { 
            label: "Déblocages", 
            value: safeStats.unblock_count ?? 0, 
            icon: "pi pi-unlock", 
            color: "bg-teal-500",
            lightColor: "bg-teal-50",
            percentage: safeStats.total_logs > 0 ? ((safeStats.unblock_count / safeStats.total_logs) * 100).toFixed(1): 0
        },
        { 
            label: "Réinitialisations MDP", 
            value: safeStats.reset_password_count ?? 0, 
            icon: "pi pi-refresh", 
            color: "bg-orange-500",
            lightColor: "bg-orange-50",
            percentage: safeStats.total_logs > 0 ? ((safeStats.reset_password_count / safeStats.total_logs) * 100).toFixed(1): 0
        },
    ];

    const actionTemplate = (row) => {
        const severityMap = {
            'login': 'success',
            'logout': 'warning',
            'block_user': 'danger',
            'unblock_user': 'warning',
            'create_user': 'help', 
            'reset_password': 'warning',
            'search_user': 'info',
            'create_dn': 'success',
            'update_dn': 'warning',
            'delete_dn': 'danger',
            'assign_dns_to_user': 'primary',
            'assign_dn_to_users': 'success',
            'unassign_dn_from_users': 'danger',
            'hide_account': 'warning',
            'unhide_account': 'success',
            'authorize_ldap_user': 'success',
            'unauthorize_ldap_user': 'danger',
            'update_user': 'primary',

        };
        
        const labelMap = {
            'login': 'Connexion',
            'logout': 'Déconnexion',
            'block_user': 'Blocage',
            'unblock_user': 'Déblocage',
            'create_user': 'Création AD',
            'create_exchange_mailbox': 'Création Exchange',
            'reset_password': 'Reset MDP',
            'search_user': 'Recherche utilisateur',
            'create_dn': 'Création DN',
            'update_dn': 'Modification DN',
            'delete_dn': 'Suppression DN',
            'assign_dns_to_user': 'Affectation DNs',
            'assign_dn_to_users': 'Ajout utilisateurs DN',
            'unassign_dn_from_users': 'Retrait utilisateurs DN',
            'hide_account': 'Masquage',
            'unhide_account': 'Démasquage',
            'authorize_ldap_user': 'Autorisation',
            'unauthorize_ldap_user': 'Désautorisation',
            'update_user': 'Modification utilisateur' 


        };
        
        return <Tag value={labelMap[row.action] || row.action} severity={severityMap[row.action] || 'secondary'} rounded />;
    };

    const handlePeriodChange = (e) => {
        setPeriodFilter(e.value);
        router.get('/dashboard', { period: e.value }, { preserveState: true });
    };

    const filteredTopPerformers = safeTopPerformers.filter(user => {
        const name = user.name?.trim() || "";
        return name !== "" && 
               name !== "Système" 
    });

    const totalActivities = safeStats.total_logs || 0;
    const avgDailyActivities = safeActivityData.length > 0 
        ? Math.round(safeActivityData.reduce((sum, d) => sum + d.total, 0) / safeActivityData.length)
        : 0;

    return (
        <Layout>
            <Head title="Dashboard AD - Vue d'ensemble" />

            <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
                {/* En-tête */}
                <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-5 gap-3">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-900 m-0 mb-2">Dashboard Active Directory</h1>
                        <p className="text-base text-600 m-0 flex align-items-center gap-2">
                            <i className="pi pi-chart-line text-sm"></i>
                            Analyse des activités sur {period} jours • {totalActivities.toLocaleString()} événements
                        </p>
                    </div>
                    <Dropdown 
                        value={periodFilter} 
                        options={periodOptions} 
                        onChange={handlePeriodChange}
                        placeholder="Sélectionner une période"
                        className="w-full md:w-15rem shadow-2"
                    />
                </div>

                {error && (
                    <Message severity="error" text={error} className="mb-4 w-full" />
                )}

                {/* Cartes de statistiques */}
              <div className="grid mb-4" style={{ 
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '1rem'
}}>
    {statCards.map((stat, i) => (
        <Card key={i} className="shadow-3 border-round-xl overflow-hidden hover:shadow-4 h-full border-1 surface-border">
            <div className="flex flex-column gap-3">
                <div className="flex align-items-center justify-content-between">
                    <div className={`${stat.lightColor} p-3 border-round-lg`}>
                        <i className={`${stat.icon} ${stat.color.replace('bg-', 'text-')} text-2xl`}></i>
                    </div>
                </div>

                <div>
                    <p className="text-sm text-600 mb-2 font-medium uppercase" style={{ letterSpacing: '0.5px' }}>
                        {stat.label}
                    </p>
                    <h2 className="text-4xl font-bold text-900 m-0 mb-3">
                        {stat.value.toLocaleString()}
                    </h2>

                    {stat.percentage !== undefined && (
                        <div>
                            <div className="flex align-items-center justify-content-between mb-2">
                                <span className="text-xs text-600 font-medium">Part du total</span>
                                <span className="text-xs font-semibold text-900">{stat.percentage}%</span>
                            </div>
                            <ProgressBar 
                                value={parseFloat(stat.percentage)}
                                showValue={false}
                                style={{ height: '6px' }}
                                className="border-round-lg"
                            />
                        </div>
                    )}
                </div>
            </div>
        </Card>
    ))}
</div>


                {/* Graphiques */}
                <div className="grid mb-4">
                    <div className="col-12 lg:col-8">
                        <Card className="shadow-3 border-round-xl h-full border-1 surface-border">
                            <div className="flex align-items-center justify-content-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-900 m-0 mb-2">Évolution de l'activité</h3>
                                    <p className="text-sm text-600 m-0">
                                        Tendance sur {period} jours • Moyenne: {avgDailyActivities} activités/jour
                                    </p>
                                </div>
                            </div>
                            <Divider className="my-3" />
                            <div style={{ height: '350px' }}>
                                {safeActivityData.length > 0 ? (
                                    <Chart type="line" data={activityChartData} options={activityChartOptions} />
                                ) : (
                                    <div className="flex align-items-center justify-content-center h-full">
                                        <div className="text-center">
                                            <div className="bg-gray-100 w-5rem h-5rem flex align-items-center justify-content-center border-circle mx-auto mb-3">
                                                <i className="pi pi-chart-line text-4xl text-400"></i>
                                            </div>
                                            <p className="text-600 font-medium">Aucune donnée d'activité disponible</p>
                                            <p className="text-sm text-500">Sélectionnez une autre période</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className="col-12 lg:col-4">
                        <Card className="shadow-3 border-round-xl h-full border-1 surface-border">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-900 m-0 mb-2">Répartition par type</h3>
                                <p className="text-sm text-600 m-0">Distribution des actions principales</p>
                            </div>
                            <Divider className="my-3" />
                            <div style={{ height: '350px' }}>
                                {filteredActionBreakdown.length > 0 ? (
                                    <Chart type="doughnut" data={actionChartData} options={pieChartOptions} />
                                ) : (
                                    <div className="flex align-items-center justify-content-center h-full">
                                        <div className="text-center">
                                            <div className="bg-gray-100 w-5rem h-5rem flex align-items-center justify-content-center border-circle mx-auto mb-3">
                                                <i className="pi pi-chart-pie text-4xl text-400"></i>
                                            </div>
                                            <p className="text-600 font-medium">Aucune donnée disponible</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Journal et utilisateurs actifs */}
                <div className="grid mb-4">
                    {canViewLogs && (
                        <div className="col-12 lg:col-8">
                            <Card className="shadow-3 border-round-xl h-full border-1 surface-border">
                                <div className="flex align-items-center justify-content-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-900 m-0 mb-2">Journal d'activité récent</h3>
                                        <p className="text-sm text-600 m-0 flex align-items-center gap-2">
                                            <i className="pi pi-clock text-xs"></i>
                                            10 dernières actions enregistrées
                                        </p>
                                    </div>
                                    <Link href="/ad/activity-logs">
                                        <Button 
                                            label="Voir tout" 
                                            icon="pi pi-arrow-right" 
                                            iconPos="right"
                                            className="p-button-sm p-button-outlined"
                                        />
                                    </Link>
                                </div>

                                <Divider className="my-3" />

                                {filteredLogs.length > 0 ? (
                                    <DataTable 
                                        value={filteredLogs.filter(log => log.performer_name && log.performer_name !== 'Système')} 
                                        rows={10}
                                        dataKey="id"
                                        className="p-datatable-sm"
                                        stripedRows
                                        responsiveLayout="stack"
                                        breakpoint="960px"
                                        scrollable
                                        scrollHeight="450px"
                                    >
                                        <Column
                                            field="performer_name"
                                            header="Utilisateur"
                                            sortable
                                            style={{ minWidth: '180px' }}
                                            body={(rowData) => (
                                                <div className="flex align-items-center gap-2">
                                                    <div className="bg-indigo-100 text-indigo-700 w-2rem h-2rem flex align-items-center justify-content-center border-circle font-semibold text-sm">
                                                        {rowData.performer_name ? rowData.performer_name.charAt(0).toUpperCase() : 'S'}
                                                    </div>
                                                    <span className="font-medium">
                                                        {rowData.performer_name ? rowData.performer_name.replace(/\./g, ' ') : 'Système'}
                                                    </span>
                                                </div>
                                            )}
                                        />
                                        <Column 
                                            field="action" 
                                            header="Action" 
                                            body={actionTemplate} 
                                            sortable 
                                            style={{ minWidth: '150px' }}
                                        />
                                        <Column 
                                            field="created_at_formatted" 
                                            header="Horodatage" 
                                            sortable 
                                            style={{ minWidth: '180px' }}
                                            body={(rowData) => (
                                                <div className="flex align-items-center gap-2 text-sm">
                                                    <i className="pi pi-calendar text-xs text-500"></i>
                                                    <span>{rowData.created_at_formatted}</span>
                                                </div>
                                            )}
                                        />
                                    </DataTable>
                                ) : (
                                    <div className="text-center p-6 bg-gray-50 border-round-lg">
                                        <div className="bg-gray-100 w-5rem h-5rem flex align-items-center justify-content-center border-circle mx-auto mb-3">
                                            <i className="pi pi-inbox text-4xl text-400"></i>
                                        </div>
                                        <p className="text-600 font-medium text-lg mb-2">Aucune activité trouvée</p>
                                        <p className="text-sm text-500">Aucun journal ne correspond aux critères</p>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    <div className="col-12 lg:col-4">
                        <Card className="shadow-3 border-round-xl h-full border-1 surface-border">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-900 m-0 mb-2">Top utilisateurs</h3>
                                <p className="text-sm text-600 m-0">Classement par activité</p>
                            </div>
                            <Divider className="my-3" />
                            
                            <div className="flex flex-column gap-3">
                                {filteredTopPerformers.length > 0 ? (
                                    filteredTopPerformers.slice(0, 5).map((user, idx) => {
                                        const content = (
                                            <div className={`flex align-items-center justify-content-between p-3 border-round-lg surface-100 border-1 surface-border ${
                                                canViewLogs ? 'hover:surface-200 cursor-pointer' : ''
                                            }`}>
                                                <div className="flex align-items-center gap-3 flex-1 overflow-hidden">
                                                    <div className={`w-3rem h-3rem flex align-items-center justify-content-center border-circle font-bold text-white text-base ${
                                                        idx === 0 ? 'bg-yellow-500' :
                                                        idx === 1 ? 'bg-gray-400' :
                                                        idx === 2 ? 'bg-orange-600' : 'bg-indigo-500'
                                                    }`}>
                                                        {idx === 0 && <i className="pi pi-trophy"></i>}
                                                        {idx === 1 && <i className="pi pi-star-fill"></i>}
                                                        {idx === 2 && <i className="pi pi-star"></i>}
                                                        {idx > 2 && (idx + 1)}
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="font-semibold text-900 m-0 text-base truncate">
                                                            {user.name ? user.name.replace(/\./g, ' ') : 'Système'} 
                                                        </p>
                                                        <div className="flex align-items-center gap-2 mt-1">
                                                            <Tag 
                                                                value={`${user.count} activités`} 
                                                                severity="info" 
                                                                className="text-xs"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                {canViewLogs && (
                                                    <i className="pi pi-angle-right text-600"></i>
                                                )}
                                            </div>
                                        );

                                        return canViewLogs ? (
                                            <Link 
                                                key={user.id} 
                                                href={`/ad/activity-logs/user/${user.id}`} 
                                                className="no-underline"
                                            >
                                                {content}
                                            </Link>
                                        ) : (
                                            <div key={user.id}>{content}</div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center p-5 bg-gray-50 border-round-lg">
                                        <div className="bg-gray-100 w-4rem h-4rem flex align-items-center justify-content-center border-circle mx-auto mb-3">
                                            <i className="pi pi-users text-3xl text-400"></i>
                                        </div>
                                        <p className="text-600 font-medium">Aucun utilisateur actif</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Sites les plus actifs */}
                <div className="grid">
                    <div className="col-12">
                        <Card className="shadow-3 border-round-xl border-1 surface-border">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-900 m-0 mb-2">Sites les plus actifs</h3>
                                <p className="text-sm text-600 m-0">Classement des emplacements par volume d'activité</p>
                            </div>
                            <Divider className="my-3" />
                            
                            <div className="grid">
                                {safeTopSites.length > 0 ? (
                                    safeTopSites.slice(0, 8).map((site, idx) => (
                                        <div key={idx} className="col-12 sm:col-6 md:col-4 lg:col-3">
                                            <div className="flex align-items-center justify-content-between p-3 border-round-lg bg-indigo-50 border-1 border-indigo-100 hover:bg-indigo-100">
                                                <div className="flex align-items-center gap-3 flex-1 overflow-hidden">
                                                    <div className="w-3rem h-3rem flex align-items-center justify-content-center border-circle bg-indigo-500 text-white">
                                                        <i className="pi pi-building text-xl"></i>
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="font-semibold text-900 m-0 text-base truncate">
                                                            {site.site}
                                                        </p>
                                                        <p className="text-sm text-600 m-0 mt-1">
                                                            {site.count} activités
                                                        </p>
                                                    </div>
                                                </div>
                                                <Tag 
                                                    value={`#${idx + 1}`} 
                                                    severity={idx === 0 ? 'success' : idx === 1 ? 'info' : 'secondary'}
                                                    className="font-semibold"
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12">
                                        <div className="text-center p-6 bg-gray-50 border-round-lg">
                                            <div className="bg-gray-100 w-5rem h-5rem flex align-items-center justify-content-center border-circle mx-auto mb-3">
                                                <i className="pi pi-building text-4xl text-400"></i>
                                            </div>
                                            <p className="text-600 font-medium text-lg mb-2">Aucun site actif</p>
                                            <p className="text-sm text-500">Aucune activité enregistrée pour le moment</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
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
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
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
                
                .p-tag {
                    font-weight: 500;
                    padding: 0.375rem 0.75rem;
                    font-size: 0.8125rem;
                }
                
                .p-dropdown {
                    border-radius: 0.5rem;
                    border-color: #d1d5db;
                }
                
                .p-dropdown:hover {
                    border-color: #9ca3af;
                }
                
                .p-progressbar {
                    border-radius: 0.5rem;
                    overflow: hidden;
                }
                
                .p-progressbar .p-progressbar-value {
                    border-radius: 0.5rem;
                }
                
                .surface-border {
                    border-color: #e5e7eb;
                }
                
                .surface-100 {
                    background-color: #f3f4f6;
                }
                
                .surface-200 {
                    background-color: #e5e7eb;
                }
                
                @media (max-width: 960px) {
                    .p-card .p-card-body {
                        padding: 1rem;
                    }
                    
                    .p-datatable .p-datatable-thead > tr > th,
                    .p-datatable .p-datatable-tbody > tr > td {
                        padding: 0.625rem 0.75rem;
                        font-size: 0.875rem;
                    }
                }
                
                @media (max-width: 576px) {
                    .p-card .p-card-body {
                        padding: 0.875rem;
                    }
                }
            `}</style>
        </Layout>
    );
}