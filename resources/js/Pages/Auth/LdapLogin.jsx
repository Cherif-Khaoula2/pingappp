import { useEffect, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

export default function LdapLoginPage({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('ldap.login'));
    };

    return (
        <GuestLayout>
            <Head title="Connexion LDAP" />

            {/* Décorations de fond */}
            <div className="background-decorations">
                <div className="decoration-circle circle-1"></div>
                <div className="decoration-circle circle-2"></div>
                <div className="decoration-circle circle-3"></div>
            </div>

            {/* Conteneur principal du formulaire */}
            {/* J'ai déplacé les styles de largeur dans le CSS global pour utiliser la media query */}
            <div
                className="login-card-responsive surface-card p-6 shadow-2xl border-round-3xl w-full mx-auto relative z-10"
                style={{ padding: '2.5rem', marginTop: '1rem', marginBottom: '1rem' }}
            >
                <div className="login-card">
                    {/* Logo et titre */}
                    <div className="login-header">
                        <div className="logo-wrapper">
                            {/* Logo "To | sys" original */}
                            <div className="topbar-logo-split">
                                <span className="logo-part-blue">To</span>
                                <span className="logo-part-red">sys</span>
                            </div>
                        </div>
                        <h1 className="login-title">Connexion LDAP</h1>
                        <p className="login-subtitle">
                            <i className="pi pi-building mr-2"></i>
                            Connectez-vous avec votre compte Active Directory
                        </p>
                    </div>

                    {/* Message de statut (Succès) */}
                    {status && (
                        <div className="mb-4 p-3 border-round-lg bg-green-50 border-1 border-green-200">
                            <p className="text-green-700 text-sm m-0 flex align-items-center">
                                <i className="pi pi-check-circle mr-2"></i>{status}
                            </p>
                        </div>
                    )}

                    {/* Formulaire de connexion LDAP */}
                    <form onSubmit={submit} className="p-fluid">
                        <div className="mb-4">
                            <label htmlFor="username" className="block text-900 font-medium mb-2">
                                Nom d'utilisateur
                            </label>
                            <div className="p-inputgroup">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-user"></i>
                                </span>
                                <InputText
                                    id="username"
                                    type="text"
                                    className="w-full p-3 text-lg custom-input"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    autoComplete="username"
                                    aria-invalid={!!errors.username}
                                    aria-describedby="username-error"
                                    placeholder="prenom.nom"
                                />
                            </div>
                            <InputError message={errors.username} className="mt-2" id="username-error" />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="password" className="block text-900 font-medium mb-2">
                                Mot de passe
                            </label>
                            <div className="p-inputgroup">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-lock"></i>
                                </span>
                                <InputText
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="w-full p-3 text-lg custom-input"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="current-password"
                                    aria-invalid={!!errors.password}
                                    aria-describedby="password-error"
                                />
                               
                            </div>
                            <InputError message={errors.password} className="mt-2" id="password-error" />
                        </div>

                        {/* Bouton de connexion noir */}
                        <PrimaryButton
                            className="w-full p-3 text-center justify-content-center text-lg black-login-button transition-all transition-duration-300"
                            disabled={processing}
                        >
                            {processing ? (
                                <span className="flex align-items-center">
                                    <i className="pi pi-spin pi-spinner mr-2 text-xl"></i>
                                    Connexion en cours...
                                </span>
                            ) : (
                                <span className="flex align-items-center">
                                    <i className="pi pi-sign-in mr-2 text-xl"></i>
                                    Se connecter
                                </span>
                            )}
                        </PrimaryButton>
                    </form>

                    {/* Message d'erreur général */}
                    {errors.error && (
                        <div className="mt-4 p-3 border-round-lg bg-red-50 border-1 border-red-200 animate-fadein">
                            <p className="text-red-700 text-sm m-0 flex align-items-center">
                                <i className="pi pi-times-circle mr-2"></i>
                                {errors.error}
                            </p>
                        </div>
                    )}

                    {/* Message "Connexion sécurisée" */}
                    <div className="mt-5 text-center text-green-600 flex align-items-center justify-content-center text-sm">
                        <i className="pi pi-shield mr-2"></i>
                        Connexion sécurisée
                    </div>
                </div>
            </div>

            <style jsx global>{`
                /* --- Styles généraux et PC (Desktop) --- */
                html, body {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                    width: 100%;
                    background-color: #f7f9fc; /* Fond global très léger */
                }

                .guest-layout-wrapper {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    width: 100%;
                    padding: 20px; /* S'assurer que le formulaire ne colle pas aux bords sur les très grands écrans */
                }
                
                /* Style PC par défaut pour le formulaire */
                .login-card-responsive {
                    max-width: 420px; /* Largeur fixe pour PC */
                    border-radius: 2rem; /* Coins très arrondis pour PC */
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                    /* Assure la couleur de fond du cadre */
                    background-color: white; 
                }

                /* --- Styles Mobile (Appliqués lorsque la largeur est <= 640px) --- */
                @media (max-width: 640px) {
                    .guest-layout-wrapper {
                        /* Le formulaire doit prendre tout l'écran verticalement et horizontalement */
                        align-items: flex-start; /* Aligner en haut pour le mobile, si nécessaire */
                        padding: 0; /* Supprimer le padding global sur mobile */
                    }
                    
                    .login-card-responsive {
                        max-width: 100%; /* Prend toute la largeur */
                        width: 100%;
                        min-height: 100vh; /* Prend toute la hauteur de l'écran du téléphone */
                        margin: 0; /* Supprimer les marges */
                        padding: 2rem 1.5rem; /* Ajuster le padding intérieur */
                        border-radius: 0; /* Supprimer les coins arrondis pour remplir le cadre */
                        box-shadow: none; /* Supprimer l'ombre portée pour un effet plein écran */
                        /* Nous pouvons recentrer le contenu interne si la hauteur est suffisante */
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    }
                    
                    /* Si vous utilisez un fond coloré, l'arrière-plan du corps doit aussi être blanc sur mobile */
                    html, body {
                        background-color: white !important;
                    }
                    
                    /* Cacher les décorations de fond sur mobile si elles gênent */
                    .background-decorations {
                        display: none;
                    }
                }
                
                /* --- Décorations de fond (visibles uniquement sur PC) --- */
                .background-decorations {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    pointer-events: none;
                    z-index: 0;
                }

                .decoration-circle {
                    position: absolute;
                    border-radius: 50%;
                    opacity: 0.1;
                    filter: blur(80px);
                    background: linear-gradient(135deg, #a78bfa, #818cf8);
                }

                .circle-1 { width: 300px; height: 300px; top: -50px; left: -50px; }
                .circle-2 { width: 200px; height: 200px; bottom: -80px; right: -80px; background: linear-gradient(135deg, #fb7185, #f472b6); }
                .circle-3 { width: 250px; height: 250px; top: 40%; left: 20%; opacity: 0.05; background: linear-gradient(135deg, #60a5fa, #3b82f6); transform: rotate(45deg); }

                /* --- Les styles du logo et du bouton sont conservés ci-dessous --- */
                
                .login-header { text-align: center; margin-bottom: 2.5rem; }
                .logo-wrapper { margin-bottom: 1.5rem; }
                
                /* Styles du logo original "To | sys" */
                .topbar-logo-split {
                    display: inline-flex; align-items: center; font-family: 'Poppins', 'Inter', sans-serif;
                    font-weight: 900; font-size: 3rem; letter-spacing: -0.04em; user-select: none;
                    position: relative; transition: all 0.3s ease-in-out;
                }

                @media (min-width: 640px) { .topbar-logo-split { font-size: 3.5rem; } }

                .logo-part-blue {
                    background: linear-gradient(135deg, #1e3a8a, #2563eb);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
                    position: relative; padding-right: 3px;
                }

                .logo-part-blue::after {
                    content: ''; position: absolute; right: 0; top: 50%; transform: translateY(-50%);
                    width: 3px; height: 70%; background: linear-gradient(180deg, #ff7215, #f59352);
                }

                .logo-part-red {
                    background: linear-gradient(135deg, #f59352, #dc2626);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
                    padding-left: 3px;
                }

                /* Titre et sous-titre */
                .login-title { font-size: 2rem; font-weight: 700; color: #1f2937; margin: 0 0 0.5rem 0; }
                .login-subtitle { font-size: 0.95rem; color: #6b7280; margin: 0; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }

                /* Styles pour les InputText et InputGroup (inchangés) */
                .p-inputgroup-addon {
                    background-color: #f3f4f6; border: 1px solid #d1d5db; border-right: none;
                    border-radius: 6px 0 0 6px; padding: 0.75rem 1rem; display: flex; align-items: center;
                    justify-content: center; color: #6b7280; font-size: 1.1rem;
                }

                .p-inputtext.custom-input { border-radius: 0 6px 6px 0; border-left: none; padding-left: 0.75rem; transition: border-color 0.2s, box-shadow 0.2s; }
                .p-inputtext.custom-input:focus { outline: 0 none; outline-offset: 0; box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25); border-color: #6366f1; }

                .p-inputgroup .password-toggle-button {
                    background-color: transparent; color: #6b7280; border: 1px solid #d1d5db;
                    border-left: none; border-radius: 0 6px 66px 0; padding: 0.75rem 1rem; transition: background-color 0.2s;
                }

                .p-inputgroup .password-toggle-button:hover { background-color: #e5e7eb; color: #4b5563; }

                /* Style pour le bouton de connexion noir (conservé) */
                .black-login-button {
                    background-color: #1a1a1a; border: none; color: white; font-weight: 600;
                    border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); transition: all 0.3s ease-in-out;
                }

                .black-login-button:hover {
                    background-color: #000000; box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
                    transform: translateY(-2px);
                }

                .black-login-button:focus {
                    outline: 0 none; box-shadow: 0 0 0 0.2rem rgba(26, 26, 26, 0.5);
                }
            `}</style>
        </GuestLayout>
    );
}