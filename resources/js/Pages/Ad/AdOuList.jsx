import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';
import { Skeleton } from 'primereact/skeleton';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import Layout from '@/Layouts/layout/layout.jsx';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function AdOuList() {
    const { props } = usePage();
    const ous = props.ous || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOus, setFilteredOus] = useState(ous);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredOus(ous);
        } else {
            const filtered = ous.filter((ou) =>
                ou.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ou.DistinguishedName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredOus(filtered);
        }
    }, [searchTerm, ous]);

    const handleClick = (ouDn) => {
        setIsLoading(true);
        router.get(`/ad/ou-users/${encodeURIComponent(ouDn)}`, {}, {
            onFinish: () => setIsLoading(false)
        });
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    const getOuLevel = (dn) => {
        if (!dn) return 0;
        return (dn.match(/OU=/g) || []).length;
    };

    const getOuPath = (dn) => {
        if (!dn) return '';
        const parts = dn.split(',').filter(part => part.startsWith('OU='));
        return parts.map(p => p.replace('OU=', '')).reverse().join(' > ');
    };

    return (
        <Layout>
            <Head title="Unités Organisationnelles - Active Directory" />

            <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
                {/* En-tête */}
                <div className="mb-5">
                    <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center gap-3 mb-3">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-900 m-0 mb-2">
                                Unités Organisationnelles
                            </h1>
                            <p className="text-base text-600 m-0 flex align-items-center gap-2">
                                <i className="pi pi-sitemap text-sm"></i>
                                Gestion de la structure Active Directory • {ous.length} unités disponibles
                            </p>
                        </div>
                        <div className="flex align-items-center gap-2">
                            <Chip 
                                label={`${filteredOus.length} résultat${filteredOus.length > 1 ? 's' : ''}`} 
                                icon="pi pi-filter" 
                                className="bg-indigo-100 text-indigo-700"
                            />
                        </div>
                    </div>

                    {/* Barre de recherche */}
                    <Card className="shadow-3 border-round-xl border-1 surface-border">
                        <div className="flex flex-column md:flex-row gap-3">
                            <div className="flex-1">
                                <span className="p-input-icon-left w-full">
                                    <i className="pi pi-search" />
                                    <InputText
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Rechercher une unité organisationnelle..."
                                        className="w-full"
                                        style={{ paddingLeft: '2.5rem' }}
                                    />
                                </span>
                            </div>
                            {searchTerm && (
                                <Button
                                    label="Effacer"
                                    icon="pi pi-times"
                                    className="p-button-outlined p-button-secondary"
                                    onClick={clearSearch}
                                />
                            )}
                        </div>
                    </Card>
                </div>

                {/* Message si aucun résultat */}
                {filteredOus.length === 0 && searchTerm && (
                    <Message
                        severity="info"
                        text={`Aucune unité organisationnelle ne correspond à "${searchTerm}"`}
                        className="mb-4 w-full"
                    />
                )}

                {/* Liste des OUs */}
                {filteredOus.length > 0 ? (
                    <div className="grid">
                        {filteredOus.map((ou) => {
                            const level = getOuLevel(ou.DistinguishedName);
                            const path = getOuPath(ou.DistinguishedName);

                            return (
                                <div key={ou.DistinguishedName} className="col-12 sm:col-6 lg:col-4">
                                    <Card 
                                        className="shadow-3 border-round-xl hover:shadow-4 cursor-pointer h-full border-1 surface-border"
                                        onClick={() => handleClick(ou.DistinguishedName)}
                                    >
                                        <div className="flex flex-column gap-3">
                                            {/* En-tête avec icône */}
                                            <div className="flex align-items-start justify-content-between gap-3">
                                                <div className="flex align-items-start gap-3 flex-1 overflow-hidden">
                                                    <div className="bg-indigo-100 p-3 border-round-lg flex-shrink-0">
                                                        <i className="pi pi-folder text-indigo-600 text-2xl"></i>
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <h3 className="text-xl font-bold text-900 m-0 mb-1 truncate">
                                                            {ou.Name}
                                                        </h3>
                                                        {level > 0 && (
                                                            <Chip 
                                                                label={`Niveau ${level}`} 
                                                                className="text-xs"
                                                                style={{ 
                                                                    fontSize: '0.7rem',
                                                                    padding: '0.25rem 0.5rem'
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <i className="pi pi-angle-right text-600 text-xl flex-shrink-0"></i>
                                            </div>

                                            <Divider className="my-2" />

                                            {/* Chemin hiérarchique */}
                                            {path && (
                                                <div className="bg-gray-50 p-3 border-round-lg">
                                                    <p className="text-xs font-semibold text-600 mb-2 uppercase" style={{ letterSpacing: '0.5px' }}>
                                                        Chemin hiérarchique
                                                    </p>
                                                    <p className="text-sm text-700 m-0 font-medium flex align-items-center gap-2">
                                                        <i className="pi pi-sitemap text-xs text-indigo-500"></i>
                                                        {path}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Distinguished Name */}
                                            <div>
                                                <p className="text-xs font-semibold text-600 mb-2 uppercase" style={{ letterSpacing: '0.5px' }}>
                                                    Distinguished Name
                                                </p>
                                                <div className="bg-gray-100 p-2 border-round-md">
                                                    <p className="text-xs text-700 m-0 font-mono break-all">
                                                        {ou.DistinguishedName}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Bouton d'action */}
                                            <div className="pt-2">
                                                <Button
                                                    label="Voir les utilisateurs"
                                                    icon="pi pi-users"
                                                    className="w-full p-button-outlined p-button-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleClick(ou.DistinguishedName);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                ) : !searchTerm && ous.length === 0 ? (
                    /* État vide - Aucune OU disponible */
                    <Card className="shadow-3 border-round-xl border-1 surface-border">
                        <div className="text-center p-6">
                            <div className="bg-gray-100 w-6rem h-6rem flex align-items-center justify-content-center border-circle mx-auto mb-4">
                                <i className="pi pi-folder-open text-5xl text-400"></i>
                            </div>
                            <h3 className="text-xl font-bold text-900 mb-2">
                                Aucune unité organisationnelle
                            </h3>
                            <p className="text-600 mb-4">
                                Aucune unité organisationnelle n'a été trouvée dans Active Directory.
                            </p>
                            <Button
                                label="Actualiser"
                                icon="pi pi-refresh"
                                className="p-button-outlined"
                                onClick={() => router.reload()}
                            />
                        </div>
                    </Card>
                ) : null}

                {/* Informations complémentaires */}
                {filteredOus.length > 0 && (
                    <Card className="shadow-3 border-round-xl border-1 surface-border mt-4">
                        <div className="flex align-items-start gap-3">
                            <div className="bg-blue-100 p-2 border-round-lg">
                                <i className="pi pi-info-circle text-blue-600 text-xl"></i>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-base font-semibold text-900 m-0 mb-2">
                                    À propos des unités organisationnelles
                                </h4>
                                <p className="text-sm text-600 m-0 mb-2">
                                    Les unités organisationnelles (OU) permettent d'organiser hiérarchiquement les objets Active Directory. 
                                    Cliquez sur une unité pour afficher les utilisateurs qui lui sont associés.
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <Chip 
                                        label="Structure hiérarchique" 
                                        icon="pi pi-sitemap" 
                                        className="text-xs bg-indigo-50 text-indigo-700"
                                    />
                                    <Chip 
                                        label="Gestion centralisée" 
                                        icon="pi pi-shield" 
                                        className="text-xs bg-green-50 text-green-700"
                                    />
                                    <Chip 
                                        label="Délégation de droits" 
                                        icon="pi pi-key" 
                                        className="text-xs bg-orange-50 text-orange-700"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
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

                .p-card:hover {
                    transform: translateY(-2px);
                    transition: all 0.2s ease-in-out;
                }
                
                .p-inputtext {
                    border-radius: 0.5rem;
                    border-color: #d1d5db;
                    font-size: 0.9375rem;
                }
                
                .p-inputtext:enabled:focus {
                    box-shadow: 0 0 0 0.2rem rgba(79, 70, 229, 0.2);
                    border-color: #4f46e5;
                }
                
                .p-chip {
                    font-weight: 500;
                    border-radius: 0.375rem;
                }
                
                .surface-border {
                    border-color: #e5e7eb;
                }
                
                .font-mono {
                    font-family: 'Courier New', Courier, monospace;
                }
                
                @media (max-width: 768px) {
                    .p-card .p-card-body {
                        padding: 1rem;
                    }
                }
            `}</style>
        </Layout>
    );
}