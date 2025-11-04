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
            <div
                className="surface-card p-6 shadow-2xl border-round-3xl w-full mx-auto relative z-10"
                style={{ maxWidth: '420px', padding: '2.5rem', marginTop: '1rem', marginBottom: '1rem' }}
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
                                    placeholder="************"
                                />
                                <Button
                                    type="button"
                                    icon={showPassword ? "pi pi-eye-slash" : "pi pi-eye"}
                                    className="p-button-text p-button-lg password-toggle-button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tooltip={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                    tooltipOptions={{ position: 'top' }}
                                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
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
                /* Réinitialisation de base pour s'assurer que les marges et paddings sont cohérents */
                html, body {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                    width: 100%;
                    background-color: #f7f9fc; /* Fond global très léger pour correspondre à l'image */
                }

                .guest-layout-wrapper { /* Assurez-vous que votre GuestLayout permet le plein écran */
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    width: 100%;
                }

                /* --- Décorations de fond --- */
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
                    opacity: 0.1; /* Plus subtil */
                    filter: blur(80px); /* Effet doux */
                    background: linear-gradient(135deg, #a78bfa, #818cf8); /* Dégradé violet-bleu doux */
                }

                .circle-1 {
                    width: 300px;
                    height: 300px;
                    top: -50px;
                    left: -50px;
                }
                .circle-2 {
                    width: 200px;
                    height: 200px;
                    bottom: -80px;
                    right: -80px;
                    background: linear-gradient(135deg, #fb7185, #f472b6); /* Dégradé rose */
                }
                .circle-3 {
                    width: 250px;
                    height: 250px;
                    top: 40%;
                    left: 20%;
                    opacity: 0.05; /* Encore plus subtil */
                    background: linear-gradient(135deg, #60a5fa, #3b82f6); /* Dégradé bleu */
                    transform: rotate(45deg);
                }

                @media (max-width: 768px) {
                    .decoration-circle {
                        filter: blur(50px);
                    }
                    .circle-1 { width: 200px; height: 200px; top: -30px; left: -30px; }
                    .circle-2 { width: 150px; height: 150px; bottom: -50px; right: -50px; }
                    .circle-3 { display: none; } /* On peut cacher certaines décorations sur mobile */
                }

                /* --- Login Card Styles --- */
                .login-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .logo-wrapper {
                    margin-bottom: 1.5rem;
                }

                /* Styles du logo original "To | sys" */
                .topbar-logo-split {
                    display: inline-flex;
                    align-items: center;
                    font-family: 'Poppins', 'Inter', sans-serif;
                    font-weight: 900;
                    font-size: 3rem; /* Défaut pour mobile */
                    letter-spacing: -0.04em;
                    user-select: none;
                    position: relative;
                    transition: all 0.3s ease-in-out;
                }

                @media (min-width: 640px) { /* sm */
                    .topbar-logo-split {
                        font-size: 3.5rem;
                    }
                }

                .logo-part-blue {
                    background: linear-gradient(135deg, #1e3a8a, #2563eb);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    position: relative;
                    padding-right: 3px;
                }

                .logo-part-blue::after {
                    content: '';
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 3px;
                    height: 70%;
                    background: linear-gradient(180deg, #ff7215, #f59352); /* Séparateur orange */
                }

                .logo-part-red {
                    background: linear-gradient(135deg, #f59352, #dc2626);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    padding-left: 3px;
                }

                .topbar-logo-split:hover .logo-part-blue {
                    animation: slideLeft 0.3s ease;
                }

                .topbar-logo-split:hover .logo-part-red {
                    animation: slideRight 0.3s ease;
                }

                @keyframes slideLeft {
                    50% { transform: translateX(-4px); }
                }

                @keyframes slideRight {
                    50% { transform: translateX(4px); }
                }

                /* Titre et sous-titre */
                .login-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0 0 0.5rem 0;
                }

                .login-subtitle {
                    font-size: 0.95rem;
                    color: #6b7280;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                /* Styles pour les InputText et InputGroup (inchangés) */
                .p-inputgroup-addon {
                    background-color: #f3f4f6; /* Fond légèrement gris pour l'icône */
                    border: 1px solid #d1d5db;
                    border-right: none;
                    border-radius: 6px 0 0 6px;
                    padding: 0.75rem 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #6b7280;
                    font-size: 1.1rem;
                }

                .p-inputtext.custom-input {
                    border-radius: 0 6px 6px 0; /* Coins arrondis seulement à droite */
                    border-left: none; /* Pas de bordure entre l'addon et l'input */
                    padding-left: 0.75rem; /* Ajuste le padding si l'addon est large */
                    transition: border-color 0.2s, box-shadow 0.2s;
                }

                .p-inputtext.custom-input:focus {
                    outline: 0 none;
                    outline-offset: 0;
                    box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25); /* Ombre focus violette */
                    border-color: #6366f1; /* Bordure focus violette */
                }

                .p-inputgroup .password-toggle-button {
                    background-color: transparent;
                    color: #6b7280;
                    border: 1px solid #d1d5db;
                    border-left: none;
                    border-radius: 0 6px 66px 0;
                    padding: 0.75rem 1rem;
                    transition: background-color 0.2s;
                }

                .p-inputgroup .password-toggle-button:hover {
                    background-color: #e5e7eb;
                    color: #4b5563;
                }

                /* Nouveau style pour le bouton de connexion noir */
                .black-login-button {
                    background-color: #1a1a1a; /* Noir très foncé */
                    border: none;
                    color: white;
                    font-weight: 600;
                    border-radius: 8px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* Ombre douce et sombre */
                    transition: all 0.3s ease-in-out;
                }

                .black-login-button:hover {
                    background-color: #000000; /* Noir pur au survol */
                    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
                    transform: translateY(-2px);
                }

                .black-login-button:focus {
                    outline: 0 none;
                    box-shadow: 0 0 0 0.2rem rgba(26, 26, 26, 0.5); /* Ombre focus noire */
                }

                /* Ajustement des messages d'erreur et de statut */
                .p-3 { padding: 1rem; }
                .border-round-lg { border-radius: 0.5rem; }
            `}</style>
        </GuestLayout>
    );
}