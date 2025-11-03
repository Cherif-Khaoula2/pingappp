import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import Layout from '@/Layouts/layout/layout.jsx';

/**
 * Composant pour afficher le tableau de bord des activités AD.
 * @param {object} props - Les propriétés passées par Inertia.
 * @param {object} props.stats - Statistiques globales.
 * @param {array} props.activityData - Données pour le graphique.
 * @param {array} props.recentLogs - Les 10 derniers logs d'activité.
 * @param {number} props.period - La période en jours pour le graphique.
 * @param {string | null} props.error - Message d'erreur de connexion (optionnel).
 */
export default function Dashboard({ stats = {}, activityData = [], recentLogs = [], period = 30, error = null }) {

    // Rendre les données robustes avec des valeurs par défaut
    const safeStats = stats || {};
    const safeActivityData = Array.isArray(activityData) ? activityData : [];
    const safeRecentLogs = Array.isArray(recentLogs) ? recentLogs : [];

    // ====== CHART DATA & OPTIONS ======
    const chartData = {
        labels: safeActivityData.map(d => d.date),
        datasets: [
            {
                label: 'Activité',
                data: safeActivityData.map(d => d.total),
                fill: true, // Remplissage pour un meilleur visuel d'activité
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99,102,241,0.2)',
                tension: 0.3,
            }
        ]
    };

    const chartOptions = {
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { precision: 0 } }
        }
    };

    // ====== STATS CARDS DATA (Utilisation du modèle de l'ancien code pour la structure) ======
    const statCards = [
        { label: "Total Logs", value: safeStats.total_logs ?? 0, icon: "pi pi-database", color: "bg-indigo-500" },
        { label: "Aujourd'hui", value: safeStats.today_logs ?? 0, icon: "pi pi-calendar", color: "bg-blue-500" },
        { label: "Connexions", value: safeStats.login_count ?? 0, icon: "pi pi-sign-in", color: "bg-green-500" },
        { label: "Déconnexions", value: safeStats.logout_count ?? 0, icon: "pi pi-sign-out", color: "bg-teal-500" },
        { label: "Blocages", value: safeStats.block_count ?? 0, icon: "pi pi-lock", color: "bg-red-500" },
        { label: "Échecs", value: safeStats.failed ?? 0, icon: "pi pi-times-circle", color: "bg-orange-500" },
    ];
    
    // Fonction d'aide pour l'affichage des actions avec Tag
    const actionTemplate = (row) => {
        let severity = 'secondary';
        switch (row.action) {
            case 'login': severity = 'info'; break;
            case 'logout': severity = 'warning'; break;
            case 'block_user': severity = 'danger'; break;
            case 'unblock_user': severity = 'success'; break;
            default: severity = 'secondary';
        }
        return <Tag value={row.action} severity={severity} />;
    };

    // Fonction d'aide pour l'affichage du statut avec Tag
    const statusTemplate = (row) => {
        let severity = row.status === 'succeeded' ? 'success' : 'danger';
        return <Tag value={row.status} severity={severity} />;
    };


    return (
        <Layout>
            <Head title="Dashboard AD" />

            <div className="grid p-fluid p-6 space-y-6">
                
                {/* Message d'erreur critique de connexion (si passé par le contrôleur) */}
                {error && (
                    <div className="col-12">
                        <Card title="Erreur Critique" className="p-card-danger shadow-2">
                            <p className="text-red-500 font-medium">{error}</p>
                            <p className="text-sm text-600 mt-2">Veuillez vérifier la connexion à la base de données dans votre fichier .env.</p>
                        </Card>
                    </div>
                )}

                {/* ====== STAT CARDS ====== */}
                {statCards.map((stat, i) => (
                    <div key={i} className="col-12 md:col-3 lg:col-2">
                        <Card className="flex align-items-center justify-content-between p-4 shadow-2">
                            <div>
                                <p className="text-sm text-600">{stat.label}</p>
                                <h2 className="text-3xl font-bold text-900">{stat.value}</h2>
                            </div>
                            <div
                                className={`w-10 h-10 flex align-items-center justify-content-center text-white border-circle ${stat.color}`}
                            >
                                <i className={`pi ${stat.icon} text-lg`}></i>
                            </div>
                        </Card>
                    </div>
                ))}

                {/* --- */}

                {/* ====== GRAPH - Activité des derniers jours ====== */}
                <div className="col-12 lg:col-8">
                    <Card title={`Activité des ${period} derniers jours`} className="shadow-2">
                        {safeActivityData.length > 0 ? (
                            <Chart type="line" data={chartData} options={chartOptions} />
                        ) : (
                            <p className="text-center text-600 p-3">Aucune donnée d’activité disponible pour cette période.</p>
                        )}
                    </Card>
                </div>

                {/* ====== LOGS RÉCENTS (Utilisation de DataTable de PrimeReact) ====== */}
                <div className="col-12 lg:col-4">
                    <Card title="Dernières actions" className="shadow-2">
                        {safeRecentLogs.length > 0 ? (
                            <DataTable value={safeRecentLogs} rows={5} dataKey="id" size="small">
                                {/* J'ai supposé que le contrôleur formattait l'utilisateur dans 'performer_name' */}
                                <Column field="performer_name" header="Utilisateur" />
                                <Column field="action" header="Action" body={actionTemplate} />
                                <Column field="status" header="Statut" body={statusTemplate} />
                                {/* J'ai supposé que le contrôleur formattait la date dans 'created_at_formatted' */}
                                <Column field="created_at_formatted" header="Date" /> 
                            </DataTable>
                        ) : (
                            <p className="text-center text-600 p-3">Aucune action récente.</p>
                        )}
                        
                        <Link href="/ad/activity-logs">
                             {/* Utilisation de la classe w-full pour que le bouton prenne toute la largeur */}
                            <Button label="Voir tout" icon="pi pi-list" className="mt-3 w-full" /> 
                        </Link>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}