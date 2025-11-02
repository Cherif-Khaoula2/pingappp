import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

export default function ForgotPassword({ status }) {
  const { data, setData, post, processing, reset, errors } = useForm({
    email: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('password.email'), {
      onSuccess: () => reset('email'),
    });
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen p-4">
<div className="surface-card p-6 shadow-4 border-round-xl w-full" style={{maxWidth: '600px', padding: '2.5rem'}}>
                    
          {/* Logo et Header */}
          <div className="text-center mb-8">
            <div className="text-center mb-6">
                        <div className="topbar-logo mb-4">
                            <span className="logo-symbol">T</span>
                            <span className="logo-text">osys</span>
                        </div>
                    </div>
            <h1 className="text-gray-900 text-2xl font-semibold mb-2">
              Réinitialisation du mot de passe
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Entrez votre adresse email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {/* Message de succès */}
          {status && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <i className="pi pi-check-circle text-green-600"></i>
                <p className="text-green-800 text-sm m-0">{status}</p>
              </div>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            <div className="field mb-6">
              <label htmlFor="email" className="block text-gray-900 font-medium mb-2 text-sm">
                Adresse email
              </label>
              <InputText
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                className={`w-full ${errors.email ? 'p-invalid' : ''}`}
                disabled={processing}
              />
              {errors.email && (
                <small className="p-error block mt-2">{errors.email}</small>
              )}
            </div>

            <Button
              type="submit"
              label={processing ? "Envoi en cours..." : "Envoyer le lien"}
              className="w-full p-button-primary"
              loading={processing}
              disabled={processing}
            />
          </form>

          {/* Lien de retour */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <Link
              href={route('login')}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium inline-flex items-center gap-2 transition-colors"
            >
              <i className="pi pi-arrow-left text-xs"></i>
              Retour à la connexion
            </Link>
          </div>

          {/* Note informative */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-start gap-3">
              <i className="pi pi-info-circle text-blue-600 text-sm mt-0.5"></i>
              <p className="text-blue-900 text-xs leading-relaxed m-0">
                Le lien de réinitialisation sera valide pendant 5 minutes. 
                Si vous ne recevez pas l'email, vérifiez votre dossier spam.
              </p>
            </div>
          </div>
        </div>

    

     <style >{`
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
    </div>
  );
}