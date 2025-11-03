import React from "react";
import { Head, Link } from "@inertiajs/react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Chart } from "primereact/chart";
import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Layout from "@/Layouts/layout/layout.jsx";

export default function Dashboard({ stats = {}, activityData = [], recentLogs = [], period }) {
    const safeActivityData = Array.isArray(activityData) ? activityData : [];
    const safeRecentLogs = Array.isArray(recentLogs) ? recentLogs : [];
    const safeStats = stats || {};

    // ====== CHART DATA ======
    const chartData = {
        labels: safeActivityData.map(d => d.date),
        datasets: [
            {
                label: "Activités",
                data: safeActivityData.map(d => d.total),
                fill: true,
                borderColor: "#6366f1",
                backgroundColor: "rgba(99,102,241,0.2)",
                tension: 0.3,
            },
        ],
    };

    const chartOptions = {
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } }, y: { beginAtZero: true, suggestedMin: 0 } }, // Ajout de suggestedMin
    };

    // ====== STATS CARDS ======
    const statCards = [
        { label: "Total Logs", value: safeStats.total_logs ?? 0, icon: "pi pi-database", color: "bg-indigo-500" },
        { label: "Aujourd'hui", value: safeStats.today_logs ?? 0, icon: "pi pi-calendar", color: "bg-blue-500" },
        { label: "Connexions", value: safeStats.login_count ?? 0, icon: "pi pi-sign-in", color: "bg-green-500" },
        { label: "Déconnexions", value: safeStats.logout_count ?? 0, icon: "pi pi-sign-out", color: "bg-teal-500" },
        { label: "Blocages", value: safeStats.block_count ?? 0, icon: "pi pi-lock", color: "bg-red-500" },
        { label: "Échecs", value: safeStats.failed ?? 0, icon: "pi pi-times-circle", color: "bg-orange-500" },
    ];

    // ====== TEMPLATE POUR ACTION ======
    const actionTemplate = (row) => (
        <Tag
            value={row.action}
            severity={
                row.action === "login"
                    ? "info"
                    : row.action === "logout"
                    ? "warning"
                    : row.action === "block_user"
                    ? "danger"
                    : row.action === "unblock_user"
                    ? "success"
                    : "secondary"
            }
        />
    );

    return (
        <Layout>
            <Head title="Dashboard AD" />

            <div className="grid">
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

                {/* ====== GRAPH ====== */}
                <div className="col-12 lg:col-8">
                    <Card title={`Activité des ${period} derniers jours`} className="shadow-2">
                        {safeActivityData.length > 0 ? (
                            <Chart type="line" data={chartData} options={chartOptions} />
                        ) : (
                            <p className="text-center text-600 p-3">Aucune donnée d’activité disponible pour cette période.</p>
                        )}
                    </Card>
                </div>

                {/* ====== RECENT LOGS ====== */}
                <div className="col-12 lg:col-4">
                    <Card title="Dernières actions" className="shadow-2">
                        {safeRecentLogs.length > 0 ? (
                            <DataTable value={safeRecentLogs} rows={5} dataKey="id">
                                {/* CORRECTION: Utiliser 'performer_name' créé dans le contrôleur */}
                                <Column field="performer_name" header="Effectué par" /> 
                                <Column field="action" header="Action" body={actionTemplate} />
                                {/* CORRECTION: Utiliser 'created_at_formatted' créé dans le contrôleur */}
                                <Column field="created_at_formatted" header="Date" />
                            </DataTable>
                        ) : (
                            <p className="text-center text-600 p-3">Aucune action récente.</p>
                        )}

                        <Link href="/ad/activity-logs">
                            <Button label="Voir tout" icon="pi pi-list" className="mt-3 w-full" />
                        </Link>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}