import React from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';

export default function ResetPassword({ token, email }) {
  const { data, setData, post, processing, errors } = useForm({
    token: token,
    email: email,
    password: "",
    password_confirmation: "",
  });

  function handleSubmit(e) {
    e.preventDefault();
    post(route("password.update"));
  }

  return (
    <div className="flex align-items-center justify-content-center min-h-screen p-4">
      <Head title="Réinitialiser le mot de passe" />

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
            Nouveau mot de passe
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Choisissez un mot de passe sécurisé pour votre compte
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Champ mot de passe */}
            <div className="field mb-5">
              <label htmlFor="password" className="block text-gray-900 font-medium mb-2 text-sm">
                Nouveau mot de passe
              </label>
              <Password
                id="password"
                value={data.password}
                onChange={(e) => setData("password", e.target.value)}
                placeholder="Entrez votre mot de passe"
                className={`w-full ${errors.password ? 'p-invalid' : ''}`}
                inputClassName="w-full"
                promptLabel="Choisissez un mot de passe"
                weakLabel="Faible"
                mediumLabel="Moyen"
                strongLabel="Fort"
                disabled={processing}
              />
              {errors.password && (
                <small className="p-error block mt-2">{errors.password}</small>
              )}
            </div>

            {/* Champ confirmation */}
            <div className="field mb-5">
              <label htmlFor="password_confirmation" className="block text-gray-900 font-medium mb-2 text-sm">
                Confirmer le mot de passe
              </label>
              <Password
                id="password_confirmation"
                value={data.password_confirmation}
                onChange={(e) => setData("password_confirmation", e.target.value)}
                placeholder="Confirmez votre mot de passe"
                className={`w-full ${errors.password_confirmation ? 'p-invalid' : ''}`}
                inputClassName="w-full"
                feedback={false}
                disabled={processing}
              />
              {errors.password_confirmation && (
                <small className="p-error block mt-2">{errors.password_confirmation}</small>
              )}
            </div>

            {/* Erreur générale */}
            {errors.error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <i className="pi pi-exclamation-triangle text-red-600"></i>
                  <p className="text-red-800 text-sm m-0">{errors.error}</p>
                </div>
              </div>
            )}

            {/* Bouton submit */}
            <Button
              type="submit"
              label={processing ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
              className="w-full p-button-primary"
              loading={processing}
              disabled={processing}
            />
          </div>
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

        {/* Conseils de sécurité */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-start gap-3">
            <i className="pi pi-shield text-blue-600 text-sm mt-0.5"></i>
            <div>
              <p className="text-blue-900 text-xs font-medium m-0 mb-2">
                Conseils pour un mot de passe sécurisé :
              </p>
              <ul className="text-blue-800 text-xs leading-relaxed m-0 pl-4 space-y-1">
                <li>Au moins 8 caractères</li>
                <li>Lettres majuscules et minuscules</li>
                <li>Chiffres et caractères spéciaux</li>
                <li>Évitez les mots du dictionnaire</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style>{`
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
        :global(.p-inputtext),
        :global(.p-password input) {
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        :global(.p-inputtext:focus),
        :global(.p-password input:focus) {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        :global(.p-password) {
          width: 100%;
        }

        :global(.p-password input) {
          width: 100%;
        }

        :global(.p-password.p-invalid input) {
          border-color: #ef4444;
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

        /* Spacing */
        .space-y-5 > * + * {
          margin-top: 1.25rem;
        }

        .space-y-1 > * + * {
          margin-top: 0.25rem;
        }

        /* Messages d'erreur */
        :global(.p-error) {
          color: #ef4444;
          font-size: 0.75rem;
          font-weight: 500;
        }

        /* Password strength meter */
        :global(.p-password-meter) {
          margin-top: 0.5rem;
        }

        :global(.p-password-info) {
          margin-top: 0.5rem;
          font-size: 0.75rem;
        }

        /* Liens */
        a {
          text-decoration: none;
        }

        /* Accessibilité */
        :global(.p-button:focus) {
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
          outline: none;
        }
      `}</style>
    </div>
  );
}