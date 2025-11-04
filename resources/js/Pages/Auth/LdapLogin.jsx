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

            {/* Container plein écran comme ABEX */}
            <div className="fullscreen-container">
                {/* Décorations de fond */}
                <div className="background-decorations">
                    <div className="decoration-circle circle-1"></div>
                    <div className="decoration-circle circle-2"></div>
                    <div className="decoration-circle circle-3"></div>
                </div>

                {/* Conteneur principal du formulaire - centré comme ABEX */}
                <div className="form-wrapper">
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
                            <div className="mb-4 status-message">
                                <p className="status-text">
                                    <i className="pi pi-check-circle mr-2"></i>{status}
                                </p>
                            </div>
                        )}

                        {/* Formulaire de connexion LDAP */}
                        <form onSubmit={submit} className="login-form">
                            <div className="form-field">
                                <label htmlFor="username" className="field-label">
                                    Nom d'utilisateur
                                </label>
                                <div className="input-wrapper">
                                    <span className="input-icon">
                                        <i className="pi pi-user"></i>
                                    </span>
                                    <InputText
                                        id="username"
                                        type="text"
                                        className="custom-input"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        autoComplete="username"
                                        aria-invalid={!!errors.username}
                                        aria-describedby="username-error"
                                        placeholder="prenom.nom"
                                    />
                                </div>
                                <InputError message={errors.username} className="error-message" id="username-error" />
                            </div>

                            <div className="form-field">
                                <label htmlFor="password" className="field-label">
                                    Mot de passe
                                </label>
                                <div className="input-wrapper">
                                    <span className="input-icon">
                                        <i className="pi pi-lock"></i>
                                    </span>
                                    <InputText
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        className="custom-input"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        autoComplete="current-password"
                                        aria-invalid={!!errors.password}
                                        aria-describedby="password-error"
                                    />
                                </div>
                                <InputError message={errors.password} className="error-message" id="password-error" />
                            </div>

                            {/* Bouton de connexion noir */}
                            <PrimaryButton
                                className="submit-button"
                                disabled={processing}
                            >
                                {processing ? (
                                    <span className="button-content">
                                        <i className="pi pi-spin pi-spinner mr-2"></i>
                                        Connexion en cours...
                                    </span>
                                ) : (
                                    <span className="button-content">
                                        <i className="pi pi-sign-in mr-2"></i>
                                        Se connecter
                                    </span>
                                )}
                            </PrimaryButton>
                        </form>

                        {/* Message d'erreur général */}
                        {errors.error && (
                            <div className="error-banner">
                                <p className="error-text">
                                    <i className="pi pi-times-circle mr-2"></i>
                                    {errors.error}
                                </p>
                            </div>
                        )}

                        {/* Message "Connexion sécurisée" */}
                        <div className="secure-message">
                            <i className="pi pi-shield mr-2"></i>
                            Connexion sécurisée
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                /* Reset de base */
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                body, html {
                    width: 100%;
                    height: 100%;
                    overflow-x: hidden;
                }

                /* Container plein écran - style ABEX */
                .fullscreen-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
                    overflow-y: auto;
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
                    opacity: 0.08;
                    filter: blur(60px);
                }

                .circle-1 {
                    width: 250px;
                    height: 250px;
                    top: -80px;
                    left: -80px;
                    background: linear-gradient(135deg, #a78bfa, #818cf8);
                }
                .circle-2 {
                    width: 200px;
                    height: 200px;
                    bottom: -60px;
                    right: -60px;
                    background: linear-gradient(135deg, #fb7185, #f472b6);
                }
                .circle-3 {
                    width: 180px;
                    height: 180px;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0.04;
                    background: linear-gradient(135deg, #60a5fa, #3b82f6);
                }

                /* Wrapper du formulaire - centré comme ABEX */
                .form-wrapper {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 420px;
                    padding: 1rem;
                }

                /* Carte de connexion */
                .login-card {
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 2.5rem 2rem;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
                }

                /* Adaptation mobile */
                @media (max-width: 768px) {
                    .form-wrapper {
                        max-width: 90%;
                        padding: 0.5rem;
                    }

                    .login-card {
                        padding: 2rem 1.5rem;
                        border-radius: 16px;
                    }
                }

                /* En-tête du login */
                .login-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .logo-wrapper {
                    margin-bottom: 1.2rem;
                }

                /* Logo "To | sys" */
                .topbar-logo-split {
                    display: inline-flex;
                    align-items: center;
                    font-family: 'Poppins', 'Inter', sans-serif;
                    font-weight: 900;
                    font-size: 2.8rem;
                    letter-spacing: -0.04em;
                    user-select: none;
                    position: relative;
                }

                @media (max-width: 768px) {
                    .topbar-logo-split {
                        font-size: 2.5rem;
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
                    background: linear-gradient(180deg, #ff7215, #f59352);
                }

                .logo-part-red {
                    background: linear-gradient(135deg, #f59352, #dc2626);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    padding-left: 3px;
                }

                /* Titre et sous-titre */
                .login-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }

                @media (max-width: 768px) {
                    .login-title {
                        font-size: 1.5rem;
                    }
                }

                .login-subtitle {
                    font-size: 0.9rem;
                    color: #6b7280;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                /* Formulaire */
                .login-form {
                    width: 100%;
                }

                .form-field {
                    margin-bottom: 1.25rem;
                }

                .field-label {
                    display: block;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }

                /* Input wrapper */
                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    width: 100%;
                }

                .input-icon {
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 45px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #9ca3af;
                    font-size: 1.1rem;
                    pointer-events: none;
                    z-index: 1;
                }

                .custom-input {
                    width: 100%;
                    padding: 0.85rem 1rem 0.85rem 45px !important;
                    font-size: 16px !important;
                    border: 1px solid #d1d5db;
                    border-radius: 10px;
                    background-color: #f9fafb;
                    transition: all 0.2s ease;
                }

                .custom-input:focus {
                    outline: none;
                    border-color: #6366f1;
                    background-color: #ffffff;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .custom-input::placeholder {
                    color: #9ca3af;
                }

                /* Message d'erreur */
                .error-message {
                    color: #dc2626;
                    font-size: 0.85rem;
                    margin-top: 0.4rem;
                }

                /* Bouton de connexion */
                .submit-button {
                    width: 100%;
                    padding: 0.9rem 1.5rem;
                    margin-top: 0.5rem;
                    background-color: #1a1a1a;
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .submit-button:hover:not(:disabled) {
                    background-color: #000000;
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
                    transform: translateY(-2px);
                }

                .submit-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .button-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                /* Messages de statut */
                .status-message {
                    padding: 0.85rem 1rem;
                    background-color: #d1fae5;
                    border: 1px solid #6ee7b7;
                    border-radius: 10px;
                    margin-bottom: 1rem;
                }

                .status-text {
                    color: #047857;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    margin: 0;
                }

                /* Bannière d'erreur */
                .error-banner {
                    padding: 0.85rem 1rem;
                    background-color: #fee2e2;
                    border: 1px solid #fca5a5;
                    border-radius: 10px;
                    margin-top: 1rem;
                    animation: fadeIn 0.3s ease;
                }

                .error-text {
                    color: #dc2626;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    margin: 0;
                }

                /* Message sécurisé */
                .secure-message {
                    margin-top: 1.5rem;
                    text-align: center;
                    color: #059669;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.4rem;
                }

                /* Animation */
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Utilities */
                .mr-2 {
                    margin-right: 0.5rem;
                }

                .mb-4 {
                    margin-bottom: 1rem;
                }
            `}</style>
        </GuestLayout>
    );
}