import { useEffect, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";

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

            <div className="flex align-items-center justify-content-center min-h-screen p-4">
                <div className="surface-card p-6 shadow-4 border-round-xl w-full" style={{maxWidth: '600px', padding: '2.5rem'}}>

                    {/* Header avec Logo */}
                    <div className="text-center mb-6">
                        <div className="topbar-logo mb-4">
                            <span className="logo-symbol">To</span>
                            <span className="logo-text">sys</span>
                        </div>
                        <h1 className="text-900 text-3xl font-semibold mb-2">Connexion LDAP</h1>
                        <p className="text-600">Connectez-vous avec votre compte LDAP</p>
                    </div>

                    {/* Message de statut */}
                    {status && (
                        <div className="mb-4 p-3 border-round bg-green-50 border-1 border-green-200">
                            <p className="text-green-700 text-sm m-0">{status}</p>
                        </div>
                    )}

                    {/* Formulaire de connexion LDAP */}
                    <form onSubmit={submit}>
                        <div className="mb-4">
                            <label htmlFor="username" className="block text-900 font-medium mb-2">
                                Nom d'utilisateur LDAP
                            </label>
                            <InputText
                                id="username"
                                type="text"
                                className="w-full p-3"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                autoComplete="username"
                            />
                            <InputError message={errors.username} className="mt-2" />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="block text-900 font-medium mb-2">
                                Mot de passe
                            </label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="w-full p-3"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="current-password"
                                />
                                <Button
                                    type="button"
                                    icon={showPassword ? "pi pi-eye-slash" : "pi pi-eye"}
                                    className="p-button-text"
                                    onClick={() => setShowPassword(!showPassword)}
                                />
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="flex align-items-center justify-content-end mb-5">
                            <Link
                                href={route('login')}
                                className="font-medium no-underline text-primary text-sm hover:underline"
                            >
                                Se connecter via compte local
                            </Link>
                        </div>

                        <PrimaryButton
                            className="w-full p-3 text-center justify-content-center"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <i className="pi pi-spin pi-spinner mr-2"></i>
                                    Connexion en cours...
                                </>
                            ) : (
                                <>
                                    <i className="pi pi-building mr-2"></i>
                                    Se connecter avec LDAP
                                </>
                            )}
                        </PrimaryButton>
                    </form>

                    {/* Message d'erreur général */}
                    {errors.error && (
                        <div className="mt-4 p-3 border-round bg-red-50 border-1 border-red-200">
                            <p className="text-red-700 text-sm m-0">{errors.error}</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .topbar-logo {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-family: 'Poppins', 'Inter', sans-serif;
                    font-weight: 700;
                    user-select: none;
                }

                .logo-symbol {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #155ecc, #6366f1);
                    color: white;
                    font-size: 1.4rem;
                    font-weight: 800;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                    transition: transform 0.2s ease;
                }

                .logo-symbol:hover {
                    transform: scale(1.05);
                }

                .logo-text {
                    font-size: 1.5rem;
                    letter-spacing: -0.02em;
                    background: linear-gradient(90deg, #0e4fa5, #6366f1);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                @media (max-width: 768px) {
                    .logo-text {
                        font-size: 1.3rem;
                    }
                }

                /* Amélioration des inputs */
                :global(.p-inputtext) {
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                    transition: all 0.2s ease;
                }

                :global(.p-inputtext:focus) {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                /* Amélioration des boutons */
                :global(.p-button) {
                    border-radius: 8px;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }

                :global(.p-button:not(.p-button-outlined)) {
                    background: linear-gradient(135deg, #155ecc, #6366f1);
                    border: none;
                }

                :global(.p-button:not(.p-button-outlined):hover:not(:disabled)) {
                    background: linear-gradient(135deg, #0e4fa5, #4f46e5);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }

                :global(.p-button-outlined) {
                    border-color: #e5e7eb;
                    color: #374151;
                }

                :global(.p-button-outlined:hover:not(:disabled)) {
                    background: #f9fafb;
                    border-color: #d1d5db;
                }

                /* Card shadow */
                :global(.shadow-4) {
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
                }
            `}</style>
        </GuestLayout>
    );
}