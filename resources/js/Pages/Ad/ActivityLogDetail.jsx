import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { Timeline } from 'primereact/timeline';
import { Chip } from 'primereact/chip';
import Layout from "@/Layouts/layout/layout.jsx";
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function ActivityLogDetail({ log }) {
    const { auth } = usePage().props;

    const ACTION_CONFIGS = {
        login: { 
            icon: 'pi-sign-in', 
            severity: 'info', 
            label: 'Connexion', 
            color: '#2563eb'
        },
        logout: { 
            icon: 'pi-sign-out', 
            severity: null, 
            label: 'Déconnexion', 
            color: '#64748b'
        },
        block_user: { 
            icon: 'pi-lock', 
            severity: 'danger', 
            label: 'Blocage utilisateur', 
            color: '#dc2626'
        },
        unblock_user: { 
            icon: 'pi-unlock', 
            severity: 'success', 
            label: 'Déblocage utilisateur', 
            color: '#16a34a'
        },
        reset_password: { 
            icon: 'pi-refresh', 
            severity: 'warning', 
            label: 'Réinitialisation mot de passe', 
            color: '#d97706'
        },
        create_user: { 
            icon: 'pi-user-plus', 
            severity: 'help', 
            label: 'Création utilisateurAD', 
            color: '#7c3aed'
        },
        create_exchange_mailbox: { 
            icon: 'pi-user-plus', 
            severity: 'help', 
            label: 'Création utilisateurExchange', 
            color: '#7c3aed'
        },
        search_user: { 
            icon: 'pi-search', 
            severity: 'info', 
            label: 'Recherche utilisateur', 
            color: '#0284c7'
        },
        search_user_result: { 
            icon: 'pi-list', 
            severity: 'info', 
            label: 'Résultats de recherche', 
            color: '#0ea5e9'
        },
        create_dn: { 
            icon: 'pi-folder-plus', 
            severity: 'success', 
            label: 'Création DN', 
            color: '#059669'
        },
        update_dn: { 
            icon: 'pi-pencil', 
            severity: 'warning', 
            label: 'Modification DN', 
            color: '#f59e0b'
        },
        delete_dn: { 
            icon: 'pi-trash', 
            severity: 'danger', 
            label: 'Suppression DN', 
            color: '#b91c1c'
        },
        assign_dns_to_user: { 
            icon: 'pi-link', 
            severity: 'info', 
            label: 'Affectation DNs', 
            color: '#2563eb'
        },
        assign_dn_to_users: { 
            icon: 'pi-user-plus', 
            severity: 'success', 
            label: 'Ajout utilisateurs DN', 
            color: '#10b981'
        },
        unassign_dn_from_users: { 
            icon: 'pi-user-minus', 
            severity: 'danger', 
            label: 'Retrait utilisateurs DN', 
            color: '#dc2626'
        },
        hide_account: { 
            icon: 'pi-eye-slash', 
            severity: 'warning', 
            label: 'Masquage', 
            color: '#fbbf24'
        },
        unhide_account: { 
            icon: 'pi-eye', 
            severity: 'success', 
            label: 'Démasquage', 
            color: '#22c55e'
        },
        authorize_ldap_user: { 
            icon: 'pi-user-plus', 
            severity: 'success', 
            label: 'Autorisation', 
            color: '#0d9488'
        },
        unauthorize_ldap_user: { 
            icon: 'pi-user-minus', 
            severity: 'danger', 
            label: 'Désautorisation', 
            color: '#e11d48'
        },
         update_user: { 
                icon: ' pi-pencil', 
                severity: null, 
                label: 'Modification utilisateur', 
                color: '#2a1de1ff'
            },
    };

    const getActionConfig = (action) => {
        return ACTION_CONFIGS[action] || { 
            icon: 'pi-question', 
            severity: null, 
            label: action, 
            color: '#6b7280' 
        };
    };

    const parseDetails = (details) => {
        if (!details) return null;
        if (typeof details === 'string') {
            try {
                return JSON.parse(details);
            } catch (e) {
                return null;
            }
        }
        return details;
    };

    const actionConfig = log ? getActionConfig(log.action) : null;
    const additionalDetails = log ? parseDetails(log.additional_details) : null;

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

    const customizedMarker = (item) => (
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

    const customizedContent = (item) => (
        <Card className="shadow-1 border-1 border-200">
            <div className="flex flex-column gap-2">
                <div className="text-900 font-semibold text-lg word-break">{item.status}</div>
                <div className="text-700 word-break">{item.description}</div>
                {item.detail && (
                    <div className="text-600 text-sm word-break">
                        <i className="pi pi-info-circle mr-2"></i>
                        {item.detail}
                    </div>
                )}
            </div>
        </Card>
    );

    const InfoCard = ({ icon, iconBg, iconColor, label, value, secondary }) => (
        <div className="surface-50 border-round-lg p-4 h-full">
            <div className="flex align-items-center gap-3 mb-3">
                <div 
                    className={`inline-flex align-items-center justify-content-center border-circle ${iconBg}`}
                    style={{ width: '48px', height: '48px' }}
                >
                    <i className={`pi ${icon} text-2xl ${iconColor}`}></i>
                </div>
                <span className="text-600 font-semibold text-sm md:text-base">{label}</span>
            </div>
            <div className="text-900 font-bold text-lg md:text-xl mb-1 word-break">
                {value}
            </div>
            {secondary && (
                <div className="text-600 text-sm word-break">{secondary}</div>
            )}
        </div>
    );

    const DetailItem = ({ icon, iconColor, label, value, type = 'text' }) => (
        <div className="col-12 md:col-6">
            <div className="surface-100 border-round-lg p-3">
                <div className="flex align-items-center gap-2 mb-2">
                    <i className={`pi ${icon} ${iconColor}`}></i>
                    <span className="text-600 font-semibold text-sm">{label}</span>
                </div>
                {type === 'tag' ? (
                    <Tag 
                        value={value === 'enabled' ? 'Actif' : 'Bloqué'}
                        severity={value === 'enabled' ? 'success' : 'danger'}
                    />
                ) : (
                    <div className="text-900 font-bold word-break">{value}</div>
                )}
            </div>
        </div>
    );

    if (!log) {
        return (
            <Layout>
                <Head title="Log introuvable" />
                <div className="grid">
                    <div className="col-12">
                        <Card className="shadow-2">
                            <div className="text-center py-8">
                                <i className="pi pi-exclamation-triangle text-400 mb-4" style={{ fontSize: '4rem' }}></i>
                                <h2 className="text-900 text-xl md:text-3xl font-bold mb-3">Log introuvable</h2>
                                <p className="text-600 text-base md:text-lg mb-4">Le log demandé n'existe pas ou a été supprimé</p>
                                <Link href="/ad/activity-logs">
                                    <Button 
                                        icon="pi pi-arrow-left" 
                                        label="Retour aux logs"
                                        className="gradient-btn"
                                    />
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Head title={`Log #${log.id}`} />

            <div className="grid">
                {/* Back Button */}
                <div className="col-12 mb-3">
                    <Link href="/ad/activity-logs">
                        <Button 
                            icon="pi pi-arrow-left" 
                            label="Retour aux logs"
                            text
                            className="back-btn"
                        />
                    </Link>
                </div>

                {/* Header Card */}
                <div className="col-12">
                    <Card className="shadow-2 mb-4">
                        <div className="flex flex-column md:flex-row align-items-start justify-content-between gap-4 mb-4">
                            <div className="flex align-items-center gap-3 md:gap-4 w-full md:w-auto">
                                <div 
                                    className="inline-flex align-items-center justify-content-center border-circle flex-shrink-0" 
                                    style={{ 
                                        width: '56px', 
                                        height: '56px',
                                        background: `linear-gradient(135deg, ${actionConfig.color}, ${actionConfig.color}dd)`
                                    }}
                                >
                                    <i className={`pi ${actionConfig.icon} text-3xl md:text-4xl text-white`}></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap align-items-center gap-2 mb-2">
                                        <h1 className="text-900 text-xl md:text-2xl lg:text-3xl font-bold m-0 word-break">
                                            Log : {log.target_user}
                                        </h1>
                                        <Tag 
                                            icon={log.status === 'success' ? 'pi pi-check-circle' : 'pi pi-times-circle'}
                                            value={log.status === 'success' ? 'Réussi' : 'Échoué'} 
                                            severity={log.status === 'success' ? 'success' : 'danger'}
                                            className="flex-shrink-0"
                                        />
                                    </div>
                                    <p className="text-600 text-base md:text-lg m-0 word-break">
                                        {actionConfig.label}
                                    </p>
                                </div>
                            </div>

                            <Tag 
                                icon={`pi ${actionConfig.icon}`}
                                value={actionConfig.label} 
                                severity={actionConfig.severity}
                                className="action-tag flex-shrink-0"
                            />
                        </div>

                        <Divider />

                        {/* Info Grid */}
                        <div className="grid mt-4">
                            <div className="col-12 md:col-6 lg:col-4">
                                <InfoCard 
                                    icon="pi-clock"
                                    iconBg="bg-blue-100"
                                    iconColor="text-blue-600"
                                    label="Date et heure"
                                    value={new Date(log.created_at).toLocaleDateString('fr-FR', { 
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                    secondary={new Date(log.created_at).toLocaleTimeString('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    })}
                                />
                            </div>

                            <div className="col-12 md:col-6 lg:col-4">
                                <InfoCard 
                                    icon="pi-user"
                                    iconBg="bg-purple-100"
                                    iconColor="text-purple-600"
                                    label="Utilisateur ciblé"
                                    value={log.target_user || 'N/A'}
                                    secondary={log.target_user_name}
                                />
                            </div>

                            <div className="col-12 md:col-6 lg:col-4">
                                <InfoCard 
                                    icon="pi-users"
                                    iconBg="bg-green-100"
                                    iconColor="text-green-600"
                                    label="Effectué par"
                                    value={log.performed_by_name || 'N/A'}
                                    secondary={log.performer?.email}
                                />
                            </div>

                            <div className="col-12 md:col-6 lg:col-4">
                                <InfoCard 
                                    icon="pi-globe"
                                    iconBg="bg-orange-100"
                                    iconColor="text-orange-600"
                                    label="Adresse IP"
                                    value={log.ip_address || 'Non disponible'}
                                />
                            </div>

                            <div className="col-12 md:col-12 lg:col-8">
                                <div className="surface-50 border-round-lg p-4 h-full">
                                    <div className="flex align-items-center gap-3 mb-3">
                                        <div 
                                            className="inline-flex align-items-center justify-content-center border-circle bg-indigo-100" 
                                            style={{ width: '48px', height: '48px' }}
                                        >
                                            <i className="pi pi-desktop text-2xl text-indigo-600"></i>
                                        </div>
                                        <span className="text-600 font-semibold text-sm md:text-base">User Agent</span>
                                    </div>
                                    <div className="text-900 text-xs md:text-sm font-mono word-break-all">
                                        {log.user_agent || 'Non disponible'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Additional Details */}
                {additionalDetails && Object.keys(additionalDetails).length > 0 && (
                    <div className="col-12">
                        <Card className="shadow-2 mb-4">
                            <h2 className="text-900 text-xl md:text-2xl font-bold mb-4 flex align-items-center gap-3">
                                <div 
                                    className="inline-flex align-items-center justify-content-center border-circle flex-shrink-0" 
                                    style={{ 
                                        width: '40px', 
                                        height: '40px',
                                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)'
                                    }}
                                >
                                    <i className="pi pi-info-circle text-xl text-white"></i>
                                </div>
                                <span className="word-break">Détails supplémentaires</span>
                            </h2>
                            <Divider />
                            <div className="grid">
                                {additionalDetails.email && (
                                    <DetailItem 
                                        icon="pi-envelope"
                                        iconColor="text-blue-600"
                                        label="Email"
                                        value={additionalDetails.email}
                                    />
                                )}

                                {additionalDetails.dn && (
                                    <div className="col-12">
                                        <div className="surface-100 border-round-lg p-3">
                                            <div className="flex align-items-center gap-2 mb-2">
                                                <i className="pi pi-sitemap text-purple-600"></i>
                                                <span className="text-600 font-semibold text-sm">Distinguished Name</span>
                                            </div>
                                            <div className="text-900 font-mono text-xs md:text-sm word-break-all">
                                                {additionalDetails.dn}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {additionalDetails.found_users && additionalDetails.found_users.length > 0 && (
                                    <div className="col-12">
                                        <div className="surface-100 border-round-lg p-3">
                                            <div className="flex align-items-center gap-2 mb-3">
                                                <i className="pi pi-users text-cyan-600"></i>
                                                <span className="text-600 font-semibold text-sm">
                                                    Utilisateurs trouvés ({additionalDetails.results_count || 0})
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {additionalDetails.found_users.map((sam, index) => (
                                                    <Chip 
                                                        key={index}
                                                        label={sam}
                                                        icon="pi pi-user"
                                                        className="user-chip"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {additionalDetails.search_query && (
                                    <DetailItem 
                                        icon="pi-search"
                                        iconColor="text-orange-600"
                                        label="Requête de recherche"
                                        value={additionalDetails.search_query}
                                    />
                                )}

                                {additionalDetails.results_count !== undefined && (
                                    <DetailItem 
                                        icon="pi-hashtag"
                                        iconColor="text-green-600"
                                        label="Nombre de résultats"
                                        value={additionalDetails.results_count}
                                    />
                                )}

                                {additionalDetails.previous_status && (
                                    <DetailItem 
                                        icon="pi-history"
                                        iconColor="text-indigo-600"
                                        label="Statut précédent"
                                        value={additionalDetails.previous_status}
                                        type="tag"
                                    />
                                )}

                                {additionalDetails.method && (
                                    <DetailItem 
                                        icon="pi-cog"
                                        iconColor="text-gray-600"
                                        label="Méthode"
                                        value={additionalDetails.method}
                                    />
                                )}

                                {additionalDetails.direction && (
                                    <DetailItem 
                                        icon="pi-building"
                                        iconColor="text-teal-600"
                                        label="Direction"
                                        value={additionalDetails.direction}
                                    />
                                )}
                            </div>
                        </Card>
                    </div>
                )}

                {/* Error Message */}
                {log.status === 'failed' && log.error_message && (
                    <div className="col-12">
                        <Card className="shadow-2 mb-4 error-card">
                            <div className="flex flex-column md:flex-row align-items-start gap-4">
                                <div 
                                    className="inline-flex align-items-center justify-content-center border-circle bg-red-100 flex-shrink-0" 
                                    style={{ width: '56px', height: '56px' }}
                                >
                                    <i className="pi pi-exclamation-circle text-3xl text-red-600"></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-900 text-lg md:text-xl font-bold mb-3 flex align-items-center gap-2">
                                        <i className="pi pi-times-circle text-red-600"></i>
                                        Message d'erreur
                                    </h2>
                                    <div className="surface-50 border-round-lg p-3 md:p-4">
                                        <p className="text-900 m-0 line-height-3 word-break text-sm md:text-base">
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
                        <h2 className="text-900 text-xl md:text-2xl font-bold mb-4 flex align-items-center gap-3">
                            <div 
                                className="inline-flex align-items-center justify-content-center border-circle flex-shrink-0" 
                                style={{ 
                                    width: '40px', 
                                    height: '40px',
                                    background: 'linear-gradient(135deg, #667eea, #764ba2)'
                                }}
                            >
                                <i className="pi pi-history text-xl text-white"></i>
                            </div>
                            <span className="word-break">Timeline de l'action</span>
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

                {/* Summary */}
                <div className="col-12">
                    <Card className="shadow-2">
                        <h2 className="text-900 text-lg md:text-xl font-bold mb-4 flex align-items-center gap-2">
                            <i className="pi pi-chart-bar text-purple-600"></i>
                            Résumé de l'opération
                        </h2>
                        <Divider />
                        <div className="grid">
                            <div className="col-12 md:col-4">
                                <div className="text-center p-3 md:p-4 border-round-lg surface-50">
                                    <i className="pi pi-calendar text-3xl md:text-4xl text-blue-600 mb-3"></i>
                                    <div className="text-600 text-xs md:text-sm mb-1">Horodatage</div>
                                    <div className="text-900 font-bold text-sm md:text-base word-break">
                                        {new Date(log.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 md:col-4">
                                <div className="text-center p-3 md:p-4 border-round-lg surface-50">
                                    <i className={`pi ${actionConfig.icon} text-3xl md:text-4xl mb-3`} style={{ color: actionConfig.color }}></i>
                                    <div className="text-600 text-xs md:text-sm mb-1">Type d'action</div>
                                    <div className="text-900 font-bold text-sm md:text-base word-break">{actionConfig.label}</div>
                                </div>
                            </div>
                            <div className="col-12 md:col-4">
                                <div className="text-center p-3 md:p-4 border-round-lg surface-50">
                                    <i className={`pi ${log.status === 'success' ? 'pi-check-circle' : 'pi-times-circle'} text-3xl md:text-4xl mb-3`} 
                                       style={{ color: log.status === 'success' ? '#10b981' : '#ef4444' }}></i>
                                    <div className="text-600 text-xs md:text-sm mb-1">Résultat</div>
                                    <div className="text-900 font-bold text-sm md:text-base">{log.status === 'success' ? 'Succès' : 'Échec'}</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <style>{`
                /* Word Breaking */
                .word-break {
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    word-break: break-word;
                    hyphens: auto;
                }

                .word-break-all {
                    word-break: break-all;
                    overflow-wrap: anywhere;
                }

                /* Cards */
                :global(.p-card) {
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                }

                :global(.p-card .p-card-body) {
                    padding: 1.25rem;
                }

                /* Buttons */
                .gradient-btn {
                    background: linear-gradient(135deg, #667eea, #764ba2) !important;
                    border: none !important;
                }

                .back-btn {
                    color: #6366f1 !important;
                }

                :global(.p-button) {
                    border-radius: 8px;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }

                :global(.p-button:not(.p-button-text):hover) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                /* Tags */
                :global(.p-tag) {
                    border-radius: 8px;
                    font-weight: 600;
                    padding: 0.5rem 1rem;
                }

                .action-tag {
                    font-size: 0.875rem;
                    padding: 0.75rem 1.25rem;
                }

                /* Chips */
                .user-chip {
                    background-color: #dbeafe !important;
                    color: #1e40af !important;
                    font-weight: 600;
                }

                /* Error Card */
                .error-card {
                    border-left: 4px solid #ef4444;
                }

                /* Timeline */
                :global(.customized-timeline .p-timeline-event-content) {
                    padding: 0 1rem;
                }

                :global(.customized-timeline .p-timeline-event-opposite) {
                    flex: 0.5;
                }

                :global(.customized-timeline .p-card) {
                    margin-top: 0;
                }

                /* Shadows */
                :global(.shadow-1) {
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                :global(.shadow-2) {
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
                }

                /* Divider */
                :global(.p-divider) {
                    margin: 1.25rem 0;
                }

                /* Scrollbar */
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

                /* Tablet Responsive */
                @media (max-width: 1024px) {
                    :global(.p-card .p-card-body) {
                        padding: 1rem;
                    }
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    :global(.p-card .p-card-body) {
                        padding: 0.875rem;
                    }

                    .action-tag {
                        font-size: 0.75rem;
                        padding: 0.5rem 0.875rem;
                        width: 100%;
                        justify-content: center;
                    }

                    :global(.p-tag) {
                        font-size: 0.75rem;
                        padding: 0.375rem 0.75rem;
                    }

                    :global(.customized-timeline) {
                        padding: 0;
                    }

                    :global(.customized-timeline .p-timeline-event-opposite) {
                        display: none;
                    }

                    :global(.customized-timeline .p-timeline-event-content) {
                        padding: 0 0.5rem;
                    }

                    h1, h2, h3 {
                        word-break: break-word;
                    }

                    .surface-50 {
                        padding: 0.75rem !important;
                    }
                }

                /* Small Mobile */
                @media (max-width: 480px) {
                    :global(.p-card .p-card-body) {
                        padding: 0.75rem;
                    }

                    :global(.p-button) {
                        width: 100%;
                        justify-content: center;
                    }

                    :global(.p-divider) {
                        margin: 1rem 0;
                    }
                }

                /* Utility Classes */
                .flex-shrink-0 {
                    flex-shrink: 0;
                }

                .min-w-0 {
                    min-width: 0;
                }

                .overflow-hidden {
                    overflow: hidden;
                }

                /* Smooth Transitions */
                * {
                    transition: padding 0.2s ease, margin 0.2s ease;
                }

                /* Focus States for Accessibility */
                :global(.p-button:focus),
                :global(.p-tag:focus) {
                    outline: 2px solid #6366f1;
                    outline-offset: 2px;
                }

                /* Print Styles */
                @media print {
                    .shadow-1,
                    .shadow-2 {
                        box-shadow: none !important;
                        border: 1px solid #e5e7eb !important;
                    }

                    :global(.p-button) {
                        display: none;
                    }

                    .back-btn {
                        display: none;
                    }
                }
            `}</style>
        </Layout>
    );
}