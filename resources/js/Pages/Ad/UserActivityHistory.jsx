import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Layout from "@/Layouts/layout/layout.jsx";

export default function UserActivityHistory({ user, logs }) {
    const getActionConfig = (action) => {
        const configs = {
            login: { icon: 'pi-sign-in', severity: 'info', label: 'Connexion' },
            logout: { icon: 'pi-sign-out', severity: null, label: 'Déconnexion' },
            block_user: { icon: 'pi-lock', severity: 'danger', label: 'Blocage' },
            unblock_user: { icon: 'pi-unlock', severity: 'success', label: 'Déblocage' },
            reset_password: { icon: 'pi-refresh', severity: 'warning', label: 'Reset MDP' },
            create_user: { icon: 'pi-user-plus', severity: 'help', label: 'Création' },
        };
        return configs[action] || { icon: 'pi-question', severity: null, label: action };
    };

    const dateTemplate = (rowData) => (
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

    const targetUserTemplate = (rowData) => (
        <div className="flex align-items-center gap-2">
            <i className="pi pi-user text-600"></i>
            <div>
                <div className="font-medium text-900">{rowData.target_user_name || '—'}</div>
                <div className="text-sm text-600">{rowData.target_user || ''}</div>
            </div>
        </div>
    );

    const ipTemplate = (rowData) => (
        <div className="flex align-items-center gap-2">
            <i className="pi pi-globe text-600"></i>
            <span className="text-700 font-mono text-sm">
                {rowData.ip_address || '—'}
            </span>
        </div>
    );

    const userAgentTemplate = (rowData) => (
        <div className="flex flex-column">
            <span className="text-sm text-900 font-medium">{rowData.user_agent?.split('(')[0] || '—'}</span>
            {rowData.user_agent && (
                <span className="text-xs text-600">
                    {rowData.user_agent.split('(')[1]?.replace(')', '')}
                </span>
            )}
        </div>
    );

    const statusTemplate = (rowData) => (
        <Tag 
            icon={rowData.status === 'success' ? 'pi pi-check-circle' : 'pi pi-times-circle'}
            value={rowData.status === 'success' ? 'Réussi' : 'Échoué'} 
            severity={rowData.status === 'success' ? 'success' : 'danger'}
        />
    );

    const header = (
        <div className="flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="flex align-items-center gap-3">
                <div 
                    className="inline-flex align-items-center justify-content-center border-circle" 
                    style={{ 
                        width: '56px', 
                        height: '56px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)'
                    }}
                >
                    <i className="pi pi-history text-3xl text-white"></i>
                </div>
                <div>
                    <h1 className="text-900 text-2xl font-bold m-0">
                        Historique d’activité — {user.first_name} {user.last_name}
                    </h1>
                    <p className="text-600 mt-1 m-0">
                        Visualisez toutes les actions (connexions, déconnexions, modifications, etc.)
                    </p>
                </div>
            </div>
            <Button
                icon="pi pi-arrow-left"
                label="Retour"
                onClick={() => router.visit('/ad/activity-logs')}
                outlined
                className="p-button-secondary"
            />
        </div>
    );

    return (
        <Layout>
            <Head title={`Historique de ${user.first_name} ${user.last_name}`} />
            <div className="p-6">
                <Card className="shadow-2">
                    <DataTable 
                        value={logs || []} 
                        header={header}
                        stripedRows
                        responsiveLayout="scroll"
                        paginator
                        rows={10}
                        emptyMessage={
                            <div className="text-center py-6">
                                <i className="pi pi-inbox text-400 mb-3" style={{ fontSize: '3rem' }}></i>
                                <h3 className="text-900 text-xl font-medium mb-2">Aucune activité trouvée</h3>
                                <p className="text-600">Cet utilisateur n’a effectué aucune action enregistrée.</p>
                            </div>
                        }
                    >
                        <Column field="created_at" header="Date / Heure" body={dateTemplate} sortable style={{ minWidth: '180px' }} />
                        <Column field="action" header="Action" body={actionTemplate} sortable style={{ minWidth: '140px' }} />
                        <Column field="target_user" header="Utilisateur ciblé" body={targetUserTemplate} sortable style={{ minWidth: '200px' }} />
                        <Column field="ip_address" header="Adresse IP" body={ipTemplate} style={{ minWidth: '160px' }} />
                        <Column field="user_agent" header="User Agent" body={userAgentTemplate} style={{ minWidth: '240px' }} />
                        <Column field="status" header="Statut" body={statusTemplate} sortable style={{ minWidth: '120px' }} />
                    </DataTable>
                </Card>
            </div>

            <style>{`
                :global(.p-card) {
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                }

                :global(.p-datatable .p-datatable-thead > tr > th) {
                    background: #f9fafb;
                    color: #374151;
                    font-weight: 600;
                    padding: 1rem;
                    border-bottom: 2px solid #e5e7eb;
                }

                :global(.p-datatable .p-datatable-tbody > tr > td) {
                    padding: 1rem;
                }

                :global(.p-datatable .p-datatable-tbody > tr:hover) {
                    background: #f9fafb;
                }

                :global(.p-tag) {
                    border-radius: 6px;
                    padding: 0.35rem 0.7rem;
                    font-size: 0.875rem;
                }

                :global(.shadow-2) {
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
                }
            `}</style>
        </Layout>
    );
}
