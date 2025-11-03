import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { Timeline } from 'primereact/timeline';
import Layout from "@/Layouts/layout/layout.jsx";

export default function ActivityLogDetail({ log }) {
    const { auth } = usePage().props;

    const getActionConfig = (action) => {
        const configs = {
            login: { icon: 'pi-sign-in', severity: 'info', label: 'Connexion', color: '#3b82f6' },
            logout: { icon: 'pi-sign-out', severity: null, label: 'Déconnexion', color: '#6b7280' },
            block_user: { icon: 'pi-lock', severity: 'danger', label: 'Blocage utilisateur', color: '#ef4444' },
            unblock_user: { icon: 'pi-unlock', severity: 'success', label: 'Déblocage utilisateur', color: '#10b981' },
            reset_password: { icon: 'pi-refresh', severity: 'warning', label: 'Réinitialisation mot de passe', color: '#f59e0b' },
            create_user: { icon: 'pi-user-plus', severity: 'help', label: 'Création utilisateur', color: '#8b5cf6' },
        };
        return configs[action] || { icon: 'pi-question', severity: null, label: action, color: '#6b7280' };
    };

    const actionConfig = log ? getActionConfig(log.action) : null;

    // Timeline events
    const timelineEvents = log ? [
        {
            status: 'Demande initiée',
            icon: 'pi pi-play-circle',
            color: '#3b82f6',
            description: `Par ${log.performed_by_name || 'N/A'}`,
            detail: `Depuis ${log.ip_address || 'IP inconnue'}`
        },
        {
            status: 'Action en cours',
            icon: `pi ${actionConfig?.icon}`,
            color: actionConfig?.color,
            description: actionConfig?.label,
            detail: `Cible: ${log.target_user || 'N/A'} ${log.target_user_name ? `(${log.target_user_name})` : ''}`
        },
        {
            status: log.status === 'success' ? 'Action réussie' : 'Action échouée',
            icon: log.status === 'success' ? 'pi pi-check-circle' : 'pi pi-times-circle',
            color: log.status === 'success' ? '#10b981' : '#ef4444',
            description: log.status === 'success' ? 'Opération terminée avec succès' : 'Échec de l\'opération',
            detail: log.created_at ? new Date(log.created_at).toLocaleTimeString('fr-FR') : 'N/A'
        }
    ] : [];

    const customizedMarker = (item) => {
        return (
            <span 
                className="flex align-items-center justify-content-center border-circle shadow-2" 
                style={{ 
                    width: '3rem', 
                    height: '3rem', 
                    backgroundColor: item.color,
                    color: 'white'
                }}
            >
                <i className={`${item.icon} text-xl`}></i>
            </span>
        );
    };

    const customizedContent = (item) => {
        return (
            <Card className="shadow-1 border-1 border-200">
                <div className="flex flex-column gap-2">
                    <div className="text-900 font-semibold text-lg">{item.status}</div>
                    <div className="text-700">{item.description}</div>
                    {item.detail && (
                        <div className="text-600 text-sm">
                            <i className="pi pi-info-circle mr-2"></i>
                            {item.detail}
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    if (!log) {
        return (
            <Layout>
                <Head title="Log introuvable" />
                <div className="grid">
                    <div className="col-12">
                        <Card className="shadow-2">
                            <div className="text-center py-8">
                                <i className="pi pi-exclamation-triangle text-400 mb-4" style={{ fontSize: '4rem' }}></i>
                                <h2 className="text-900 text-3xl font-bold mb-3">Log introuvable</h2>
                                <p className="text-600 text-lg mb-4">Le log demandé n'existe pas ou a été supprimé</p>
                                <Link href="/ad/activity-logs">
                                    <Button 
                                        icon="pi pi-arrow-left" 
                                        label="Retour aux logs"
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                            border: 'none'
                                        }}
                                    />
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </Layout>
        );
    }<div className="text-900 font-bold text-xl mb-1">
                                        {log.target_user || 'N/A'}
                                    </div>

    return (
        <Layout>
            <Head title={`Log #${log.id}`} />

            <div className="grid">
                {/* Bouton retour */}
                <div className="col-12 mb-3">
                    <Link href="/ad/activity-logs">
                        <Button 
                            icon="pi pi-arrow-left" 
                            label="Retour aux logs"
                            text
                            style={{ color: '#6366f1' }}
                        />
                    </Link>
                </div>

                {/* En-tête avec informations principales */}
                <div className="col-12">
                    <Card className="shadow-2 mb-4">
                        {/* Header */}
                        <div className="flex align-items-start justify-content-between flex-wrap gap-4 mb-4">
                            <div className="flex align-items-center gap-4">
                                <div 
                                    className="inline-flex align-items-center justify-content-center border-circle" 
                                    style={{ 
                                        width: '64px', 
                                        height: '64px',
                                        background: `linear-gradient(135deg, ${actionConfig.color}, ${actionConfig.color}dd)`
                                    }}
                                >
                                    <i className={`pi ${actionConfig.icon} text-4xl text-white`}></i>
                                </div>
                                <div>
                                    <div className="flex align-items-center gap-2 mb-2">
                                        <h1 className="text-900 text-3xl font-bold m-0">
                                            Log : {log.target_user }
                                        </h1>
                                        <Tag 
                                            icon={log.status === 'success' ? 'pi pi-check-circle' : 'pi pi-times-circle'}
                                            value={log.status === 'success' ? 'Réussi' : 'Échoué'} 
                                            severity={log.status === 'success' ? 'success' : 'danger'}
                                            style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}
                                        />
                                    </div>
                                    <p className="text-600 text-lg m-0">
                                        {actionConfig.label}
                                    </p>
                                </div>
                            </div>

                            <Tag 
                                icon={`pi ${actionConfig.icon}`}
                                value={actionConfig.label} 
                                severity={actionConfig.severity}
                                style={{ 
                                    fontSize: '1rem', 
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px'
                                }}
                            />
                        </div>

                        <Divider />

                        {/* Grille d'informations */}
                        <div className="grid mt-4">
                            {/* Date et heure */}
                            <div className="col-12 md:col-6 lg:col-4">
                                <div className="surface-50 border-round-lg p-4 h-full">
                                    <div className="flex align-items-center gap-3 mb-3">
                                        <div 
                                            className="inline-flex align-items-center justify-content-center border-circle bg-blue-100" 
                                            style={{ width: '48px', height: '48px' }}
                                        >
                                            <i className="pi pi-clock text-2xl text-blue-600"></i>
                                        </div>
                                        <span className="text-600 font-semibold">Date et heure</span>
                                    </div>
                                    <div className="text-900 font-bold text-xl mb-1">
                                        {new Date(log.created_at).toLocaleDateString('fr-FR', { 
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </div>
                                    <div className="text-600">
                                        {new Date(log.created_at).toLocaleTimeString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Utilisateur ciblé */}
                            <div className="col-12 md:col-6 lg:col-4">
                                <div className="surface-50 border-round-lg p-4 h-full">
                                    <div className="flex align-items-center gap-3 mb-3">
                                        <div 
                                            className="inline-flex align-items-center justify-content-center border-circle bg-purple-100" 
                                            style={{ width: '48px', height: '48px' }}
                                        >
                                            <i className="pi pi-user text-2xl text-purple-600"></i>
                                        </div>
                                        <span className="text-600 font-semibold">Utilisateur ciblé</span>
                                    </div>
                                    <div className="text-900 font-bold text-xl mb-1">
                                        {log.target_user || 'N/A'}
                                    </div>
                                    {log.target_user_name && (
                                        <div className="text-600">{log.target_user_name}</div>
                                    )}
                                </div>
                            </div>

                            {/* Effectué par */}
                            <div className="col-12 md:col-6 lg:col-4">
                                <div className="surface-50 border-round-lg p-4 h-full">
                                    <div className="flex align-items-center gap-3 mb-3">
                                        <div 
                                            className="inline-flex align-items-center justify-content-center border-circle bg-green-100" 
                                            style={{ width: '48px', height: '48px' }}
                                        >
                                            <i className="pi pi-users text-2xl text-green-600"></i>
                                        </div>
                                        <span className="text-600 font-semibold">Effectué par</span>
                                    </div>
                                    <div className="text-900 font-bold text-xl mb-1">
                                        {log.performed_by_name || 'N/A'}
                                    </div>
                                    {log.performer && (
                                        <div className="text-600">{log.performer.email}</div>
                                    )}
                                </div>
                            </div>

                            {/* Adresse IP */}
                            <div className="col-12 md:col-6 lg:col-4">
                                <div className="surface-50 border-round-lg p-4 h-full">
                                    <div className="flex align-items-center gap-3 mb-3">
                                        <div 
                                            className="inline-flex align-items-center justify-content-center border-circle bg-orange-100" 
                                            style={{ width: '48px', height: '48px' }}
                                        >
                                            <i className="pi pi-globe text-2xl text-orange-600"></i>
                                        </div>
                                        <span className="text-600 font-semibold">Adresse IP</span>
                                    </div>
                                    <div className="text-900 font-bold text-xl font-mono">
                                        {log.ip_address || 'Non disponible'}
                                    </div>
                                </div>
                            </div>

                            {/* User Agent */}
                            <div className="col-12 md:col-6 lg:col-8">
                                <div className="surface-50 border-round-lg p-4 h-full">
                                    <div className="flex align-items-center gap-3 mb-3">
                                        <div 
                                            className="inline-flex align-items-center justify-content-center border-circle bg-indigo-100" 
                                            style={{ width: '48px', height: '48px' }}
                                        >
                                            <i className="pi pi-desktop text-2xl text-indigo-600"></i>
                                        </div>
                                        <span className="text-600 font-semibold">User Agent</span>
                                    </div>
                                    <div className="text-900 text-sm font-mono" style={{ wordBreak: 'break-word' }}>
                                        {log.user_agent || 'Non disponible'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Message d'erreur */}
                {log.status === 'failed' && log.error_message && (
                    <div className="col-12">
                        <Card className="shadow-2 mb-4" style={{ borderLeft: '4px solid #ef4444' }}>
                            <div className="flex align-items-start gap-4">
                                <div 
                                    className="inline-flex align-items-center justify-content-center border-circle bg-red-100" 
                                    style={{ width: '56px', height: '56px' }}
                                >
                                    <i className="pi pi-exclamation-circle text-3xl text-red-600"></i>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-900 text-xl font-bold mb-3 flex align-items-center gap-2">
                                        <i className="pi pi-times-circle text-red-600"></i>
                                        Message d'erreur
                                    </h2>
                                    <div className="surface-50 border-round-lg p-4">
                                        <p className="text-900 m-0 line-height-3">
                                            {log.error_message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Timeline */}
                <div className="col-12">
                    <Card className="shadow-2">
                        <h2 className="text-900 text-2xl font-bold mb-4 flex align-items-center gap-3">
                            <div 
                                className="inline-flex align-items-center justify-content-center border-circle" 
                                style={{ 
                                    width: '48px', 
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #667eea, #764ba2)'
                                }}
                            >
                                <i className="pi pi-history text-2xl text-white"></i>
                            </div>
                            Timeline de l'action
                        </h2>
                        <Divider />
                        <Timeline 
                            value={timelineEvents} 
                            align="alternate" 
                            className="customized-timeline"
                            marker={customizedMarker} 
                            content={customizedContent} 
                        />
                    </Card>
                </div>

           

                {/* Statistiques rapides */}
                <div className="col-12">
                    <Card className="shadow-2">
                        <h2 className="text-900 text-xl font-bold mb-4 flex align-items-center gap-2">
                            <i className="pi pi-chart-bar text-purple-600"></i>
                            Résumé de l'opération
                        </h2>
                        <Divider />
                        <div className="grid">
                            <div className="col-12 md:col-4">
                                <div className="text-center p-4 border-round-lg surface-50">
                                    <i className="pi pi-calendar text-4xl text-blue-600 mb-3"></i>
                                    <div className="text-600 text-sm mb-1">Horodatage</div>
                                    <div className="text-900 font-bold">
                                        {new Date(log.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 md:col-4">
                                <div className="text-center p-4 border-round-lg surface-50">
                                    <i className={`pi ${actionConfig.icon} text-4xl mb-3`} style={{ color: actionConfig.color }}></i>
                                    <div className="text-600 text-sm mb-1">Type d'action</div>
                                    <div className="text-900 font-bold">{actionConfig.label}</div>
                                </div>
                            </div>
                            <div className="col-12 md:col-4">
                                <div className="text-center p-4 border-round-lg surface-50">
                                    <i className={`pi ${log.status === 'success' ? 'pi-check-circle' : 'pi-times-circle'} text-4xl mb-3`} 
                                       style={{ color: log.status === 'success' ? '#10b981' : '#ef4444' }}></i>
                                    <div className="text-600 text-sm mb-1">Résultat</div>
                                    <div className="text-900 font-bold">{log.status === 'success' ? 'Succès' : 'Échec'}</div>
                                </div>
                            </div>
                           
                        </div>
                    </Card>
                </div>
            </div>

            <style>{`
                /* Card styling */
                :global(.p-card) {
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                }

                :global(.p-card .p-card-body) {
                    padding: 1.5rem;
                }

                /* Timeline styling */
                :global(.customized-timeline .p-timeline-event-content) {
                    padding: 0 1rem;
                }

                :global(.customized-timeline .p-timeline-event-opposite) {
                    flex: 0.5;
                }

                :global(.customized-timeline .p-card) {
                    margin-top: 0;
                }

                /* Tag styling */
                :global(.p-tag) {
                    border-radius: 8px;
                    font-weight: 600;
                }

                /* Button styling */
                :global(.p-button) {
                    border-radius: 8px;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }

                :global(.p-button:not(.p-button-text):hover) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                /* Divider */
                :global(.p-divider) {
                    margin: 1.5rem 0;
                }

                /* Shadow utilities */
                :global(.shadow-1) {
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                :global(.shadow-2) {
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
                }

                /* Scrollbar styling */
                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }

                ::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }

                ::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 4px;
                }

                ::-webkit-scrollbar-thumb:hover {
                    background: #a1a1a1;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    :global(.customized-timeline) {
                        padding: 0;
                    }

                    :global(.customized-timeline .p-timeline-event-opposite) {
                        display: none;
                    }
                }
            `}</style>
        </Layout>
    );
}