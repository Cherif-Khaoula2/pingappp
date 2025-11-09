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
    topPerformers = []
}) {
    const [dateRange, setDateRange] = useState(null);
    const [selectedActions, setSelectedActions] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredLogs, setFilteredLogs] = useState(recentLogs);
    const [periodFilter, setPeriodFilter] = useState(period);

    const [isLoading, setIsLoading] = useState(false);
    const pageProps = usePage().props;
    const { permissions = [] } = pageProps;
    
    const canViewLogs = permissions.includes("getlog");
    
    const safeStats = stats || {};
    const safeActivityData = Array.isArray(activityData) ? activityData : [];
    const safeRecentLogs = Array.isArray(recentLogs) ? recentLogs : [];
    const safeActionBreakdown = Array.isArray(actionBreakdown) ? actionBreakdown : [];
    const safeTopPerformers = Array.isArray(topPerformers) ? topPerformers : [];

    const getActionLabel = (action) => {
        const labelMap = {
            'login': 'Connexion',
            'logout': 'Déconnexion',
            'block_user': 'Blocage',
            'unblock_user': 'Déblocage',
            'create_user': 'Création',
            'reset_password': 'Reset MDP',
            'change_password': 'Change MDP',
            'search_user': 'Recherche',
            'search_user_result': 'Résultats',
            'create_dn': 'Créer DN',
            'update_dn': 'Modifier DN',
            'delete_dn': 'Supprimer DN',
            'assign_dns_to_user': 'Affecter DNs',
            'assign_dn_to_users': 'Ajouter users',
            'unassign_dn_from_users': 'Retirer users',
            'hide_account': 'Masquer',
            'unhide_account': 'Démasquer',
            'authorize_ldap_user': 'Autoriser',
            'unauthorize_ldap_user': 'Désautoriser'
        };
        return labelMap[action] || action;
    };

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
        { label: ' Démasquage des utilisateurs', value: 'unhide_account' },        
        { label: 'Autorisation des utilisateurs', value: 'authorize_ldap_user' },
        { label: ' Désautorisation des utilisateurs', value: 'unauthorize_ldap_user' },
    ];

    const periodOptions = [
        { label: '1 jour', value: 1 },
        { label: '7 jours', value: 7 },
        { label: '30 jours', value: 30 },
        { label: '6 mois', value: 180 },
        { label: '1 an', value: 365 }
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

    const includedActions = ['Connexion', 'Déconnexion', 'Création', 'Blocage', 'Déblocage', 'Reset MDP'];
    const filteredActionBreakdown = safeActionBreakdown.filter(a => includedActions.includes(a.action));
    
    const actionChartData = {
        labels: filteredActionBreakdown.map(a => a.action),
        datasets: [{
            data: filteredActionBreakdown.map(a => a.count),
            backgroundColor: [
                '#14b343ff', '#f5de10ff', '#06b6d4', '#ef4444', 
                '#14b8a6', '#f97316'
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
                    padding: 10, 
                    font: { size: 10 },
                    boxWidth: 10,
                    usePointStyle: true
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 10,
                cornerRadius: 8,
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
            color: "bg-yellow-500",
            percentage: safeStats.total_logs > 0 ? ((safeStats.logout_count / safeStats.total_logs) * 100).toFixed(1) : 0
        },
        { 
            label: "Créations", 
            value: safeStats.create_count ?? 0, 
            icon: "pi pi-user-plus", 
            color: "bg-cyan-500",
            percentage: safeStats.total_logs > 0 ? ((safeStats.create_count / safeStats.total_logs) * 100).toFixed(1): 0
        },
        { 
            label: "Blocages", 
            value: safeStats.block_count ?? 0, 
            icon: "pi pi-lock", 
            color: "bg-red-500",
            percentage: safeStats.total_logs > 0 ? ((safeStats.block_count / safeStats.total_logs) * 100).toFixed(1): 0,
            alert: safeStats.block_count > 10
        },
        { 
            label: "Déblocages", 
            value: safeStats.unblock_count ?? 0, 
            icon: "pi pi-unlock", 
            color: "bg-teal-500",
            percentage: safeStats.total_logs > 0 ? ((safeStats.unblock_count / safeStats.total_logs) * 100).toFixed(1): 0
        },
        { 
            label: "Réinitialiser MDP", 
            value: safeStats.reset_password_count ?? 0, 
            icon: "pi pi-refresh", 
            color: "bg-orange-500",
            percentage: safeStats.total_logs > 0 ? ((safeStats.reset_password_count / safeStats.total_logs) * 100).toFixed(1): 0
        },
    ];

    const actionTemplate = (row) => {
        const severityMap = {
            'login': 'success',
            'logout': 'warning',
            'block_user': 'danger',
            'unblock_user': 'info',
            'create_user': 'info', 
            'reset_password': 'warning',
            'change_password': 'info',
            'search_user': 'info',
            'search_user_result': 'secondary',
            'create_dn': 'success',
            'update_dn': 'warning',
            'delete_dn': 'danger',
            'assign_dns_to_user': 'primary',
            'assign_dn_to_users': 'primary',
            'unassign_dn_from_users': 'warning',
            'hide_account': 'secondary',
            'unhide_account': 'success',
            'authorize_ldap_user': 'success',
            'unauthorize_ldap_user': 'danger'
        };
        
        const labelMap = {
            'login': 'Connexion',
            'logout': 'Déconnexion',
            'block_user': 'Blocage',
            'unblock_user': 'Déblocage',
            'create_user': 'Création',
            'reset_password': 'Reset MDP',
            'change_password': 'Change MDP',
            'search_user': 'Recherche utilisateur',
            'search_user_result': 'Résultats recherche',
            'create_dn': 'Création DN',
            'update_dn': 'Modification DN',
            'delete_dn': 'Suppression DN',
            'assign_dns_to_user': 'Affectation DNs',
            'assign_dn_to_users': 'Ajout utilisateurs DN',
            'unassign_dn_from_users': 'Retrait utilisateurs DN',
            'hide_account': 'Masquage des utilisateurs',
            'unhide_account': 'Démasquage des utilisateurs',
            'authorize_ldap_user': 'Autorisation des utilisateurs',
            'unauthorize_ldap_user': 'Désautorisation des utilisateurs'
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

    // ✅ Filtrer les utilisateurs actifs (exclure "Système" et "Khaoula HAMADOUCHE")
    const filteredTopPerformers = safeTopPerformers.filter(user => {
        const name = user.name?.trim() || "";
        return name !== "" && 
               name !== "Système" && 
               name !== "Khaoula HAMADOUCHE" &&
               name !== "Khaoula HAMADOUCHE.";
    });

    return (
        <Layout>
            <Head title="Dashboard AD - Vue d'ensemble" />

            <div className="p-3 md:p-6">
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

                {/* ✅ PREMIÈRE LIGNE: Graphiques côte à côte */}
                <div className="grid mb-3 md:mb-4">
                    <div className="col-12 lg:col-8">
                        <Card title={`Évolution de l'activité (${period} jours)`} className="shadow-2 md:shadow-3 h-full">
                            <div style={{ height: '300px' }}>
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

                    <div className="col-12 lg:col-4">
                        <Card title="Répartition par type" className="shadow-2 md:shadow-3 h-full">
                            <div style={{ height: '300px' }}>
                                {filteredActionBreakdown.length > 0 ? (
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

                {/* ✅ DEUXIÈME LIGNE: Journal et Utilisateurs actifs côte à côte */}
                <div className="grid mb-3 md:mb-4">
                    {canViewLogs && (
                        <div className="col-12 lg:col-8">
                            <Card title="Journal d'activité détaillé" className="shadow-2 md:shadow-3 h-full">
                                <div className="mb-3 flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center gap-2">
                                    <span className="text-sm md:text-base text-600">
                                        <i className="pi pi-info-circle mr-2"></i>
                                        Affichage des dix dernières actions 
                                    </span>

                                    <Link href="/ad/activity-logs">
                                        <Button 
                                            label="Historique complet" 
                                            icon="pi pi-external-link" 
                                            className="p-button-sm p-button-text"
                                        />
                                    </Link>
                                </div>

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
                                   scrollHeight="400px"
                               >
                                   <Column
                                       field="performer_name"
                                       header="Utilisateur"
                                       sortable
                                       style={{ minWidth: '150px' }}
                                       headerStyle={{ fontSize: '0.875rem' }}
                                       body={(rowData) => (
                                           <span>{rowData.performer_name ? rowData.performer_name.replace(/\./g, ' ') : 'Système'}</span>
                                       )}
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
                    )}

                    <div className="col-12 lg:col-4">
                        <Card title="Utilisateurs les plus actifs" className="shadow-2 md:shadow-3 h-full">
                            <div className="flex flex-column gap-2 md:gap-3">
                                {filteredTopPerformers.length > 0 ? (
                                    filteredTopPerformers
                                        .slice(0, 5)
                                        .map((user, idx) => {
                                            const content = (
                                                <div className={`flex align-items-center justify-content-between p-2 md:p-3 border-round-md bg-gray-50 transition-colors transition-duration-200 ${
                                                    canViewLogs ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-default'
                                                }`}>
                                                    <div className="flex align-items-center gap-2 md:gap-3 flex-1 overflow-hidden">
                                                        <div className={`w-2rem h-2rem md:w-3rem md:h-3rem flex align-items-center justify-content-center border-circle font-bold text-white text-sm md:text-base flex-shrink-0 ${
                                                            idx === 0 ? 'bg-yellow-500' :
                                                            idx === 1 ? 'bg-gray-400' :
                                                            idx === 2 ? 'bg-orange-600' : 'bg-indigo-500'
                                                        }`}>
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <p className="font-semibold text-900 m-0 text-sm md:text-base truncate">
                                                                 {user.name ? user.name.replace(/\./g, ' ') : 'Système'} 
                                                            </p>

                                                            <p className="text-xs md:text-sm text-600 m-0">
                                                                {user.count} activités
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {canViewLogs && (
                                                        <i className="pi pi-chevron-right text-600 text-sm flex-shrink-0"></i>
                                                    )}
                                                </div>
                                            );

                                            return canViewLogs ? (
                                                <Link 
                                                    key={user.id} 
                                                    href={`/ad/activity-logs/user/${user.id}`} 
                                                    className="no-underline text-inherit"
                                                >
                                                    {content}
                                                </Link>
                                            ) : (
                                                <div key={user.id}>
                                                    {content}
                                                </div>
                                            );
                                        })
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
                
                @media (max-width: 960px) {
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