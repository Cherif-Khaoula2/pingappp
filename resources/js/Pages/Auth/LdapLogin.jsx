import { useEffect, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import 'primereact/resources/themes/lara-light-indigo/theme.css';  // Thème
import 'primereact/resources/primereact.min.css';                   // Core CSS
import 'primeicons/primeicons.css';                                 // Icônes
import 'primeflex/primeflex.css';  
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

            {/* Container plein écran */}
            <div className="fullscreen-container">
                {/* Décorations de fond */}
                <div className="background-decorations">
                    <div className="decoration-circle circle-1"></div>
                    <div className="decoration-circle circle-2"></div>
                    <div className="decoration-circle circle-3"></div>
                </div>

                {/* Grid responsive - Mobile: col-12, Tablette: col-8, Desktop: col-6, Large: col-4 */}
                <div className="container-wrapper">
                    <div className="grid-container">
                        <div className="login-column">
                            <div className="login-card">
                                {/* Logo et titre */}
                                <div className="login-header">
                                    <div className="logo-wrapper">
                                        <div className="topbar-logo-split">
                                            <span className="logo-part-blue">To</span>
                                            <span className="logo-part-red">sys</span>
                                        </div>
                                    </div>
                                    <h1 className="login-title">Connexion LDAP</h1>
                                    <p className="login-subtitle">
                                        <i className="pi pi-building"></i>
                                        <span>Connectez-vous avec votre compte Active Directory</span>
                                    </p>
                                </div>

                                {/* Message de statut */}
                                {status && (
                                    <div className="status-message">
                                        <p className="status-text">
                                            <i className="pi pi-check-circle"></i>
                                            <span>{status}</span>
                                        </p>
                                    </div>
                                )}

                                {/* Formulaire de connexion LDAP */}
                                <form onSubmit={submit} className="login-form">
                                    <div className="form-field">
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
                                                placeholder="Prenom.nom"
                                            />
                                        </div>
                                        <InputError message={errors.username} className="error-message" id="username-error" />
                                    </div>

                                    <div className="form-field">
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
                                                placeholder="Mot de passe"
                                            />
                                        </div>
                                        <InputError message={errors.password} className="error-message" id="password-error" />
                                    </div>

                                    {/* Bouton de connexion */}
                                    <PrimaryButton
                                        className="submit-button"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <span className="button-content">
                                                <i className="pi pi-spin pi-spinner"></i>
                                                <span>Connexion en cours...</span>
                                            </span>
                                        ) : (
                                            <span className="button-content">
                                                <i className="pi pi-sign-in"></i>
                                                <span>Se connecter</span>
                                            </span>
                                        )}
                                    </PrimaryButton>
                                </form>

                                {/* Message d'erreur général */}
                                {errors.error && (
                                    <div className="error-banner">
                                        <p className="error-text">
                                            <i className="pi pi-times-circle"></i>
                                            <span>{errors.error}</span>
                                        </p>
                                    </div>
                                )}

                                {/* Message "Connexion sécurisée" */}
                                <div className="secure-message">
                                    <i className="pi pi-shield"></i>
                                    <span>Connexion sécurisée</span>
                                </div>
                            </div>
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

                /* Container plein écran */
                .fullscreen-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #e9dcfaff 0%, #fae4cfff 100%);
                    overflow-y: auto;
                    padding: 1rem;
                }

                /* Décorations de fond */
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
                    transition: all 0.3s ease;
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

                /* Wrapper principal */
                .container-wrapper {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                /* Grid système */
                .grid-container {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 1rem;
                    width: 100%;
                }

                /* Colonne de login - Responsive 
                   Mobile: 12/12 (100%)
                   Tablette: 10/12 (83%)
                   Desktop: 6/12 (50%)
                   Large Desktop: 4/12 (33%)
                */
                .login-column {
                    grid-column: span 12;
                    width: 100%;
                }

                /* Tablette (≥640px) - 10/12 colonnes centrées */
                @media (min-width: 640px) {
                    .login-column {
                        grid-column: 2 / span 10;
                    }
                    
                    .circle-1 {
                        width: 300px;
                        height: 300px;
                    }
                }

                /* Tablette large (≥768px) - 8/12 colonnes centrées */
                @media (min-width: 768px) {
                    .login-column {
                        grid-column: 3 / span 8;
                    }
                }

                /* Desktop (≥1024px) - 6/12 colonnes centrées */
                @media (min-width: 1024px) {
                    .login-column {
                        grid-column: 4 / span 6;
                    }
                    
                    .circle-2 {
                        width: 250px;
                        height: 250px;
                    }
                }

                /* Large desktop (≥1280px) - 4/12 colonnes centrées */
                @media (min-width: 1280px) {
                    .login-column {
                         grid-column: 4 / span 6;
                    }
                }

                /* Extra large (≥1536px) - 4/12 colonnes centrées */
                @media (min-width: 1536px) {
                    .login-column {
                        grid-column: 4 / span 6;
                    }
                }

                /* Carte de connexion */
                .login-card {
                    background: #ffffff;
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
                    width: 100%;
                }

                @media (min-width: 640px) {
                    .login-card {
                        border-radius: 20px;
                        padding: 2rem;
                    }
                }

                @media (min-width: 768px) {
                    .login-card {
                        padding: 2.5rem 2rem;
                    }
                }

                @media (min-width: 1024px) {
                    .login-card {
                        padding: 3rem 2.5rem;
                    }
                }

                /* En-tête du login */
                .login-header {
                    text-align: center;
                    margin-bottom: 1.5rem;
                }

                @media (min-width: 640px) {
                    .login-header {
                        margin-bottom: 2rem;
                    }
                }

                @media (min-width: 1024px) {
                    .login-header {
                        margin-bottom: 2.5rem;
                    }
                }

                .logo-wrapper {
                    margin-bottom: 1rem;
                }

                @media (min-width: 640px) {
                    .logo-wrapper {
                        margin-bottom: 1.5rem;
                    }
                }

                /* Logo "To | sys" */
                .topbar-logo-split {
                    display: inline-flex;
                    align-items: center;
                    font-family: 'Poppins', 'Inter', sans-serif;
                    font-weight: 900;
                    font-size: 2rem;
                    letter-spacing: -0.04em;
                    user-select: none;
                    position: relative;
                    transition: all 0.3s ease-in-out;
                }

                @media (min-width: 640px) {
                    .topbar-logo-split {
                        font-size: 2.5rem;
                    }
                }

                @media (min-width: 768px) {
                    .topbar-logo-split {
                        font-size: 3rem;
                    }
                }

                @media (min-width: 1024px) {
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
                    background: linear-gradient(180deg, #ff7215, #f59352);
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

                /* Titre */
                .login-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }

                @media (min-width: 640px) {
                    .login-title {
                        font-size: 1.5rem;
                    }
                }

                @media (min-width: 768px) {
                    .login-title {
                        font-size: 1.75rem;
                    }
                }

                @media (min-width: 1024px) {
                    .login-title {
                        font-size: 2rem;
                    }
                }

                /* Sous-titre */
                .login-subtitle {
                    font-size: 0.8rem;
                    color: #6b7280;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                @media (min-width: 640px) {
                    .login-subtitle {
                        font-size: 0.85rem;
                    }
                }

                @media (min-width: 768px) {
                    .login-subtitle {
                        font-size: 0.9rem;
                    }
                }

                @media (min-width: 1024px) {
                    .login-subtitle {
                        font-size: 1rem;
                    }
                }

                /* Formulaire */
                .login-form {
                    width: 100%;
                }

                .form-field {
                    margin-bottom: 1rem;
                }

                @media (min-width: 640px) {
                    .form-field {
                        margin-bottom: 1.25rem;
                    }
                }

                @media (min-width: 1024px) {
                    .form-field {
                        margin-bottom: 1.5rem;
                    }
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
                    width: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #9ca3af;
                    font-size: 1rem;
                    pointer-events: none;
                    z-index: 1;
                }

                @media (min-width: 640px) {
                    .input-icon {
                        width: 45px;
                        font-size: 1.1rem;
                    }
                }

                @media (min-width: 1024px) {
                    .input-icon {
                        width: 50px;
                        font-size: 1.2rem;
                    }
                }

                .custom-input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 40px !important;
                    font-size: 16px !important;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    background-color: #f9fafb;
                    transition: all 0.2s ease;
                }

                @media (min-width: 640px) {
                    .custom-input {
                        padding: 0.85rem 1rem 0.85rem 45px !important;
                        border-radius: 10px;
                    }
                }

                @media (min-width: 1024px) {
                    .custom-input {
                        padding: 1rem 1.25rem 1rem 50px !important;
                        border-radius: 12px;
                    }
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
                    font-size: 0.8rem;
                    margin-top: 0.4rem;
                }

                @media (min-width: 640px) {
                    .error-message {
                        font-size: 0.85rem;
                    }
                }

                @media (min-width: 1024px) {
                    .error-message {
                        font-size: 0.9rem;
                    }
                }

                /* Bouton de connexion */
                .submit-button {
                    width: 100%;
                    padding: 0.8rem 1.5rem;
                    margin-top: 0.5rem;
                    background-color: #1a1a1a;
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                @media (min-width: 640px) {
                    .submit-button {
                        padding: 0.9rem 1.5rem;
                        border-radius: 10px;
                        font-size: 1rem;
                    }
                }

                @media (min-width: 1024px) {
                    .submit-button {
                        padding: 1rem 1.5rem;
                        border-radius: 12px;
                        font-size: 1.05rem;
                    }
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
                    padding: 0.75rem 1rem;
                    background-color: #d1fae5;
                    border: 1px solid #6ee7b7;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }

                @media (min-width: 640px) {
                    .status-message {
                        padding: 0.85rem 1rem;
                        border-radius: 10px;
                    }
                }

                @media (min-width: 1024px) {
                    .status-message {
                        padding: 1rem 1.25rem;
                        border-radius: 12px;
                    }
                }

                .status-text {
                    color: #047857;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin: 0;
                }

                @media (min-width: 640px) {
                    .status-text {
                        font-size: 0.9rem;
                    }
                }

                @media (min-width: 1024px) {
                    .status-text {
                        font-size: 0.95rem;
                    }
                }

                /* Bannière d'erreur */
                .error-banner {
                    padding: 0.75rem 1rem;
                    background-color: #fee2e2;
                    border: 1px solid #fca5a5;
                    border-radius: 8px;
                    margin-top: 1rem;
                    animation: fadeIn 0.3s ease;
                }

                @media (min-width: 640px) {
                    .error-banner {
                        padding: 0.85rem 1rem;
                        border-radius: 10px;
                    }
                }

                @media (min-width: 1024px) {
                    .error-banner {
                        padding: 1rem 1.25rem;
                        border-radius: 12px;
                    }
                }

                .error-text {
                    color: #dc2626;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin: 0;
                }

                @media (min-width: 640px) {
                    .error-text {
                        font-size: 0.9rem;
                    }
                }

                @media (min-width: 1024px) {
                    .error-text {
                        font-size: 0.95rem;
                    }
                }

                /* Message sécurisé */
                .secure-message {
                    margin-top: 1.25rem;
                    text-align: center;
                    color: #059669;
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.4rem;
                }

                @media (min-width: 640px) {
                    .secure-message {
                        margin-top: 1.5rem;
                        font-size: 0.85rem;
                    }
                }

                @media (min-width: 1024px) {
                    .secure-message {
                        margin-top: 2rem;
                        font-size: 0.9rem;
                    }
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

                /* Ajustements pour très petits écrans */
                @media (max-width: 360px) {
                    .fullscreen-container {
                        padding: 0.5rem;
                    }
                    
                    .login-card {
                        padding: 1.25rem;
                    }
                    
                    .topbar-logo-split {
                        font-size: 1.75rem;
                    }
                    
                    .login-title {
                        font-size: 1.1rem;
                    }
                }
            `}</style>
        </GuestLayout>
    );
}